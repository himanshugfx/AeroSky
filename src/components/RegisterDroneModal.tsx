"use client";

import { useState, useRef } from "react";
import { X, Plane, Upload } from "lucide-react";
import { useComplianceStore } from "@/lib/complianceStore";

interface RegisterDroneModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RegisterDroneModal({ isOpen, onClose }: RegisterDroneModalProps) {
    const addDrone = useComplianceStore((state) => state.addDrone);

    const [modelName, setModelName] = useState("");
    const [image, setImage] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Clear fields before adding (per user rules)
        const droneData = {
            modelName,
            image,
            manufacturedUnits: [],
        };

        await addDrone(droneData);

        // Reset form
        setModelName("");
        setImage(undefined);
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#0f0f12] border border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                        <Plane className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Register New Drone</h2>
                        <p className="text-sm text-gray-500">Add a drone to compliance registry</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload */}
                    <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                            Drone Image
                        </label>
                        <div
                            onClick={() => inputRef.current?.click()}
                            className="relative h-40 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-white/20 transition-colors"
                        >
                            {image ? (
                                <img src={image} alt="Drone" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <Upload className="w-8 h-8 text-gray-600 mb-2" />
                                    <span className="text-sm text-gray-500">Click to upload image</span>
                                </div>
                            )}
                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Model Name */}
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                Model Name
                            </label>
                            <input
                                type="text"
                                value={modelName}
                                onChange={(e) => setModelName(e.target.value)}
                                placeholder="e.g., AeroX-500 Pro"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Registering..." : "Register Drone"}
                    </button>
                </form>
            </div>
        </div>
    );
}
