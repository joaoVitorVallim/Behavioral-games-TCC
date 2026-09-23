import { api_client } from '../../../infrastructure/api/api-client'

export async function sendMatchResultByEmail(
  sessionId: string,
  matchId: string,
  email: string
): Promise<void> {
  await api_client.post(`/sessions/${sessionId}/matches/${matchId}/report/email`, {
    emails: [email]
  })
}

export async function sendSessionReportByEmail(sessionId: string, email: string): Promise<void> {
  await api_client.post(`/sessions/${sessionId}/report/email`, {
    emails: [email]
  })
}
