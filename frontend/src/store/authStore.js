import { create } from 'zustand'

const STORAGE_KEY = 'jangle_auth'

const readStoredAuth = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const persistAuth = (state) => {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      currentUser: state.currentUser,
    }),
  )
}

const clearAuthStorage = () => {
  window.localStorage.removeItem(STORAGE_KEY)
}

const storedAuth = typeof window !== 'undefined' ? readStoredAuth() : null

export const useAuthStore = create((set) => ({
  currentUser: storedAuth?.currentUser ?? null,
  accessToken: storedAuth?.accessToken ?? null,
  refreshToken: storedAuth?.refreshToken ?? null,
  setAuth: ({ accessToken, refreshToken, currentUser }) =>
    set((state) => {
      const nextState = {
        ...state,
        accessToken: accessToken ?? state.accessToken,
        refreshToken: refreshToken ?? state.refreshToken,
        currentUser: currentUser ?? state.currentUser,
      }
      persistAuth(nextState)
      return nextState
    }),
  clearAuth: () =>
    set(() => {
      clearAuthStorage()
      return {
        currentUser: null,
        accessToken: null,
        refreshToken: null,
      }
    }),
}))
