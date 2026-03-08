/**
 * Constantes com os campos opcionais do Player
 * Estes são os únicos campos que podem ser adicionados ao inputInfos
 */
export const PLAYER_OPTIONAL_FIELDS = [
  'apelido',
  'curso',
  'idade',
  'genero',
  'profissao',
] as const;

export const PLAYER_OPTIONAL_FIELDS_LABELS = {
  apelido: 'Apelido',
  curso: 'Curso',
  idade: 'Idade',
  genero: 'Gênero',
  profissao: 'Profissão',
};

export type PlayerOptionalField = typeof PLAYER_OPTIONAL_FIELDS[number];

/**
 * Verifica se um campo é um campo opcional válido do Player
 * @param field - Campo a validar
 * @returns true se é um campo válido, false caso contrário
 */
export function isValidPlayerField(field: any): field is PlayerOptionalField {
  return PLAYER_OPTIONAL_FIELDS.includes(field);
}
