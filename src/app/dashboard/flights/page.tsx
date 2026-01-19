'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { flightsApi, dronesApi, pilotsApi } from '@/lib/api'
import { Map, Clock, CheckCircle, AlertTriangle, Play, Calendar, User, Plane, X, AlertCircle as AlertIcon, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const flightPlanSchema = z.z.object({
    drone_id: z.string().uuid('Please select a drone'),
    pilot_id: z.string().uuid('Please select a pilot'),
    planned_start: z.string().min(1, 'Start time is required'),
    planned_end: z.string().min(1, 'End time is required'),
    max_altitude_ft: z.coerce.number().min(1, 'Max altitude is required'),
    flight_purpose: z.string().min(1, 'Purpose is required'),
})

type FlightPlanFormData = z.infer<typeof flightPlanSchema>

export default function FlightsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const queryClient = useQueryClient()

    const { data: plansData, isLoading } = useQuery({
        queryKey: ['flight-plans'],
        queryFn: () => flightsApi.listPlans()
    })

    const { data: dronesData } = useQuery({
        queryKey: ['drones'],
        queryFn: () => dronesApi.list()
    })

    const { data: pilotsData } = useQuery({
        queryKey: ['pilots'],
        queryFn: () => pilotsApi.list()
    })

    const mutation = useMutation({
        mutationFn: (data: FlightPlanFormData) => flightsApi.createPlan({
            ...data,
            planned_start: new Date(data.planned_start).toISOString(),
            planned_end: new Date(data.planned_end).toISOString(),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flight-plans'] })
            setIsModalOpen(false)
            reset()
        }
    })

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FlightPlanFormData>({
        resolver: zodResolver(flightPlanSchema),
        defaultValues: {
            max_altitude_ft: 400
        }
    })

    const onSubmit = (data: FlightPlanFormData) => {
        mutation.mutate(data)
    }

    const plans = plansData?.data?.items || []
    const drones = dronesData?.data?.items || []
    const pilots = pilotsData?.data || []

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Map className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Flight Plans</p>
                            <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Approval</p>
                            <p className="text-2xl font-bold text-gray-900">{plans.filter((p: any) => p.status === 'Draft').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Approved</p>
                            <p className="text-2xl font-bold text-gray-900">{plans.filter((p: any) => p.status === 'Approved').length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Zone Violations</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Flight Plans Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Flight Plans</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <Play className="w-4 h-4" />
                        Create Flight Plan
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Drone / Pilot</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading plans...</td></tr>
                            ) : plans.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No flight plans created yet. <button onClick={() => setIsModalOpen(true)} className="text-blue-600 font-medium hover:underline">Draft your first plan</button>
                                    </td>
                                </tr>
                            ) : plans.map((plan: any) => (
                                <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Plane className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-xs font-mono">{plan.drone_id.substring(0, 8)}</p>
                                                <p className="text-[10px] text-gray-500 font-mono">{plan.pilot_id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {plan.flight_purpose}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-xs">
                                            <span className="text-gray-900 font-medium">{new Date(plan.planned_start).toLocaleDateString()}</span>
                                            <span className="text-gray-500">{new Date(plan.planned_start).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${plan.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            plan.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {plan.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Flight Plan Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Create New Flight Plan</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                                {mutation.isError && (
                                    <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                                        <AlertIcon className="w-4 h-4" />
                                        {(mutation.error as any)?.response?.data?.detail || 'Failed to create flight plan.'}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Drone</label>
                                        <select
                                            {...register('drone_id')}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.drone_id ? 'border-red-500' : 'border-gray-300'}`}
                                        >
                                            <option value="">Select drone</option>
                                            {drones.map((drone: any) => (
                                                <option key={drone.id} value={drone.id}>{drone.uin || drone.manufacturer_serial_number}</option>
                                            ))}
                                        </select>
                                        {errors.drone_id && <p className="text-red-500 text-xs mt-1">{errors.drone_id.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Pilot</label>
                                        <select
                                            {...register('pilot_id')}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.pilot_id ? 'border-red-500' : 'border-gray-300'}`}
                                        >
                                            <option value="">Select pilot</option>
                                            {pilots.map((pilot: any) => (
                                                <option key={pilot.id} value={pilot.id}>{pilot.full_name}</option>
                                            ))}
                                        </select>
                                        {errors.pilot_id && <p className="text-red-500 text-xs mt-1">{errors.pilot_id.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Planned Start</label>
                                        <input
                                            type="datetime-local"
                                            {...register('planned_start')}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.planned_start ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.planned_start && <p className="text-red-500 text-xs mt-1">{errors.planned_start.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Planned End</label>
                                        <input
                                            type="datetime-local"
                                            {...register('planned_end')}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.planned_end ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.planned_end && <p className="text-red-500 text-xs mt-1">{errors.planned_end.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Altitude (ft)</label>
                                        <input
                                            type="number"
                                            {...register('max_altitude_ft')}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.max_altitude_ft ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.max_altitude_ft && <p className="text-red-500 text-xs mt-1">{errors.max_altitude_ft.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                                        <input
                                            {...register('flight_purpose')}
                                            placeholder="e.g. Survey, Training"
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.flight_purpose ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.flight_purpose && <p className="text-red-500 text-xs mt-1">{errors.flight_purpose.message}</p>}
                                    </div>
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
                                    {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

