import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    id: string
    email: string
    full_name: string
    role: string
    organization_id?: string
}

interface AuthState {
    user: User | null
    accessToken: string | null
    isAuthenticated: boolean
    _hydrated: boolean
    setAuth: (user: User, token: string) => void
    setHydrated: () => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            _hydrated: false,
            setAuth: (user, token) => {
                set({ user, accessToken: token, isAuthenticated: true })
            },
            setHydrated: () => {
                set({ _hydrated: true })
            },
            logout: () => {
                set({ user: null, accessToken: null, isAuthenticated: false })
            },
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHydrated()
            },
        }
    )
)
