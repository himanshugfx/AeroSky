import { create } from 'zustand'

// Types
export interface TeamMember {
    id: string;
    accessId: string;
    name: string;
    phone: string;
    email: string;
    position: string;
    createdAt: string;
}

export interface Subcontractor {
    id: string;
    companyName: string;
    type: 'Design' | 'Manufacturing';
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    agreementDate: string;
    createdAt: string;
}

export interface DroneUpload {
    trainingManual?: string;
    infrastructureManufacturing: string[];
    infrastructureTesting: string[];
    infrastructureOffice: string[];
    infrastructureOthers: { label: string; image: string }[];
    regulatoryDisplay: string[];
    systemDesign?: string;
    hardwareSecurity: string[];
    webPortalLink?: string;
}

export interface ManufacturedUnit {
    serialNumber: string;
    uin: string;
}

export interface Battery {
    id: string;
    model: string;
    ratedCapacity: string;
    batteryNumberA: string;
    batteryNumberB: string;
    createdAt: string;
}

export interface Order {
    id: string;
    // Core Order & Financial Information
    contractNumber: string;
    clientName: string;
    clientSegment: string;
    orderDate: string;
    estimatedCompletionDate?: string;
    contractValue: number;
    currency: string;
    revenueRecognitionStatus: string;
    // Technical & Configuration Details
    droneModel: string;
    droneType: string;
    weightClass: string;
    payloadConfiguration?: string;
    flightEnduranceRequirements?: string;
    softwareAiTier?: string;
    // Regulatory & Compliance Tracking
    dgcaFaaCertificationStatus: string;
    uin?: string;
    exportLicenseStatus?: string;
    geofencingRequirements?: string;
    // Operational & Delivery Status
    bomReadiness: string;
    manufacturingStage: string;
    calibrationTestLogs?: string;
    afterSalesAmc?: string;
    cocData?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Drone {
    id: string;
    modelName: string;
    // uin: string; // Removed from top-level
    image?: string;
    accountableManagerId?: string;
    uploads: DroneUpload;
    manufacturedUnits: ManufacturedUnit[];
    createdAt: string;
}

interface ComplianceState {
    drones: Drone[];
    teamMembers: TeamMember[];
    subcontractors: Subcontractor[];
    batteries: Battery[];
    orders: Order[];
    loading: boolean;

    // Fetch actions
    fetchDrones: () => Promise<void>;
    fetchTeamMembers: () => Promise<void>;
    fetchSubcontractors: () => Promise<void>;
    fetchBatteries: () => Promise<void>;
    fetchOrders: () => Promise<void>;

    // Drone actions
    addDrone: (drone: Omit<Drone, 'id' | 'createdAt' | 'uploads' | 'manufacturedUnits'>) => Promise<void>;
    updateDrone: (id: string, updates: Partial<Drone>) => Promise<void>;
    deleteDrone: (id: string) => Promise<void>;
    getDrone: (id: string) => Drone | undefined;

    // Team actions
    addTeamMember: (member: Omit<TeamMember, 'id' | 'accessId' | 'createdAt'>) => Promise<void>;
    updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
    deleteTeamMember: (id: string) => Promise<void>;

    // Subcontractor actions
    addSubcontractor: (sub: Omit<Subcontractor, 'id' | 'createdAt'>) => Promise<void>;
    updateSubcontractor: (id: string, updates: Partial<Subcontractor>) => Promise<void>;
    deleteSubcontractor: (id: string) => Promise<void>;

    // Battery actions
    addBattery: (battery: Omit<Battery, 'id' | 'createdAt'>) => Promise<void>;
    deleteBattery: (id: string) => Promise<void>;

    // Order actions
    addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
    deleteOrder: (id: string) => Promise<void>;

    // Upload actions
    updateDroneUploads: (droneId: string, uploadType: string, files: string | string[], label?: string) => Promise<void>;
    assignAccountableManager: (droneId: string, managerId: string) => Promise<void>;
    updateWebPortal: (droneId: string, link: string) => Promise<void>;
    updateManufacturedUnits: (droneId: string, units: ManufacturedUnit[]) => Promise<void>;
    updateRecurringData: (droneId: string, data: any) => Promise<void>; // Generic for now
}

export const useComplianceStore = create<ComplianceState>((set, get) => ({
    drones: [],
    teamMembers: [],
    subcontractors: [],
    batteries: [],
    orders: [],
    loading: false,

    // Fetch all drones
    fetchDrones: async () => {
        try {
            const res = await fetch('/api/drones');
            const data = await res.json();
            if (Array.isArray(data)) {
                set({ drones: data });
            }
        } catch (error) {
            console.error('Failed to fetch drones:', error);
        }
    },

    // Fetch all team members
    fetchTeamMembers: async () => {
        try {
            const res = await fetch('/api/team');
            const data = await res.json();
            if (Array.isArray(data)) {
                set({ teamMembers: data });
            }
        } catch (error) {
            console.error('Failed to fetch team members:', error);
        }
    },

    // Fetch all subcontractors
    fetchSubcontractors: async () => {
        try {
            const res = await fetch('/api/subcontractors');
            const data = await res.json();
            if (Array.isArray(data)) {
                set({ subcontractors: data });
            }
        } catch (error) {
            console.error('Failed to fetch subcontractors:', error);
        }
    },

    // Fetch all batteries
    fetchBatteries: async () => {
        try {
            const res = await fetch('/api/batteries');
            const data = await res.json();
            if (Array.isArray(data)) {
                set({ batteries: data });
            }
        } catch (error) {
            console.error('Failed to fetch batteries:', error);
        }
    },

    // Drone actions
    addDrone: async (drone) => {
        try {
            const res = await fetch('/api/drones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(drone),
            });
            const newDrone = await res.json();
            set((state) => ({ drones: [newDrone, ...state.drones] }));
        } catch (error) {
            console.error('Failed to add drone:', error);
        }
    },

    updateDrone: async (id, updates) => {
        try {
            await fetch(`/api/drones/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            set((state) => ({
                drones: state.drones.map((d) => (d.id === id ? { ...d, ...updates } : d)),
            }));
        } catch (error) {
            console.error('Failed to update drone:', error);
        }
    },

    deleteDrone: async (id) => {
        try {
            await fetch(`/api/drones/${id}`, { method: 'DELETE' });
            set((state) => ({ drones: state.drones.filter((d) => d.id !== id) }));
        } catch (error) {
            console.error('Failed to delete drone:', error);
        }
    },

    getDrone: (id) => get().drones.find((d) => d.id === id),

    // Team actions
    addTeamMember: async (member) => {
        try {
            const res = await fetch('/api/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(member),
            });
            const newMember = await res.json();
            set((state) => ({ teamMembers: [newMember, ...state.teamMembers] }));
        } catch (error) {
            console.error('Failed to add team member:', error);
        }
    },

    updateTeamMember: async (id, updates) => {
        try {
            await fetch(`/api/team/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            set((state) => ({
                teamMembers: state.teamMembers.map((m) => (m.id === id ? { ...m, ...updates } : m)),
            }));
        } catch (error) {
            console.error('Failed to update team member:', error);
        }
    },

    deleteTeamMember: async (id) => {
        try {
            await fetch(`/api/team/${id}`, { method: 'DELETE' });
            set((state) => ({ teamMembers: state.teamMembers.filter((m) => m.id !== id) }));
        } catch (error) {
            console.error('Failed to delete team member:', error);
        }
    },

    // Subcontractor actions
    addSubcontractor: async (sub) => {
        try {
            const res = await fetch('/api/subcontractors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sub),
            });
            const newSub = await res.json();
            set((state) => ({ subcontractors: [newSub, ...state.subcontractors] }));
        } catch (error) {
            console.error('Failed to add subcontractor:', error);
        }
    },

    updateSubcontractor: async (id, updates) => {
        try {
            await fetch(`/api/subcontractors/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            set((state) => ({
                subcontractors: state.subcontractors.map((s) => (s.id === id ? { ...s, ...updates } : s)),
            }));
        } catch (error) {
            console.error('Failed to update subcontractor:', error);
        }
    },

    deleteSubcontractor: async (id) => {
        try {
            await fetch(`/api/subcontractors/${id}`, { method: 'DELETE' });
            set((state) => ({ subcontractors: state.subcontractors.filter((s) => s.id !== id) }));
        } catch (error) {
            console.error('Failed to delete subcontractor:', error);
        }
    },

    // Battery actions
    addBattery: async (battery) => {
        try {
            const res = await fetch('/api/batteries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(battery),
            });
            const newBattery = await res.json();
            set((state) => ({ batteries: [newBattery, ...state.batteries] }));
        } catch (error) {
            console.error('Failed to add battery:', error);
        }
    },

    deleteBattery: async (id) => {
        try {
            await fetch(`/api/batteries/${id}`, { method: 'DELETE' });
            set((state) => ({ batteries: state.batteries.filter((b) => b.id !== id) }));
        } catch (error) {
            console.error('Failed to delete battery:', error);
        }
    },
    updateDroneUploads: async (droneId, uploadType, files, label) => {
        try {
            await fetch(`/api/drones/${droneId}/uploads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uploadType, files, label }),
            });
            // Refresh drones to get updated uploads
            await get().fetchDrones();
        } catch (error) {
            console.error('Failed to upload files:', error);
        }
    },

    assignAccountableManager: async (droneId, managerId) => {
        try {
            await fetch(`/api/drones/${droneId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountableManagerId: managerId }),
            });
            set((state) => ({
                drones: state.drones.map((d) =>
                    d.id === droneId ? { ...d, accountableManagerId: managerId } : d
                ),
            }));
        } catch (error) {
            console.error('Failed to assign manager:', error);
        }
    },

    updateWebPortal: async (droneId, link) => {
        try {
            await fetch(`/api/drones/${droneId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ webPortalLink: link }),
            });
            set((state) => ({
                drones: state.drones.map((d) =>
                    d.id === droneId
                        ? { ...d, uploads: { ...d.uploads, webPortalLink: link } }
                        : d
                ),
            }));
        } catch (error) {
            console.error('Failed to update web portal:', error);
        }
    },

    updateManufacturedUnits: async (droneId, units) => {
        try {
            await fetch(`/api/drones/${droneId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ manufacturedUnits: units }),
            });
            set((state) => ({
                drones: state.drones.map((d) =>
                    d.id === droneId ? { ...d, manufacturedUnits: units } : d
                ),
            }));
        } catch (error) {
            console.error('Failed to update manufactured units:', error);
        }
    },

    updateRecurringData: async (droneId, data) => {
        try {
            // Retrieve existing data first to merge (or handle partial updates)
            const existingDrone = get().drones.find(d => d.id === droneId);
            const currentData = (existingDrone as any)?.recurringData || {};

            // Simple shallow merge for now, or total replacement depending on usage.
            // Given the requirements, let's treat 'data' as a specific key update or full object.
            // Ideally we should have structure but since it's "Json", we need care.
            // Let's assume 'data' is a partial object to merge.
            const newData = { ...currentData, ...data };

            await fetch(`/api/drones/${droneId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recurringData: newData }),
            });

            set((state) => ({
                drones: state.drones.map((d) =>
                    d.id === droneId ? { ...d, recurringData: newData } : d
                ),
            }));

        } catch (error) {
            console.error('Failed to update recurring data:', error);
        }
    },

    // Order actions
    fetchOrders: async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (Array.isArray(data)) {
                set({ orders: data });
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    },

    addOrder: async (order) => {
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order),
            });
            const newOrder = await res.json();
            if (res.ok) {
                set((state) => ({ orders: [newOrder, ...state.orders] }));
            } else {
                throw new Error(newOrder.error || 'Failed to add order');
            }
        } catch (error) {
            console.error('Failed to add order:', error);
            throw error;
        }
    },

    updateOrder: async (id, updates) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            const updatedOrder = await res.json();
            if (res.ok) {
                set((state) => ({
                    orders: state.orders.map((o) => (o.id === id ? updatedOrder : o)),
                }));
            } else {
                throw new Error(updatedOrder.error || 'Failed to update order');
            }
        } catch (error) {
            console.error('Failed to update order:', error);
            throw error;
        }
    },

    deleteOrder: async (id) => {
        try {
            await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            set((state) => ({ orders: state.orders.filter((o) => o.id !== id) }));
        } catch (error) {
            console.error('Failed to delete order:', error);
        }
    }
}));
