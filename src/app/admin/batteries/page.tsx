"use client";

import { useState, useEffect } from "react";
import {
    BatteryCharging,
    Plus,
    Trash2,
} from "lucide-react";
import { useComplianceStore } from "@/lib/complianceStore";

export default function BatteriesPage() {
    const { batteries, fetchBatteries, addBattery, deleteBattery } = useComplianceStore();
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        model: "",
        ratedCapacity: "",
        batteryNumberA: "",
        batteryNumberB: "",
    });

    useEffect(() => {
        fetchBatteries().finally(() => setLoading(false));
    }, [fetchBatteries]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.model && formData.ratedCapacity && formData.batteryNumberA && formData.batteryNumberB) {
            await addBattery(formData);
            setFormData({ model: "", ratedCapacity: "", batteryNumberA: "", batteryNumberB: "" });
            setShowForm(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this battery pair?")) {
            await deleteBattery(id);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Battery Management</h1>
                    <p className="text-sm text-gray-500">
                        Manage battery pairs used for drone operations
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" />
                    Add Battery Pair
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="bg-[#0f0f12] border border-white/5 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-bold text-white mb-4">Add New Battery Pair</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Battery Model
                                </label>
                                <input
                                    type="text"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    placeholder="e.g., Li-Ion 6S"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Rated Capacity
                                </label>
                                <input
                                    type="text"
                                    value={formData.ratedCapacity}
                                    onChange={(e) => setFormData({ ...formData, ratedCapacity: e.target.value })}
                                    placeholder="e.g., 5000mAh"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Battery Number A
                                </label>
                                <input
                                    type="text"
                                    value={formData.batteryNumberA}
                                    onChange={(e) => setFormData({ ...formData, batteryNumberA: e.target.value })}
                                    placeholder="e.g., 1a"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Battery Number B
                                </label>
                                <input
                                    type="text"
                                    value={formData.batteryNumberB}
                                    onChange={(e) => setFormData({ ...formData, batteryNumberB: e.target.value })}
                                    placeholder="e.g., 1b"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors"
                            >
                                Add Battery Pair
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setFormData({ model: "", ratedCapacity: "", batteryNumberA: "", batteryNumberB: "" });
                                }}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Battery List */}
            {batteries.length > 0 ? (
                <div className="space-y-3">
                    {batteries.map((battery) => (
                        <div
                            key={battery.id}
                            className="flex items-center gap-4 p-4 bg-[#0f0f12] border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                        >
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <BatteryCharging className="w-6 h-6 text-green-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <p className="font-semibold text-white">{battery.model}</p>
                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full">
                                        {battery.ratedCapacity}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Pair: <span className="font-mono text-gray-400">{battery.batteryNumberA}</span> + <span className="font-mono text-gray-400">{battery.batteryNumberB}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(battery.id)}
                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete battery"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                        <BatteryCharging className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-400 mb-2">No Batteries Added</h3>
                    <p className="text-sm text-gray-600 mb-6">
                        Add battery pairs to track them in your compliance records
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3 rounded-xl transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add First Battery Pair
                    </button>
                </div>
            )}
        </div>
    );
}
