'use client'

import { Settings, User, Bell, Shield, Database } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function SettingsPage() {
    const { user } = useAuthStore()

    return (
        <div className="space-y-6">
            {/* Profile Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-700 font-bold text-2xl">
                                {user?.full_name?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">{user?.full_name || 'User'}</h3>
                            <p className="text-gray-500">{user?.email}</p>
                            <p className="text-sm text-blue-600 mt-1">{user?.role}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                defaultValue={user?.full_name || ''}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                defaultValue={user?.email || ''}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                disabled
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Bell className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Configure email and push notification preferences.</p>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Configure →</button>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Security</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Update password and two-factor authentication.</p>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Configure →</button>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Database className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">API Access</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Manage API keys and integrations.</p>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Configure →</button>
                </div>
            </div>
        </div>
    )
}
