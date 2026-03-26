import { useReducer, useMemo } from 'react'
import type { CreateConfigPayload } from '../types'

// ── State ──

interface SessionCreationState {
  session_name: string
  selected_game: string
  input_info: string[]
  config_mode: 'select' | 'create'
  selected_config_id: string
  new_config: CreateConfigPayload
  show_code_modal: boolean
  session_code: string
}

const build_initial_config = (game: string): CreateConfigPayload => ({
  configName: '',
  game,
  userViewPoints: true,
  limitRounds: 10
})

const initial_state: SessionCreationState = {
  session_name: '',
  selected_game: '',
  input_info: ['nickname'],
  config_mode: 'select',
  selected_config_id: '',
  new_config: build_initial_config(''),
  show_code_modal: false,
  session_code: ''
}

// ── Actions ──

export type SessionAction =
  | { type: 'SET_SESSION_NAME'; payload: string }
  | { type: 'SET_GAME'; payload: string }
  | { type: 'TOGGLE_PLAYER_INFO'; payload: string }
  | { type: 'SET_CONFIG_MODE'; payload: 'select' | 'create' }
  | { type: 'SYNC_CONFIG_MODE_FOR_EMPTY_LIST'; payload: boolean }
  | { type: 'SELECT_CONFIG'; payload: string }
  | { type: 'UPDATE_NEW_CONFIG'; payload: CreateConfigPayload }
  | { type: 'OPEN_SESSION_MODAL'; payload: string }
  | { type: 'CLOSE_MODAL' }

// ── Reducer ──

function session_reducer(state: SessionCreationState, action: SessionAction): SessionCreationState {
  switch (action.type) {
    case 'SET_SESSION_NAME':
      return { ...state, session_name: action.payload }

    case 'SET_GAME':
      return {
        ...state,
        selected_game: action.payload,
        selected_config_id: '',
        new_config: build_initial_config(action.payload)
      }

    case 'TOGGLE_PLAYER_INFO': {
      const field = action.payload
      const input_info = state.input_info.includes(field)
        ? state.input_info.filter((f) => f !== field)
        : [...state.input_info, field]
      return { ...state, input_info }
    }

    case 'SET_CONFIG_MODE':
      return { ...state, config_mode: action.payload }

    case 'SYNC_CONFIG_MODE_FOR_EMPTY_LIST':
      return {
        ...state,
        config_mode: action.payload ? 'create' : state.config_mode
      }

    case 'SELECT_CONFIG':
      return { ...state, selected_config_id: action.payload }

    case 'UPDATE_NEW_CONFIG':
      return { ...state, new_config: action.payload }

    case 'OPEN_SESSION_MODAL':
      return {
        ...state,
        session_code: action.payload,
        show_code_modal: true
      }

    case 'CLOSE_MODAL':
      return { ...state, show_code_modal: false }

    default:
      return state
  }
}

// ── Hook ──

export function useSessionCreation() {
  const [state, dispatch] = useReducer(session_reducer, initial_state)

  // ── Derived values (memoized) ──

  const can_create_session = useMemo(
    () => state.session_name.trim() !== '' && state.input_info.length > 0,
    [state.session_name, state.input_info]
  )

  return {
    state,
    dispatch,
    can_create_session
  }
}
