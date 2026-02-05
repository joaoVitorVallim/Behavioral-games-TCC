import { useMutation } from '@tanstack/react-query'
import { sessionService } from '../services/sessionService'
import type { JoinSessionPayload } from '../types'

export const useJoinSession = (session_id: string) => {
  const join_mutation = useMutation({
    mutationFn: (payload: JoinSessionPayload) => 
      sessionService.joinSession(session_id, payload)
  })

  return {
    joinSession: join_mutation.mutate,
    is_joining: join_mutation.isPending,
    is_success: join_mutation.isSuccess,
    is_error: join_mutation.isError
  }
}
