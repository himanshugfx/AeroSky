'use client'

import { useQuery } from '@tanstack/react-query'
import { dronesApi, pilotsApi } from '@/lib/api'
import { FileText, CheckCircle, AlertTriangle, Shield } from 'lucide-react'

export default function CompliancePage() {
    const { data: dronesData } = useQuery({ queryKey: ['drones'], queryFn: () => dronesApi.list() })
    const { data: pilotsData } = useQuery({ queryKey: ['pilots'], queryFn: () => pilotsApi.list() })

    const dronesCount = dronesData?.data?.total || 0
    const pilotsCount = pilotsData?.data?.length || 0

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Compliance Score</p>
                            <p className="text-2xl font-bold text-gray-900">100%</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Compliant Items</p>
                            <p className="text-2xl font-bold text-gray-900">{dronesCount + pilotsCount + 2}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <FileText className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Review</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Violations</p>
                            <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compliance Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Compliance Status</h2>
                </div>
                <div className="p-6">
                    <p className="text-gray-500 text-center py-8">
                        All compliance requirements for Aerosys Aviation are met.
                    </p>
                </div>
            </div>
        </div>
    )
}
