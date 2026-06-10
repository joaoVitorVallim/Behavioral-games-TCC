interface SessionLike {
  session_name?: string | null
  settings?: { configName?: string | null } | null
}

export const get_session_label = (session: SessionLike | null | undefined): string => {
  if (!session) return '—'

  const session_name = session.session_name?.trim()
  if (session_name) return session_name

  const config_name = session.settings?.configName?.trim()
  if (config_name) return config_name

  return '—'
}
