"use client";

import { useState, useEffect } from "react";
import { Plus, Plane } from "lucide-react";
import { useComplianceStore } from "@/lib/complianceStore";
import { DroneCard } from "@/components/DroneCard";
import { RegisterDroneModal } from "@/components/RegisterDroneModal";

export default function AdminDashboard() {
    const { drones, fetchDrones } = useComplianceStore();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrones().finally(() => setLoading(false));
    }, [fetchDrones]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Drone Registry</h1>
                    <p className="text-gray-500">
                        {drones.length} drone{drones.length !== 1 ? "s" : ""} registered
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" />
                    Register New Drone
                </button>
            </div>

            {/* Drone Grid */}
            {drones.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {drones.map((drone) => (
                        <DroneCard key={drone.id} drone={drone} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <Plane className="w-12 h-12 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No Drones Registered</h3>
                    <p className="text-gray-600 max-w-sm mb-6">
                        Start by registering your first drone to manage its DGCA compliance checklist.
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-6 py-3 rounded-xl transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Register Your First Drone
                    </button>
                </div>
            )}

            {/* Register Modal */}
            <RegisterDroneModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
}
