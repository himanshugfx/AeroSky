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
    setAuth: (user: User, token: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            setAuth: (user, token) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('access_token', token)
                }
                set({ user, accessToken: token, isAuthenticated: true })
            },
            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('access_token')
                }
                set({ user: null, accessToken: null, isAuthenticated: false })
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
        }
    )
)
