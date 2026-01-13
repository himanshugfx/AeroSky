import axios from 'axios'
import { useAuthStore } from './store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout()
            if (typeof window !== 'undefined') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

// Auth API
export const authApi = {
    login: (email: string, password: string) =>
        api.post('/auth/login', new URLSearchParams({ username: email, password }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }),
    register: (data: { email: string; password: string; full_name: string }) =>
        api.post('/auth/register', data),
    me: (token?: string) => api.get('/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
    }),
}

// Drones API
export const dronesApi = {
    list: (params?: { skip?: number; limit?: number; status?: string }) =>
        api.get('/drones', { params }),
    listModels: () => api.get('/drones/models'),
    createModel: (data: any) => api.post('/drones/models', data),
    get: (id: string) => api.get(`/drones/${id}`),
    create: (data: any) => api.post('/drones', data),
    update: (id: string, data: any) => api.patch(`/drones/${id}`, data),
    generateUin: (data: any) => api.post('/drones/generate-uin', data),
    activate: (id: string) => api.post(`/drones/${id}/activate`),
}

// Pilots API
export const pilotsApi = {
    list: (params?: { skip?: number; limit?: number }) =>
        api.get('/pilots', { params }),
    get: (id: string) => api.get(`/pilots/${id}`),
    create: (data: any) => api.post('/pilots', data),
}

// Maintenance API
export const maintenanceApi = {
    list: (params?: { skip?: number; limit?: number }) =>
        api.get('/maintenance', { params }),
    create: (data: any) => api.post('/maintenance', data),
}

// Flights API
export const flightsApi = {
    listPlans: (params?: { skip?: number; limit?: number; status?: string; drone_id?: string }) =>
        api.get('/flights/plans', { params }),
    getPlan: (id: string) => api.get(`/flights/plans/${id}`),
    createPlan: (data: any) => api.post('/flights/plans', data),
    updatePlan: (id: string, data: any) => api.patch(`/flights/plans/${id}`, data),
    validateNpnt: (data: { drone_id: string; pilot_id: string; flight_plan_id: string }) =>
        api.post('/flights/validate-npnt', data),
    validateZone: (data: { latitude: number; longitude: number; altitude_ft?: number }) =>
        api.post('/flights/validate-zone', data),
    ingestLogs: (data: any) => api.post('/flights/logs/ingest', data),
    getSummary: (planId: string) => api.get(`/flights/plans/${planId}/summary`),
    startFlight: (planId: string) => api.post(`/flights/plans/${planId}/start`),
    completeFlight: (planId: string) => api.post(`/flights/plans/${planId}/complete`),
}
