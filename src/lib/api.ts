import axios from 'axios'
import { useAuthStore } from './store'

// Mock Data
const MOCK_USER = {
    id: 'user-123',
    email: 'admin@aerosys.com',
    full_name: 'Aerosys Admin',
    role: 'System_Admin',
    organization_id: 'org-123',
    is_active: true
}

const MOCK_DRONES = [
    {
        id: 'drone-1',
        uin: 'UIN-AR-2024-001',
        dan: 'DAN-AR-001',
        manufacturer_serial_number: 'AR-X1-001',
        status: 'Active',
        type_certificate: { model_name: 'Aero-X1', certificate_number: 'TC-2024-001' }
    },
    {
        id: 'drone-2',
        uin: 'UIN-AR-2024-002',
        dan: 'DAN-AR-002',
        manufacturer_serial_number: 'AR-X1-002',
        status: 'Active',
        type_certificate: { model_name: 'Aero-X1', certificate_number: 'TC-2024-001' }
    }
]

const MOCK_MODELS = [
    {
        id: 'model-1',
        model_name: 'Aero-X1',
        model_number: 'AX1-2024',
        category: 'Rotary Wing',
        weight_class: 'Small',
        max_altitude_ft: 400,
        npnt_compliant: true
    }
]

const MOCK_PILOTS = [
    {
        id: 'pilot-1',
        full_name: 'John Doe',
        rpto_authorization_number: 'RPTO-2024-005',
        category_rating: 'Small',
        status: 'Active'
    }
]

const MOCK_FLIGHT_PLANS = [
    {
        id: 'plan-1',
        drone_id: 'drone-1',
        pilot_id: 'pilot-1',
        status: 'Approved',
        planned_start: new Date().toISOString(),
        planned_end: new Date(Date.now() + 3600000).toISOString(),
        takeoff_lat: 28.5562,
        takeoff_lon: 77.1000,
        flight_purpose: 'Inspection'
    }
]

// Helper for mock responses
const mockResolve = (data: any) => Promise.resolve({ data })

export const api = axios.create({
    baseURL: '/mock-api',
})

// Auth API
export const authApi = {
    login: (email: string, password: string) => {
        useAuthStore.getState().setAuth(MOCK_USER, 'mock-access-token')
        return mockResolve({ access_token: 'mock-access-token', refresh_token: 'mock-refresh-token', token_type: 'bearer' })
    },
    register: (data: any) => mockResolve(MOCK_USER),
    me: (token?: string) => mockResolve(MOCK_USER),
}

// Drones API
export const dronesApi = {
    list: (params?: any) => mockResolve({ total: MOCK_DRONES.length, items: MOCK_DRONES }),
    listModels: () => mockResolve(MOCK_MODELS),
    createModel: (data: any) => mockResolve({ ...data, id: 'new-model' }),
    get: (id: string) => mockResolve(MOCK_DRONES.find(d => d.id === id) || MOCK_DRONES[0]),
    create: (data: any) => mockResolve({ ...data, id: 'new-drone' }),
    update: (id: string, data: any) => mockResolve({ ...MOCK_DRONES[0], ...data }),
    generateUin: (data: any) => mockResolve({ success: true, uin: 'UIN-NEW-2024', drone_id: 'new-drone' }),
    activate: (id: string) => mockResolve({ ...MOCK_DRONES[0], status: 'Active' }),
}

// Pilots API
export const pilotsApi = {
    list: (params?: any) => mockResolve(MOCK_PILOTS),
    get: (id: string) => mockResolve(MOCK_PILOTS[0]),
    create: (data: any) => mockResolve({ ...data, id: 'new-pilot' }),
}

// Maintenance API
export const maintenanceApi = {
    list: (params?: any) => mockResolve([]),
    create: (data: any) => mockResolve({ ...data, id: 'new-log' }),
}

// Flights API
export const flightsApi = {
    listPlans: (params?: any) => mockResolve({ total: MOCK_FLIGHT_PLANS.length, items: MOCK_FLIGHT_PLANS }),
    getPlan: (id: string) => mockResolve(MOCK_FLIGHT_PLANS[0]),
    createPlan: (data: any) => mockResolve({ ...data, id: 'new-plan' }),
    updatePlan: (id: string, data: any) => mockResolve({ ...MOCK_FLIGHT_PLANS[0], ...data }),
    validateNpnt: (data: any) => mockResolve({ is_valid: true, checks: [], permission_artifact: { id: 'artifact-1' } }),
    validateZone: (data: any) => mockResolve({ zone_type: 'GREEN', is_flyable: true, message: 'Clear to fly' }),
    ingestLogs: (data: any) => mockResolve({ success: true, entries_processed: 100 }),
    getSummary: (planId: string) => mockResolve({ total_distance_m: 5000, max_altitude_m: 120 }),
    startFlight: (planId: string) => mockResolve({ ...MOCK_FLIGHT_PLANS[0], status: 'InProgress' }),
    completeFlight: (planId: string) => mockResolve({ ...MOCK_FLIGHT_PLANS[0], status: 'Completed' }),
}
