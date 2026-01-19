"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Wrench,
    LogOut,
    ShieldCheck,
    ChevronRight,
    Bell,
    BatteryCharging,
    ClipboardList,
    Menu,
    X,
} from "lucide-react";
import { SessionTimeout } from "@/components/SessionTimeout";

const menuItems = [
    { href: "/admin", label: "Drone Registry", icon: LayoutDashboard },
    { href: "/admin/team", label: "Organizational Manual", icon: Users },
    { href: "/admin/subcontractors", label: "Sub-contractors", icon: Wrench },
    { href: "/admin/batteries", label: "Batteries", icon: BatteryCharging },
    { href: "/admin/orders", label: "Order Book", icon: ClipboardList },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when pathname changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-[#050506] text-white flex flex-col lg:flex-row">
            <SessionTimeout />
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 w-72 bg-[#0a0a0c] border-r border-white/5 flex flex-col z-[50] transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen
                    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div className="p-8 flex-1 overflow-y-auto">
                    {/* Logo & Close Button (Mobile) */}
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg tracking-tight leading-none">AeroSky</h2>
                                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                                    DGCA Compliance
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden p-2 text-gray-500 hover:text-white bg-white/5 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/admin" && pathname.startsWith(item.href));

                            return (
                                <Link key={item.href} href={item.href}>
                                    <div
                                        className={`
                      flex items-center gap-4 px-4 py-3 rounded-xl transition-all
                      ${isActive
                                                ? "bg-blue-600/10 text-blue-500 border border-blue-500/10"
                                                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                            }
                    `}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium text-sm">{item.label}</span>
                                        {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Section */}
                <div className="p-8 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 bg-gradient-to-tr from-gray-700 to-gray-600 rounded-xl flex items-center justify-center font-bold text-white shrink-0">
                            AD
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">Administrator</p>
                            <p className="text-xs text-gray-500 truncate">admin@aerosky.com</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 border-b border-white/5 px-4 lg:px-8 flex items-center justify-between bg-[#0a0a0c]/50 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg font-bold truncate">DGCA Compliance</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all relative">
                            <Bell className="w-5 h-5 text-gray-400" />
                        </button>
                        <div className="h-8 w-[1px] bg-white/5 mx-2 hidden sm:block"></div>
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                System Status
                            </p>
                            <p className="text-xs text-green-500 font-bold flex items-center gap-1.5 justify-end">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Operational
                            </p>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-10 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
