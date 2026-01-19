'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Shield,
    LayoutDashboard,
    Plane,
    Users,
    Map,
    Wrench,
    FileText,
    Settings,
    LogOut,
    Bell,
    Menu,
    X,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Drones', href: '/dashboard/drones', icon: Plane },
    { name: 'Pilots', href: '/dashboard/pilots', icon: Users },
    { name: 'Flight Plans', href: '/dashboard/flights', icon: Map },
    { name: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
    { name: 'Compliance', href: '/dashboard/compliance', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, isAuthenticated, _hydrated, logout } = useAuthStore()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [pathname])

    useEffect(() => {
        if (_hydrated && !isAuthenticated) {
            router.push('/login')
        }
    }, [_hydrated, isAuthenticated, router])

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    if (!_hydrated || (!isAuthenticated && _hydrated)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[40] lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-0 left-0 w-64 bg-white border-r border-gray-200 h-screen z-[50] transition-transform duration-300 transform lg:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-blue-900">
                        <Shield className="w-8 h-8 text-amber-500" />
                        <span className="text-xl font-bold tracking-tight">Aerosys</span>
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-900"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-blue-700 font-medium">
                                {user?.full_name?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.full_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user?.role}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex justify-between items-center sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-gray-500 hover:text-gray-900"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
                            {navigation.find(n => n.href === pathname)?.name || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
