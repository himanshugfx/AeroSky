'use client'

import { useQuery } from '@tanstack/react-query'
import { dronesApi, pilotsApi, maintenanceApi, flightsApi } from '@/lib/api'
import {
    Plane,
    Users,
    Map,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    Loader2
} from 'lucide-react'

export default function DashboardPage() {
    // Fetch real data
    const { data: dronesData, isLoading: dronesLoading } = useQuery({
        queryKey: ['drones'],
        queryFn: () => dronesApi.list()
    })

    const { data: pilotsData, isLoading: pilotsLoading } = useQuery({
        queryKey: ['pilots'],
        queryFn: () => pilotsApi.list()
    })

    const { data: flightsData, isLoading: flightsLoading } = useQuery({
        queryKey: ['flights'],
        queryFn: () => flightsApi.listPlans()
    })

    const { data: maintenanceData, isLoading: maintenanceLoading } = useQuery({
        queryKey: ['maintenance'],
        queryFn: () => maintenanceApi.list()
    })

    const drones = dronesData?.data?.items || []
    const pilots = pilotsData?.data || []
    const flights = flightsData?.data?.items || []
    const logs = maintenanceData?.data || []

    const stats = [
        { name: 'Active Drones', value: drones.length.toString(), icon: Plane, color: 'blue', change: '+1' },
        { name: 'Registered Pilots', value: pilots.length.toString(), icon: Users, color: 'green', change: '+1' },
        { name: 'Flights Today', value: flights.length.toString(), icon: Map, color: 'purple', change: '+0' },
        { name: 'Open Violations', value: '0', icon: AlertTriangle, color: 'red', change: '0' },
    ]

    const recentFlights = flights.slice(0, 3).map((f: any) => ({
        id: f.id,
        drone: `${f.drone_id.substring(0, 8)}...`, // Simulation of UIN/ID
        pilot: 'Sethuraj V', // Placeholder since join isn't implemented in mock
        status: f.status,
        time: 'Today'
    }))

    const pendingActions = [
        { id: 1, type: 'maintenance', message: 'Vedansh Drone maintenance due soon', priority: 'medium' },
        { id: 2, type: 'renewal', message: 'Sethuraj V license valid for 10 years', priority: 'low' },
    ]

    if (dronesLoading || pilotsLoading || flightsLoading || maintenanceLoading) {
        return (
            <div className="p-12 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Loading dashboard data...</p>
            </div>
        )
    }

    const hasError = !dronesData || !pilotsData || !flightsData || !maintenanceData

    if (hasError) {
        return (
            <div className="p-12 flex flex-col items-center justify-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-red-500" />
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">Failed to load dashboard</h3>
                    <p className="text-gray-500">There was a problem connecting to the server. Please check your connection and try again.</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">{stat.name}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-green-600 font-medium">{stat.change}</span>
                            <span className="text-gray-500 ml-2">from last week</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Flights */}
                <div className="card">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold">Recent Flights</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {flights.length === 0 ? (
                            <p className="p-8 text-center text-gray-500">No recent flights found</p>
                        ) : flights.slice(0, 5).map((flight: any) => (
                            <div key={flight.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Plane className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Drone ID: {flight.drone_id.substring(0, 8)}</p>
                                        <p className="text-sm text-gray-500">Purpose: {flight.flight_purpose || 'Survey'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <FlightStatus status={flight.status} />
                                    <p className="text-xs text-gray-400 mt-1">Today</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 text-center border-t border-gray-100">
                        <a href="/dashboard/flights" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View all flights →
                        </a>
                    </div>
                </div>

                {/* Pending Actions */}
                <div className="card">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold">Maintenance Summary</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {logs.length === 0 ? (
                            <p className="p-8 text-center text-gray-500">No recent maintenance logs</p>
                        ) : logs.slice(0, 5).map((log: any) => (
                            <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-gray-50">
                                <div className="p-2 rounded-lg bg-green-50">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">{log.description}</p>
                                    <p className="text-xs mt-1 text-green-600">
                                        COMPLETED BY {log.technician_name.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Compliance Overview */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold mb-6">Compliance Status</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <ComplianceCard title="Type Certificates" status="good" count={2} total={2} />
                    <ComplianceCard title="Drone UINs" status="good" count={drones.length} total={drones.length} />
                    <ComplianceCard title="Pilot RPCs" status="good" count={pilots.length} total={pilots.length} />
                </div>
            </div>
        </div>
    )
}

function FlightStatus({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; class: string }> = {
        completed: { label: 'Completed', class: 'status-active' },
        in_progress: { label: 'In Progress', class: 'status-pending' },
        approved: { label: 'Approved', class: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium' },
    }
    const config = statusConfig[status] || statusConfig.approved
    return <span className={config.class}>{config.label}</span>
}

function ComplianceCard({ title, status, count, total }: { title: string; status: 'good' | 'warning' | 'bad'; count: number; total: number }) {
    const percentage = Math.round((count / total) * 100)
    const colors = {
        good: 'bg-green-500',
        warning: 'bg-yellow-500',
        bad: 'bg-red-500'
    }

    return (
        <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">{title}</span>
                {status === 'good' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
            </div>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{count}</span>
                <span className="text-gray-500">/ {total}</span>
            </div>
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${colors[status]} transition-all`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}
