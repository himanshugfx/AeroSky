'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { maintenanceApi, dronesApi } from '@/lib/api'
import { Wrench, CheckCircle, Clock, AlertTriangle, User, Calendar, X, AlertCircle as AlertIcon, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const maintenanceSchema = z.z.object({
    drone_id: z.string().uuid('Please select a drone'),
    maintenance_type: z.enum(['Inspection', 'Repair', 'Software_Update', 'Component_Replacement']),
    description: z.string().min(5, 'Provide more details'),
    technician_name: z.string().min(1, 'Technician name required'),
    maintenance_date: z.string().min(1, 'Date is required'),
})

type MaintenanceFormData = z.infer<typeof maintenanceSchema>

export default function MaintenancePage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const queryClient = useQueryClient()

    const { data: logsData, isLoading } = useQuery({
        queryKey: ['maintenance'],
        queryFn: () => maintenanceApi.list()
    })

    const { data: dronesData } = useQuery({
        queryKey: ['drones'],
        queryFn: () => dronesApi.list()
    })

    const mutation = useMutation({
        mutationFn: (data: MaintenanceFormData) => maintenanceApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance'] })
            setIsModalOpen(false)
            reset()
        }
    })

    const { register, handleSubmit, reset, formState: { errors } } = useForm<MaintenanceFormData>({
        resolver: zodResolver(maintenanceSchema)
    })

    const onSubmit = (data: MaintenanceFormData) => {
        mutation.mutate(data)
    }

    const logs = logsData?.data || []
    const drones = dronesData?.data?.items || []

    const stats = [
        { label: 'Total Logs', value: logs.length, icon: Wrench, color: 'blue' },
        { label: 'Completed', value: logs.filter((l: any) => l.status === 'Completed').length, icon: CheckCircle, color: 'green' },
        { label: 'Inspections', value: logs.filter((l: any) => l.maintenance_type === 'Inspection').length, icon: Clock, color: 'yellow' },
        { label: 'Critical Rep.', value: logs.filter((l: any) => l.maintenance_type === 'Repair').length, icon: AlertTriangle, color: 'red' },
    ]

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Maintenance Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Maintenance Logs</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <Wrench className="w-4 h-4" />
                        Log Maintenance
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Drone ID / Type</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Work Details</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No maintenance records found. <button onClick={() => setIsModalOpen(true)} className="text-blue-600 font-medium hover:underline">Log your first task</button>
                                    </td>
                                </tr>
                            ) : logs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Wrench className="w-4 h-4 text-blue-500" />
                                            <div>
                                                <p className="font-medium text-gray-900 font-mono text-xs">{log.drone_id.substring(0, 8)}</p>
                                                <p className="text-xs text-blue-600">{log.maintenance_type}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                        {log.description}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3" />
                                            {log.technician_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(log.maintenance_date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Log Maintenance Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Log Maintenance Task</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                                {mutation.isError && (
                                    <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                                        <AlertIcon className="w-4 h-4" />
                                        {(mutation.error as any)?.response?.data?.detail || 'Failed to log maintenance.'}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Drone</label>
                                    <select
                                        {...register('drone_id')}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.drone_id ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Select a drone</option>
                                        {drones.map((drone: any) => (
                                            <option key={drone.id} value={drone.id}>{drone.uin || drone.manufacturer_serial_number} ({drone.status})</option>
                                        ))}
                                    </select>
                                    {errors.drone_id && <p className="text-red-500 text-xs mt-1">{errors.drone_id.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
                                        <select
                                            {...register('maintenance_type')}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="Inspection">Inspection</option>
                                            <option value="Repair">Repair</option>
                                            <option value="Software_Update">Software Update</option>
                                            <option value="Component_Replacement">Component Replacement</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            {...register('maintenance_date')}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.maintenance_date ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.maintenance_date && <p className="text-red-500 text-xs mt-1">{errors.maintenance_date.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Technician Name</label>
                                    <input
                                        {...register('technician_name')}
                                        placeholder="Enter your name"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.technician_name ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.technician_name && <p className="text-red-500 text-xs mt-1">{errors.technician_name.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Description</label>
                                    <textarea
                                        {...register('description')}
                                        rows={3}
                                        placeholder="Describe the work performed..."
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                                >
                                    {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

