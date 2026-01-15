"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

const menuItems = [
    { href: "/admin", label: "Drone Registry", icon: LayoutDashboard },
    { href: "/admin/team", label: "Organizational Manual", icon: Users },
    { href: "/admin/subcontractors", label: "Sub-contractors", icon: Wrench },
    { href: "/admin/batteries", label: "Batteries", icon: BatteryCharging },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-[#050506] text-white flex">
            {/* Sidebar */}
            <aside className="w-72 bg-[#0a0a0c] border-r border-white/5 flex flex-col fixed h-full">
                <div className="p-8">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-10">
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
                <div className="mt-auto p-8 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 bg-gradient-to-tr from-gray-700 to-gray-600 rounded-xl flex items-center justify-center font-bold text-white">
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
            <main className="flex-1 ml-72">
                {/* Header */}
                <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-[#0a0a0c]/50 backdrop-blur-xl sticky top-0 z-10">
                    <div>
                        <h1 className="text-lg font-bold">DGCA Compliance</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all relative">
                            <Bell className="w-5 h-5 text-gray-400" />
                        </button>
                        <div className="h-8 w-[1px] bg-white/5 mx-2"></div>
                        <div className="text-right">
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
                <div className="p-10">{children}</div>
            </main>
        </div>
    );
}
