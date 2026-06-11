import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const channelEnvironment = {
  email: {
    displayName: 'Email',
    dryRunTargetEnv: 'TRACS_NOTIFICATION_EMAIL_TARGET',
    liveRequired: ['TRACS_NOTIFICATION_EMAIL_TARGET', 'TRACS_GRAPH_TOKEN'],
    mode: 'graph_mail',
  },
  teams: {
    displayName: 'Teams',
    dryRunTargetEnv: 'TRACS_NOTIFICATION_TEAMS_WEBHOOK_URL',
    liveRequired: ['TRACS_NOTIFICATION_TEAMS_WEBHOOK_URL'],
    mode: 'teams_webhook',
  },
  sharepoint_folder: {
    displayName: 'SharePoint folder',
    dryRunTargetEnv: 'TRACS_NOTIFICATION_SHAREPOINT_FOLDER',
    liveRequired: ['TRACS_NOTIFICATION_SHAREPOINT_FOLDER'],
    mode: 'sharepoint_folder_json',
  },
}

function liveDeliveryEnabled(channel) {
  if (process.env.TRACS_NOTIFICATION_LIVE_DELIVERY !== 'true') return false
  const channelKey = channel.toUpperCase()
  return process.env[`TRACS_NOTIFICATION_${channelKey}_LIVE`] !== 'false'
}

function missingEnvironment(names) {
  return names.filter((name) => !process.env[name])
}

function sanitizeFileName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90) || 'notification'
}

function notificationText(payload) {
  return [
    payload.subject,
    '',
    payload.summary,
    '',
    `Source: ${payload.source ?? 'unknown'}`,
    `Delivery ID: ${payload.deliveryId}`,
    `Recipients: ${(payload.recipients ?? []).join(', ') || 'not specified'}`,
  ].join('\n')
}

async function postJson(url, body, headers = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`HTTP ${response.status}: ${detail.slice(0, 240)}`)
  }
}

async function deliverEmail(payload) {
  const sender = process.env.TRACS_NOTIFICATION_EMAIL_SENDER
  const token = process.env.TRACS_GRAPH_TOKEN
  const recipients = (payload.recipients?.length ? payload.recipients : [process.env.TRACS_NOTIFICATION_EMAIL_TARGET])
    .filter(Boolean)
    .map((address) => ({
      emailAddress: {
        address,
      },
    }))
  const sendMailPath = sender
    ? `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`
    : 'https://graph.microsoft.com/v1.0/me/sendMail'

  await postJson(
    sendMailPath,
    {
      message: {
        subject: payload.subject,
        body: {
          contentType: 'Text',
          content: notificationText(payload),
        },
        toRecipients: recipients,
      },
      saveToSentItems: false,
    },
    {
      authorization: `Bearer ${token}`,
    },
  )

  return {
    target: 'TRACS_NOTIFICATION_EMAIL_TARGET',
    evidence: `Email sent through Microsoft Graph to ${recipients.length} recipient(s).`,
  }
}

async function deliverTeams(payload) {
  await postJson(process.env.TRACS_NOTIFICATION_TEAMS_WEBHOOK_URL, {
    text: notificationText(payload),
  })
  return {
    target: 'TRACS_NOTIFICATION_TEAMS_WEBHOOK_URL',
    evidence: 'Teams webhook accepted the notification payload.',
  }
}

async function deliverSharePointFolder(payload, deliveredAt) {
  const folder = process.env.TRACS_NOTIFICATION_SHAREPOINT_FOLDER
  await mkdir(folder, { recursive: true })
  const fileName = `${sanitizeFileName(payload.subject)}-${deliveredAt.replace(/[:.]/g, '-')}.json`
  const filePath = join(folder, fileName)
  await writeFile(
    filePath,
    JSON.stringify(
      {
        ...payload,
        deliveredAt,
        deliveryMode: 'live',
      },
      null,
      2,
    ),
  )
  return {
    target: 'TRACS_NOTIFICATION_SHAREPOINT_FOLDER',
    evidence: `Notification payload written to ${filePath}.`,
  }
}

async function deliverChannel(channel, payload, deliveredAt, forceDryRun) {
  const profile = channelEnvironment[channel]
  if (!profile) {
    return {
      channel,
      status: 'blocking',
      mode: 'skipped',
      target: 'unsupported',
      evidence: `${channel} is not a supported notification delivery channel.`,
    }
  }

  const dryRunMissing = missingEnvironment([profile.dryRunTargetEnv])
  const liveMissing = missingEnvironment(profile.liveRequired)
  const canLiveDeliver = !forceDryRun && liveDeliveryEnabled(channel)

  if (!canLiveDeliver) {
    return {
      channel,
      status: dryRunMissing.length > 0 ? 'warning' : 'pass',
      mode: 'dry_run',
      target: process.env[profile.dryRunTargetEnv] ? profile.dryRunTargetEnv : `missing ${profile.dryRunTargetEnv}`,
      evidence:
        dryRunMissing.length > 0
          ? `${profile.displayName} delivery dry-run prepared; missing environment reference(s): ${dryRunMissing.join(', ')}.`
          : `${profile.displayName} delivery dry-run prepared using ${profile.dryRunTargetEnv}. Set TRACS_NOTIFICATION_LIVE_DELIVERY=true to send.`,
    }
  }

  if (liveMissing.length > 0) {
    return {
      channel,
      status: 'warning',
      mode: 'skipped',
      target: `missing ${liveMissing.join(', ')}`,
      evidence: `${profile.displayName} live delivery was enabled but skipped because required environment reference(s) are missing: ${liveMissing.join(', ')}.`,
    }
  }

  try {
    const result =
      channel === 'email'
        ? await deliverEmail(payload)
        : channel === 'teams'
          ? await deliverTeams(payload)
          : await deliverSharePointFolder(payload, deliveredAt)
    return {
      channel,
      status: 'pass',
      mode: 'live',
      target: result.target,
      evidence: result.evidence,
    }
  } catch (error) {
    return {
      channel,
      status: 'blocking',
      mode: 'live',
      target: profile.dryRunTargetEnv,
      evidence: `${profile.displayName} live delivery failed: ${error.message}`,
    }
  }
}

export async function runNotificationDelivery(payload, { forceDryRun = false } = {}) {
  const deliveredAt = new Date().toISOString()
  const channels = payload.channels?.length ? payload.channels : ['email', 'teams', 'sharepoint_folder']
  const channelResults = await Promise.all(
    channels.map((channel) => deliverChannel(channel, payload, deliveredAt, forceDryRun)),
  )
  const status = channelResults.some((result) => result.status === 'blocking')
    ? 'blocking'
    : channelResults.some((result) => result.status === 'warning')
      ? 'warning'
      : 'pass'
  const liveChannels = channelResults.filter((result) => result.mode === 'live').length
  const dryRunChannels = channelResults.filter((result) => result.mode === 'dry_run').length

  return {
    deliveryId: payload.deliveryId ?? `notification_delivery:${deliveredAt}`,
    deliveredAt,
    status,
    channelResults,
    evidence:
      liveChannels > 0
        ? `${liveChannels} live notification channel(s) executed and ${dryRunChannels} dry-run channel(s) prepared for ${payload.source ?? 'unknown source'}.`
        : `${channels.length} notification channel dry-run(s) prepared for ${payload.source ?? 'unknown source'} without sending external messages.`,
  }
}

export function runNotificationDeliveryDryRun(payload) {
  return runNotificationDelivery(payload, { forceDryRun: true })
}

export function createNotificationSmokeFixtures({ channels = ['email', 'teams'] } = {}) {
  const generatedAt = new Date().toISOString()
  return channels.map((channel) => ({
    deliveryId: `notification_smoke:${channel}:${generatedAt}`,
    generatedAt,
    source: 'report_catalog',
    channels: [channel],
    recipients: process.env.TRACS_NOTIFICATION_EMAIL_TARGET
      ? [process.env.TRACS_NOTIFICATION_EMAIL_TARGET]
      : ['tenant-approved-recipient@example.com'],
    subject: `TRACS ${channel} delivery smoke fixture`,
    summary:
      'Tenant-approved smoke fixture for validating guarded notification delivery. Live sends require TRACS_NOTIFICATION_LIVE_DELIVERY=true and channel-specific endpoint variables.',
    evidence: {
      fixtureType: 'tenant_notification_smoke',
      channel,
      liveGate: process.env.TRACS_NOTIFICATION_LIVE_DELIVERY === 'true',
      generatedAt,
    },
  }))
}

export async function runNotificationSmokeFixtures(options = {}) {
  const fixtures = createNotificationSmokeFixtures(options)
  const results = []
  for (const fixture of fixtures) {
    results.push({
      fixture,
      result: await runNotificationDelivery(fixture),
    })
  }
  const status = results.some((entry) => entry.result.status === 'blocking')
    ? 'blocking'
    : results.some((entry) => entry.result.status === 'warning')
      ? 'warning'
      : 'pass'
  return {
    smokeId: `notification_smoke:${new Date().toISOString()}`,
    status,
    fixtures,
    results,
    evidence: `${results.length} tenant notification smoke fixture(s) executed through guarded delivery adapters.`,
  }
}
