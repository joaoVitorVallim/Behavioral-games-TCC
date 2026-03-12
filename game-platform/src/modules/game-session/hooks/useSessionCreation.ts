import { useReducer, useMemo, useRef, useEffect } from 'react'
import type { CreateConfigPayload, GameConfig } from '../types'
import { MOCK_CONFIGS, generateMockCode, buildDefaultConfig } from '../mocks/configs.mock'

// ── State ──

interface SessionCreationState {
  session_name: string
  selected_game: string
  input_info: string[]
  config_mode: 'select' | 'create'
  selected_config_id: string
  new_config: CreateConfigPayload
  saved_configs: GameConfig[]
  config_saved: boolean
  show_code_modal: boolean
  session_code: string
}

const initial_state: SessionCreationState = {
  session_name: '',
  selected_game: 'cards',
  input_info: ['nickname'],
  config_mode: 'create',
  selected_config_id: '',
  new_config: buildDefaultConfig('cards'),
  saved_configs: MOCK_CONFIGS,
  config_saved: false,
  show_code_modal: false,
  session_code: ''
}

// ── Actions ──

export type SessionAction =
  | { type: 'SET_SESSION_NAME'; payload: string }
  | { type: 'SET_GAME'; payload: string }
  | { type: 'TOGGLE_PLAYER_INFO'; payload: string }
  | { type: 'SET_CONFIG_MODE'; payload: 'select' | 'create' }
  | { type: 'SELECT_CONFIG'; payload: string }
  | { type: 'UPDATE_NEW_CONFIG'; payload: CreateConfigPayload }
  | { type: 'SAVE_CONFIG' }
  | { type: 'CLEAR_CONFIG_SAVED' }
  | { type: 'CREATE_SESSION' }
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
        new_config: buildDefaultConfig(action.payload)
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

    case 'SELECT_CONFIG':
      return { ...state, selected_config_id: action.payload }

    case 'UPDATE_NEW_CONFIG':
      return { ...state, new_config: action.payload }

    case 'SAVE_CONFIG': {
      if (!state.new_config.configName) return state
      const new_saved: GameConfig = {
        ...state.new_config,
        id: crypto.randomUUID(),
        game: state.selected_game,
        createdAt: new Date().toISOString()
      }
      return {
        ...state,
        saved_configs: [...state.saved_configs, new_saved],
        config_saved: true,
        config_mode: 'select',
        selected_config_id: new_saved.id
      }
    }

    case 'CLEAR_CONFIG_SAVED':
      return { ...state, config_saved: false }

    case 'CREATE_SESSION':
      return {
        ...state,
        session_code: generateMockCode(),
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
  const config_saved_timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup config_saved timer on unmount
  useEffect(() => {
    return () => {
      if (config_saved_timer.current) {
        clearTimeout(config_saved_timer.current)
      }
    }
  }, [])

  // Auto-clear config_saved feedback after 3s
  useEffect(() => {
    if (state.config_saved) {
      config_saved_timer.current = setTimeout(() => {
        dispatch({ type: 'CLEAR_CONFIG_SAVED' })
      }, 3000)
    }
    return () => {
      if (config_saved_timer.current) {
        clearTimeout(config_saved_timer.current)
      }
    }
  }, [state.config_saved])

  // ── Derived values (memoized) ──

  const configs_for_game = useMemo(
    () => state.saved_configs.filter((c) => c.game === state.selected_game),
    [state.saved_configs, state.selected_game]
  )

  const selected_config = useMemo(
    () => state.saved_configs.find((c) => c.id === state.selected_config_id) ?? null,
    [state.saved_configs, state.selected_config_id]
  )

  const active_config: CreateConfigPayload | null = useMemo(() => {
    if (state.config_mode === 'select') {
      if (!selected_config) return null
      const { id: _id, createdAt: _createdAt, ...config_payload } = selected_config
      return config_payload
    }
    return state.new_config.configName ? state.new_config : null
  }, [state.config_mode, selected_config, state.new_config])

  const can_create_session = useMemo(
    () =>
      state.session_name.trim() !== '' &&
      state.input_info.length > 0 &&
      active_config !== null,
    [state.session_name, state.input_info, active_config]
  )

  return {
    state,
    dispatch,
    configs_for_game,
    selected_config,
    active_config,
    can_create_session
  }
}
