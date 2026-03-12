import { useMutation } from '@tanstack/react-query'
import { sessionService } from '../services/sessionService'
import type { CreateSessionPayload } from '../types'

export const useCreateSession = () => {
  const create_mutation = useMutation({
    mutationFn: (payload: CreateSessionPayload) => sessionService.createSession(payload)
  })

  return {
    createSession: create_mutation.mutateAsync,
    is_creating: create_mutation.isPending,
    is_success: create_mutation.isSuccess,
    is_error: create_mutation.isError,
    session_data: create_mutation.data ?? null,
    reset: create_mutation.reset
  }
}
