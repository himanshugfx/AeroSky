'use client'

import {
    Plane,
    Users,
    Map,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp
} from 'lucide-react'

export default function DashboardPage() {
    // Mock data - in production, this would come from API
    const stats = [
        { name: 'Active Drones', value: '24', icon: Plane, color: 'blue', change: '+3' },
        { name: 'Registered Pilots', value: '18', icon: Users, color: 'green', change: '+2' },
        { name: 'Flights Today', value: '7', icon: Map, color: 'purple', change: '+5' },
        { name: 'Open Violations', value: '2', icon: AlertTriangle, color: 'red', change: '-1' },
    ]

    const recentFlights = [
        { id: 1, drone: 'UA-TC001-0000001', pilot: 'John Doe', status: 'completed', time: '2h ago' },
        { id: 2, drone: 'UA-TC001-0000002', pilot: 'Jane Smith', status: 'in_progress', time: '30m ago' },
        { id: 3, drone: 'UA-TC002-0000001', pilot: 'Raj Kumar', status: 'approved', time: '1h ago' },
    ]

    const pendingActions = [
        { id: 1, type: 'maintenance', message: 'Drone UA-TC001-0000003 due for scheduled maintenance', priority: 'high' },
        { id: 2, type: 'renewal', message: 'Pilot RPC expiring in 45 days - Priya Singh', priority: 'medium' },
        { id: 3, type: 'insurance', message: 'Insurance renewal needed for 3 drones', priority: 'high' },
    ]

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
                        {recentFlights.map((flight) => (
                            <div key={flight.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Plane className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{flight.drone}</p>
                                        <p className="text-sm text-gray-500">Pilot: {flight.pilot}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <FlightStatus status={flight.status} />
                                    <p className="text-xs text-gray-400 mt-1">{flight.time}</p>
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
                        <h2 className="text-lg font-semibold">Pending Actions</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {pendingActions.map((action) => (
                            <div key={action.id} className="p-4 flex items-start gap-4 hover:bg-gray-50">
                                <div className={`p-2 rounded-lg ${action.priority === 'high' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                                    {action.priority === 'high' ? (
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                    ) : (
                                        <Clock className="w-5 h-5 text-yellow-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">{action.message}</p>
                                    <p className={`text-xs mt-1 ${action.priority === 'high' ? 'text-red-600' : 'text-yellow-600'}`}>
                                        {action.priority.toUpperCase()} PRIORITY
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
                    <ComplianceCard title="Type Certificates" status="good" count={5} total={5} />
                    <ComplianceCard title="Drone UINs" status="warning" count={22} total={24} />
                    <ComplianceCard title="Pilot RPCs" status="good" count={18} total={18} />
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
