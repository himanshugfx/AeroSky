'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Filter, Plane, MoreVertical, Eye, Edit, Trash2, X, AlertCircle, Loader2 } from 'lucide-react'
import { dronesApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const droneSchema = z.z.object({
    manufacturer_serial_number: z.string().min(1, 'Serial number is required'),
    fcm_serial_number: z.string().min(1, 'FCM serial is required'),
    rps_serial_number: z.string().min(1, 'RPS serial is required'),
    type_certificate_id: z.string().uuid('Please select a valid model'),
})

const modelSchema = z.z.object({
    model_name: z.string().min(1, 'Model name is required'),
    model_number: z.string().min(1, 'Model number is required'),
    category: z.enum(['Rotorcraft', 'Aeroplane', 'Hybrid_Vertical_Take_Off_and_Landing']),
    sub_category: z.enum(['Remotely_Piloted_Aircraft_System', 'Model_Aircraft', 'Autonomous_Unmanned_Aircraft_System']),
    weight_class: z.enum(['Nano', 'Micro', 'Small', 'Medium', 'Large']),
    max_takeoff_weight_kg: z.coerce.number().min(0.1, 'Weight is required'),
})

type DroneFormData = z.infer<typeof droneSchema>
type ModelFormData = z.infer<typeof modelSchema>

export default function DronesPage() {
    const { user } = useAuthStore()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isRegModalOpen, setIsRegModalOpen] = useState(false)
    const [isModelModalOpen, setIsModelModalOpen] = useState(false)
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['drones', statusFilter],
        queryFn: () => dronesApi.list({
            limit: 50,
            status: statusFilter !== 'all' ? statusFilter : undefined
        }),
    })

    const { data: modelsData } = useQuery({
        queryKey: ['drone-models'],
        queryFn: () => dronesApi.listModels()
    })

    const regMutation = useMutation({
        mutationFn: (data: DroneFormData) => dronesApi.generateUin(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drones'] })
            setIsRegModalOpen(false)
            resetReg()
        }
    })

    const modelMutation = useMutation({
        mutationFn: (data: any) => dronesApi.createModel({
            ...data,
            manufacturer_id: user?.organization_id || '00000000-0000-0000-0000-000000000000'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drone-models'] })
            setIsModelModalOpen(false)
            resetModel()
        }
    })

    const { register: registerReg, handleSubmit: handleSubmitReg, reset: resetReg, formState: { errors: errorsReg } } = useForm<DroneFormData>({
        resolver: zodResolver(droneSchema)
    })

    const { register: registerModel, handleSubmit: handleSubmitModel, reset: resetModel, formState: { errors: errorsModel } } = useForm<ModelFormData>({
        resolver: zodResolver(modelSchema)
    })

    const onRegSubmit = (data: DroneFormData) => {
        regMutation.mutate(data)
    }

    const onModelSubmit = (data: ModelFormData) => {
        modelMutation.mutate(data)
    }

    const drones = data?.data?.items || []
    const models = modelsData?.data || []

    const filteredDrones = drones.filter((d: any) =>
        d.uin?.toLowerCase().includes(search.toLowerCase()) ||
        d.manufacturer_serial_number?.toLowerCase().includes(search.toLowerCase())
    )

    const statusColors: Record<string, string> = {
        Active: 'status-active',
        Registered: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium',
        Draft: 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium',
        Transfer_Pending: 'status-pending',
        Deregistered: 'status-inactive',
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Drone Registry</h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                        onClick={() => setIsModelModalOpen(true)}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Model
                    </button>
                    <button
                        onClick={() => setIsRegModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Register Drone
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by UIN or Serial..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">UIN / Serial</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Model</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Insurance</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Last Flight</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading drones...</td></tr>
                        ) : filteredDrones.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No drones found. <button onClick={() => setIsRegModalOpen(true)} className="text-blue-600 font-medium hover:underline">Register your first drone</button>
                                </td>
                            </tr>
                        ) : (
                            filteredDrones.map((drone: any) => (
                                <tr key={drone.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Plane className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{drone.uin || 'Pending UIN'}</p>
                                                <p className="text-sm text-gray-500 font-mono">{drone.manufacturer_serial_number}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {drone.type_certificate?.model_name || 'Generic Model'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[drone.status] || statusColors.Draft}`}>
                                            {drone.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {drone.insurance_expiry_date ? (
                                            <span className={new Date(drone.insurance_expiry_date) < new Date() ? 'text-red-600' : 'text-green-600'}>
                                                {new Date(drone.insurance_expiry_date).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">No Policy</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">-</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Register Modal */}
            {isRegModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Register New Drone</h2>
                            <button onClick={() => setIsRegModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitReg(onRegSubmit)} className="p-6 space-y-4">
                            {regMutation.isError && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    {(regMutation.error as any)?.response?.data?.detail || 'Failed to register drone.'}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Model</label>
                                <div className="flex gap-2">
                                    <select
                                        {...registerReg('type_certificate_id')}
                                        className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errorsReg.type_certificate_id ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Choose a model</option>
                                        {models.map((model: any) => (
                                            <option key={model.id} value={model.id}>{model.model_name} ({model.model_number})</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => { setIsRegModalOpen(false); setIsModelModalOpen(true); }}
                                        className="p-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                                        title="Add New Model"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                {errorsReg.type_certificate_id && <p className="text-red-500 text-xs mt-1">{errorsReg.type_certificate_id.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer Serial Number</label>
                                    <input
                                        {...registerReg('manufacturer_serial_number')}
                                        placeholder="e.g. ASV2024001"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errorsReg.manufacturer_serial_number ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errorsReg.manufacturer_serial_number && <p className="text-red-500 text-xs mt-1">{errorsReg.manufacturer_serial_number.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">FCM Serial Number</label>
                                    <input
                                        {...registerReg('fcm_serial_number')}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errorsReg.fcm_serial_number ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errorsReg.fcm_serial_number && <p className="text-red-500 text-xs mt-1">{errorsReg.fcm_serial_number.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">RPS Serial Number</label>
                                    <input
                                        {...registerReg('rps_serial_number')}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errorsReg.rps_serial_number ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errorsReg.rps_serial_number && <p className="text-red-500 text-xs mt-1">{errorsReg.rps_serial_number.message}</p>}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsRegModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={regMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                                >
                                    {regMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register & Generate UIN'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Model Modal */}
            {isModelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Add New Drone Model</h2>
                            <button onClick={() => setIsModelModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitModel(onModelSubmit)} className="p-6 space-y-4">
                            {modelMutation.isError && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    {(modelMutation.error as any)?.response?.data?.detail || 'Failed to add model.'}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                                    <input
                                        {...registerModel('model_name')}
                                        placeholder="e.g. VEDANSH"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errorsModel.model_name ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errorsModel.model_name && <p className="text-red-500 text-xs mt-1">{errorsModel.model_name.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Model Number</label>
                                    <input
                                        {...registerModel('model_number')}
                                        placeholder="e.g. AS-V1-2024"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errorsModel.model_number ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errorsModel.model_number && <p className="text-red-500 text-xs mt-1">{errorsModel.model_number.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        {...registerModel('category')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Rotorcraft">Rotorcraft</option>
                                        <option value="Aeroplane">Aeroplane</option>
                                        <option value="Hybrid_Vertical_Take_Off_and_Landing">Hybrid VTOL</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                                    <select
                                        {...registerModel('sub_category')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Remotely_Piloted_Aircraft_System">RPAS</option>
                                        <option value="Model_Aircraft">Model Aircraft</option>
                                        <option value="Autonomous_Unmanned_Aircraft_System">Autonomous UAS</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight Class</label>
                                    <select
                                        {...registerModel('weight_class')}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Nano">Nano</option>
                                        <option value="Micro">Micro</option>
                                        <option value="Small">Small</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Large">Large</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Takeoff Weight (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    {...registerModel('max_takeoff_weight_kg')}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errorsModel.max_takeoff_weight_kg ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errorsModel.max_takeoff_weight_kg && <p className="text-red-500 text-xs mt-1">{errorsModel.max_takeoff_weight_kg.message}</p>}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModelModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={modelMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                                >
                                    {modelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Model'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

