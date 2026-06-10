const channelEnvironment = {
  email: {
    mode: 'smtp_or_graph_mail_dry_run',
    targetEnv: 'TRACS_NOTIFICATION_EMAIL_TARGET',
    required: ['TRACS_NOTIFICATION_EMAIL_TARGET'],
  },
  teams: {
    mode: 'teams_webhook_dry_run',
    targetEnv: 'TRACS_NOTIFICATION_TEAMS_WEBHOOK_URL',
    required: ['TRACS_NOTIFICATION_TEAMS_WEBHOOK_URL'],
  },
  sharepoint_folder: {
    mode: 'sharepoint_folder_dry_run',
    targetEnv: 'TRACS_NOTIFICATION_SHAREPOINT_FOLDER',
    required: ['TRACS_NOTIFICATION_SHAREPOINT_FOLDER'],
  },
}

function channelStatus(channel) {
  const profile = channelEnvironment[channel]
  if (!profile) {
    return {
      channel,
      status: 'blocking',
      mode: 'dry_run',
      target: 'unsupported',
      evidence: `${channel} is not a supported notification delivery channel.`,
    }
  }
  const missing = profile.required.filter((name) => !process.env[name])
  return {
    channel,
    status: missing.length > 0 ? 'warning' : 'pass',
    mode: 'dry_run',
    target: process.env[profile.targetEnv] ? profile.targetEnv : `missing ${profile.targetEnv}`,
    evidence:
      missing.length > 0
        ? `${channel} delivery dry-run prepared; missing environment reference(s): ${missing.join(', ')}.`
        : `${channel} delivery dry-run prepared using ${profile.targetEnv}.`,
  }
}

export function runNotificationDeliveryDryRun(payload) {
  const deliveredAt = new Date().toISOString()
  const channels = payload.channels?.length ? payload.channels : ['email', 'teams', 'sharepoint_folder']
  const channelResults = channels.map(channelStatus)
  const status = channelResults.some((result) => result.status === 'blocking')
    ? 'blocking'
    : channelResults.some((result) => result.status === 'warning')
      ? 'warning'
      : 'pass'

  return {
    deliveryId: payload.deliveryId ?? `notification_delivery:${deliveredAt}`,
    deliveredAt,
    status,
    channelResults,
    evidence: `${channels.length} notification channel dry-run(s) prepared for ${payload.source ?? 'unknown source'} without sending external messages.`,
  }
}
