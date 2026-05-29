import { useMutation } from '@tanstack/react-query'
import { sessionService } from '../services/sessionService'
import type { JoinSessionPayload, JoinSessionResponse } from '../types'

export const useJoinSession = (_session_id: string) => {
  const join_mutation = useMutation<JoinSessionResponse, Error, JoinSessionPayload>({
    mutationFn: (payload: JoinSessionPayload) =>
      sessionService.joinSession(payload)
  })

  return {
    joinSession: join_mutation.mutate,
    is_joining: join_mutation.isPending,
    is_success: join_mutation.isSuccess,
    is_error: join_mutation.isError,
    data: join_mutation.data
  }
}
