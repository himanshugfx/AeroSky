'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Filter, Plane, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'
import { dronesApi } from '@/lib/api'

export default function DronesPage() {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const { data, isLoading, error } = useQuery({
        queryKey: ['drones', statusFilter],
        queryFn: () => dronesApi.list({
            limit: 50,
            status: statusFilter !== 'all' ? statusFilter : undefined
        }),
    })

    const drones = data?.data?.items || []
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
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Drone Registry</h1>
                    <p className="text-gray-500">Manage your drone fleet and UIN registrations</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                    <Plus className="w-5 h-5" />
                    Register Drone
                </button>
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
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Registered">Registered</option>
                            <option value="Draft">Draft</option>
                            <option value="Transfer_Pending">Transfer Pending</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                UIN / Serial
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Model
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Insurance
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Flight
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Loading drones...
                                </td>
                            </tr>
                        ) : filteredDrones.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No drones found. <a href="#" className="text-blue-600">Register your first drone</a>
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
                                                <p className="text-sm text-gray-500">{drone.manufacturer_serial_number}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {drone.type_certificate?.model_name || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={statusColors[drone.status] || statusColors.Draft}>
                                            {drone.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {drone.insurance_expiry_date ? (
                                            <span className={new Date(drone.insurance_expiry_date) < new Date() ? 'text-red-600' : 'text-green-600'}>
                                                {new Date(drone.insurance_expiry_date).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Not set</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        -
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
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
        </div>
    )
}
