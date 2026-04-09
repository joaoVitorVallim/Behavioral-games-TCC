import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { sessionService } from '../services/sessionService'
import type { PlayerInfoOption } from '../types'

const PLAYER_FIELD_LABEL_DICTIONARY_PT: Record<string, string> = {
  educationLevel: 'Escolaridade',
  semester: 'Semestre',
  course: 'Curso',
  age: 'Idade',
  gender: 'Gênero',
  profession: 'Profissão',
  nickname: 'Apelido',
  name: 'Nome',
  email: 'E-mail'
}

const humanize_field_label = (field_name: string): string =>
  field_name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (char) => char.toUpperCase())

export const usePlayerFields = () => {
  const player_fields_query = useQuery({
    queryKey: ['player-fields-valid'],
    queryFn: () => sessionService.getValidPlayerFields(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })

  const player_field_options = useMemo<PlayerInfoOption[]>(() => {
    const values = player_fields_query.data ?? []
    const unique_values = Array.from(new Set(values))

    return unique_values.map((value) => ({
      value,
      label: PLAYER_FIELD_LABEL_DICTIONARY_PT[value] ?? humanize_field_label(value)
    }))
  }, [player_fields_query.data])

  return {
    player_field_options,
    is_loading: player_fields_query.isLoading || player_fields_query.isFetching,
    is_error: player_fields_query.isError,
    refetch: player_fields_query.refetch
  }
}
