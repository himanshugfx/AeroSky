import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
})

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token')
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
    me: () => api.get('/auth/me'),
}

// Drones API
export const dronesApi = {
    list: (params?: { skip?: number; limit?: number; status?: string }) =>
        api.get('/drones', { params }),
    get: (id: string) => api.get(`/drones/${id}`),
    create: (data: any) => api.post('/drones', data),
    update: (id: string, data: any) => api.patch(`/drones/${id}`, data),
    generateUin: (data: any) => api.post('/drones/generate-uin', data),
    activate: (id: string) => api.post(`/drones/${id}/activate`),
}

// Flights API
export const flightsApi = {
    listPlans: (params?: { skip?: number; limit?: number; status?: string }) =>
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
