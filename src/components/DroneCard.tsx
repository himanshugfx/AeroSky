"use client";

import Image from "next/image";
import Link from "next/link";
import { Plane, ChevronRight } from "lucide-react";
import { Drone } from "@/lib/complianceStore";

interface DroneCardProps {
    drone: Drone;
}

export function DroneCard({ drone }: DroneCardProps) {
    return (
        <Link href={`/admin/drone/${drone.id}`}>
            <div className="group bg-[#0f0f12] border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 cursor-pointer">
                {/* Drone Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
                    {drone.image ? (
                        <img
                            src={drone.image}
                            alt={drone.modelName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Plane className="w-16 h-16 text-gray-700" />
                        </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* UIN Badge */}
                    <div className="absolute top-4 right-4 bg-blue-600/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-[10px] font-bold text-white tracking-wider">{drone.uin}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                                {drone.modelName}
                            </h3>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mt-0.5">
                                {drone.manufacturedUnits?.length || 0} Units Manufactured
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
