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

export interface Drone {
    id: string;
    modelName: string;
    uin: string;
    image?: string;
    accountableManagerId?: string;
    uploads: DroneUpload;
    manufacturedUnits: string[];
    createdAt: string;
}

interface ComplianceState {
    drones: Drone[];
    teamMembers: TeamMember[];
    subcontractors: Subcontractor[];
    loading: boolean;

    // Fetch actions
    fetchDrones: () => Promise<void>;
    fetchTeamMembers: () => Promise<void>;
    fetchSubcontractors: () => Promise<void>;

    // Drone actions
    addDrone: (drone: Omit<Drone, 'id' | 'createdAt' | 'uploads'>) => Promise<void>;
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

    // Upload actions
    updateDroneUploads: (droneId: string, uploadType: string, files: string | string[], label?: string) => Promise<void>;
    assignAccountableManager: (droneId: string, managerId: string) => Promise<void>;
    updateWebPortal: (droneId: string, link: string) => Promise<void>;
    updateManufacturedUnits: (droneId: string, units: string[]) => Promise<void>;
}

export const useComplianceStore = create<ComplianceState>((set, get) => ({
    drones: [],
    teamMembers: [],
    subcontractors: [],
    loading: false,

    // Fetch all drones
    fetchDrones: async () => {
        try {
            const res = await fetch('/api/drones');
            const data = await res.json();
            set({ drones: data });
        } catch (error) {
            console.error('Failed to fetch drones:', error);
        }
    },

    // Fetch all team members
    fetchTeamMembers: async () => {
        try {
            const res = await fetch('/api/team');
            const data = await res.json();
            set({ teamMembers: data });
        } catch (error) {
            console.error('Failed to fetch team members:', error);
        }
    },

    // Fetch all subcontractors
    fetchSubcontractors: async () => {
        try {
            const res = await fetch('/api/subcontractors');
            const data = await res.json();
            set({ subcontractors: data });
        } catch (error) {
            console.error('Failed to fetch subcontractors:', error);
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

    // Upload actions
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
}));
