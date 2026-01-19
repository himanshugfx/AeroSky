'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pilotsApi } from '@/lib/api'
import { Users, UserPlus, Award, Clock, Mail, ShieldCheck, X, AlertCircle, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const pilotSchema = z.z.object({
    full_name: z.string().min(1, 'Full name is required'),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    primary_id_type: z.enum(['Aadhaar', 'Passport', 'Voter_ID', 'Driving_License']),
    primary_id_number: z.string().min(1, 'ID number is required'),
    category_rating: z.enum(['Rotary_Wing', 'Fixed_Wing', 'Hybrid_Vertical_Take_Off_and_Landing']),
    class_rating: z.enum(['Nano', 'Micro', 'Small', 'Medium', 'Large']),
    operation_rating: z.enum(['VLOS', 'BVLOS', 'Night']),
})

type PilotFormData = z.infer<typeof pilotSchema>

export default function PilotsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const queryClient = useQueryClient()

    const { data: pilotsData, isLoading } = useQuery({
        queryKey: ['pilots'],
        queryFn: () => pilotsApi.list()
    })

    const mutation = useMutation({
        mutationFn: (data: any) => pilotsApi.create({
            ...data,
            user_id: '00000000-0000-0000-0000-000000000000' // Mock user_id for now
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pilots'] })
            setIsModalOpen(false)
            reset()
        }
    })

    const { register, handleSubmit, reset, formState: { errors } } = useForm<PilotFormData>({
        resolver: zodResolver(pilotSchema)
    })

    const onSubmit = (data: PilotFormData) => {
        mutation.mutate(data)
    }

    const pilots = pilotsData?.data || []

    const stats = [
        { label: 'Total Pilots', value: pilots.length, icon: Users, color: 'blue' },
        { label: 'Active Licenses', value: pilots.filter((p: any) => p.status === 'Active').length, icon: Award, color: 'green' },
        { label: 'Small Class', value: pilots.filter((p: any) => p.class_rating === 'Small').length, icon: ShieldCheck, color: 'purple' },
        { label: 'VLOS Rating', value: pilots.filter((p: any) => p.operation_rating === 'VLOS').length, icon: Clock, color: 'yellow' },
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

            {/* Pilots Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Registered Pilots</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Add Pilot
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Pilot Name / RPC</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Category / Class</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading pilots...</td></tr>
                            ) : pilots.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No pilots registered yet. <button onClick={() => setIsModalOpen(true)} className="text-blue-600 hover:underline">Register first pilot</button>
                                    </td>
                                </tr>
                            ) : pilots.map((pilot: any) => (
                                <tr key={pilot.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 font-bold">
                                                {pilot.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{pilot.full_name}</p>
                                                <p className="text-xs text-gray-500 font-mono">{pilot.rpc_number}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {pilot.category_rating?.replace('_', ' ')} / {pilot.class_rating}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${pilot.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {pilot.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {pilot.total_flight_hours} hrs
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {pilot.expiry_date ? new Date(pilot.expiry_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Pilot Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Register New Pilot</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                                {mutation.isError && (
                                    <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                                        <AlertCircle className="w-4 h-4" />
                                        {(mutation.error as any)?.response?.data?.detail || 'Failed to register pilot.'}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            {...register('full_name')}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            {...register('date_of_birth')}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.date_of_birth ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                                        <select
                                            {...register('primary_id_type')}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="Aadhaar">Aadhaar</option>
                                            <option value="Passport">Passport</option>
                                            <option value="Voter_ID">Voter ID</option>
                                            <option value="Driving_License">Driving License</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                                        <input
                                            {...register('primary_id_number')}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.primary_id_number ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.primary_id_number && <p className="text-red-500 text-xs mt-1">{errors.primary_id_number.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            {...register('category_rating')}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="Rotary_Wing">Rotary Wing</option>
                                            <option value="Fixed_Wing">Fixed Wing</option>
                                            <option value="Hybrid_Vertical_Take_Off_and_Landing">Hybrid VTOL</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                        <select
                                            {...register('class_rating')}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="Nano">Nano</option>
                                            <option value="Micro">Micro</option>
                                            <option value="Small">Small</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Large">Large</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                        <select
                                            {...register('operation_rating')}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="VLOS">VLOS</option>
                                            <option value="BVLOS">BVLOS</option>
                                            <option value="Night">Night</option>
                                        </select>
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
                                    {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Pilot'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
