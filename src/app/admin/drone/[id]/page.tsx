"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    ArrowLeft,
    Users,
    FileText,
    UserCheck,
    Building2,
    Shield,
    Settings,
    Wrench,
    Lock,
    Globe,
    Download,
    ChevronDown,
    ChevronUp,
    Check,
    Plane,
} from "lucide-react";
import { useComplianceStore } from "@/lib/complianceStore";
import { FileUploader } from "@/components/FileUploader";
import Link from "next/link";

interface ChecklistItemProps {
    title: string;
    description: string;
    icon: React.ElementType;
    isComplete: boolean;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function ChecklistItem({
    title,
    description,
    icon: Icon,
    isComplete,
    children,
    defaultOpen = false,
}: ChecklistItemProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-[#0f0f12] border border-white/5 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
            >
                <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isComplete ? "bg-green-500/20" : "bg-white/5"
                        }`}
                >
                    <Icon className={`w-5 h-5 ${isComplete ? "text-green-500" : "text-gray-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-sm">{title}</h3>
                        {isComplete ? (
                            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-500">
                                <Check className="w-2.5 h-2.5" /> Done
                            </span>
                        ) : (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-500">
                                Pending
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{description}</p>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                )}
            </button>
            {isOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-white/5">{children}</div>
            )}
        </div>
    );
}

export default function DroneProfilePage() {
    const params = useParams();
    const router = useRouter();
    const droneId = params.id as string;

    const {
        drones,
        fetchDrones,
        teamMembers,
        fetchTeamMembers,
        subcontractors,
        fetchSubcontractors,
        updateDroneUploads,
        assignAccountableManager,
        updateWebPortal,
    } = useComplianceStore();

    const [loading, setLoading] = useState(true);
    const [webPortalLink, setWebPortalLink] = useState("");
    const [otherLabel, setOtherLabel] = useState("");

    useEffect(() => {
        Promise.all([fetchDrones(), fetchTeamMembers(), fetchSubcontractors()]).finally(() =>
            setLoading(false)
        );
    }, [fetchDrones, fetchTeamMembers, fetchSubcontractors]);

    const drone = drones.find((d) => d.id === droneId);

    useEffect(() => {
        if (drone?.uploads.webPortalLink) {
            setWebPortalLink(drone.uploads.webPortalLink);
        }
    }, [drone]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!drone) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Plane className="w-16 h-16 text-gray-600 mb-4" />
                <h2 className="text-xl font-bold text-gray-400">Drone Not Found</h2>
                <Link href="/admin" className="text-blue-500 mt-4 hover:underline">
                    Back to Registry
                </Link>
            </div>
        );
    }

    const uploads = drone.uploads;
    const accountableManager = teamMembers.find((m) => m.id === drone.accountableManagerId);

    // Check completion status
    const checks = {
        orgManual: teamMembers.length > 0,
        trainingManual: !!uploads.trainingManual,
        leadership: !!drone.accountableManagerId,
        infrastructure:
            uploads.infrastructureManufacturing.length > 0 ||
            uploads.infrastructureTesting.length > 0 ||
            uploads.infrastructureOffice.length > 0,
        regulatory: uploads.regulatoryDisplay.length > 0,
        systemDesign: !!uploads.systemDesign,
        subcontractors: subcontractors.length > 0,
        hardware: uploads.hardwareSecurity.length > 0,
        webPortal: !!uploads.webPortalLink,
    };

    const completedCount = Object.values(checks).filter(Boolean).length;

    const handleDownloadPDF = () => {
        window.print();
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Button & Header */}
            <div className="flex items-center gap-6 mb-8">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
                <div className="flex items-center gap-4 flex-1">
                    {drone.image ? (
                        <img
                            src={drone.image}
                            alt={drone.modelName}
                            className="w-16 h-16 rounded-2xl object-cover"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                            <Plane className="w-8 h-8 text-gray-600" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-white">{drone.modelName}</h1>
                        <p className="text-sm text-gray-500 uppercase font-bold tracking-widest">
                            UIN: {drone.uin}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                    <Download className="w-4 h-4" />
                    Download PDF
                </button>
            </div>

            {/* Manufactured Units */}
            {drone.manufacturedUnits && drone.manufacturedUnits.length > 0 && (
                <div className="bg-[#0f0f12] border border-white/5 rounded-2xl p-6 mb-8">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-blue-500" />
                        Manufactured Units ({drone.manufacturedUnits.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {drone.manufacturedUnits.map((sn, idx) => (
                            <span
                                key={idx}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-400 hover:text-blue-400 hover:border-blue-500/30 transition-all"
                            >
                                {sn}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Checklist Items */}
            <div className="space-y-2">
                {/* 1. Organizational Manual */}
                <ChecklistItem
                    title="1. Organizational Manual"
                    description="Team members with name, phone, email and position"
                    icon={Users}
                    isComplete={checks.orgManual}
                >
                    {teamMembers.length > 0 ? (
                        <div className="space-y-2">
                            {teamMembers.map((m) => (
                                <div key={m.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                        <Users className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{m.name}</p>
                                        <p className="text-xs text-gray-500">{m.position}</p>
                                    </div>
                                    <span className="text-xs font-mono text-blue-400">{m.accessId}</span>
                                </div>
                            ))}
                            <Link
                                href="/admin/team"
                                className="block text-center text-sm text-blue-500 hover:underline mt-4"
                            >
                                Manage Team Members →
                            </Link>
                        </div>
                    ) : (
                        <Link
                            href="/admin/team"
                            className="block text-center text-sm text-blue-500 hover:underline"
                        >
                            Add Team Members →
                        </Link>
                    )}
                </ChecklistItem>

                {/* 2. Training Procedure Manual */}
                <ChecklistItem
                    title="2. Training Procedure Manual"
                    description="Upload training procedure documentation"
                    icon={FileText}
                    isComplete={checks.trainingManual}
                >
                    <FileUploader
                        onUpload={(files) => updateDroneUploads(droneId, "training_manual", files[0])}
                        existingFiles={uploads.trainingManual ? [uploads.trainingManual] : []}
                        accept=".pdf,.doc,.docx"
                        label="Upload Training Manual (PDF)"
                    />
                </ChecklistItem>

                {/* 3. Nomination of Leadership */}
                <ChecklistItem
                    title="3. Nomination of Leadership"
                    description="Assign Accountable Manager for this drone"
                    icon={UserCheck}
                    isComplete={checks.leadership}
                >
                    {teamMembers.length > 0 ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400">Select an Accountable Manager:</p>
                            <div className="grid grid-cols-2 gap-3">
                                {teamMembers.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => assignAccountableManager(droneId, m.id)}
                                        className={`p-4 rounded-xl text-left transition-all ${drone.accountableManagerId === m.id
                                            ? "bg-blue-600/20 border-2 border-blue-500"
                                            : "bg-white/5 border border-white/10 hover:border-white/20"
                                            }`}
                                    >
                                        <p className="font-medium text-white">{m.name}</p>
                                        <p className="text-xs text-gray-500">{m.position}</p>
                                    </button>
                                ))}
                            </div>
                            {accountableManager && (
                                <p className="text-sm text-green-500 flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    {accountableManager.name} assigned as Accountable Manager
                                </p>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/admin/team"
                            className="block text-center text-sm text-blue-500 hover:underline"
                        >
                            Add Team Members First →
                        </Link>
                    )}
                </ChecklistItem>

                {/* 4. Infrastructure Setup */}
                <ChecklistItem
                    title="4. Infrastructure Setup"
                    description="Upload images of physical facilities"
                    icon={Building2}
                    isComplete={checks.infrastructure}
                >
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-3">
                                Manufacturing Facility (3-5 images)
                            </h4>
                            <FileUploader
                                onUpload={(files) =>
                                    updateDroneUploads(droneId, "infrastructure_manufacturing", files)
                                }
                                existingFiles={uploads.infrastructureManufacturing}
                                multiple
                                maxFiles={5}
                                label="Upload Manufacturing Images"
                            />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-3">
                                Testing Facility (3-5 images)
                            </h4>
                            <FileUploader
                                onUpload={(files) =>
                                    updateDroneUploads(droneId, "infrastructure_testing", files)
                                }
                                existingFiles={uploads.infrastructureTesting}
                                multiple
                                maxFiles={5}
                                label="Upload Testing Facility Images"
                            />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-3">
                                Office Space (3-5 images)
                            </h4>
                            <FileUploader
                                onUpload={(files) =>
                                    updateDroneUploads(droneId, "infrastructure_office", files)
                                }
                                existingFiles={uploads.infrastructureOffice}
                                multiple
                                maxFiles={5}
                                label="Upload Office Images"
                            />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-3">
                                Other Facilities (with label)
                            </h4>
                            <div className="flex gap-3 mb-3">
                                <input
                                    type="text"
                                    value={otherLabel}
                                    onChange={(e) => setOtherLabel(e.target.value)}
                                    placeholder="e.g., Warehouse, R&D Lab"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <FileUploader
                                onUpload={(files) => {
                                    if (otherLabel && files.length > 0) {
                                        updateDroneUploads(droneId, "infrastructure_others", files[0], otherLabel);
                                        setOtherLabel("");
                                    }
                                }}
                                label="Upload with Label"
                            />
                            {uploads.infrastructureOthers.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {uploads.infrastructureOthers.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                                            <img
                                                src={item.image}
                                                alt={item.label}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                            <span className="text-sm text-gray-300">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </ChecklistItem>

                {/* 5. Regulatory Display */}
                <ChecklistItem
                    title="5. Regulatory Display"
                    description="Type certificate display & fireproof plates for UAVs"
                    icon={Shield}
                    isComplete={checks.regulatory}
                >
                    <FileUploader
                        onUpload={(files) => updateDroneUploads(droneId, "regulatory_display", files)}
                        existingFiles={uploads.regulatoryDisplay}
                        multiple
                        maxFiles={5}
                        label="Upload TC Display & Fireproof Plate Photos"
                    />
                </ChecklistItem>

                {/* 6. System Design */}
                <ChecklistItem
                    title="6. System Design"
                    description="Control and supervision of design changes procedure"
                    icon={Settings}
                    isComplete={checks.systemDesign}
                >
                    <FileUploader
                        onUpload={(files) => updateDroneUploads(droneId, "system_design", files[0])}
                        existingFiles={uploads.systemDesign ? [uploads.systemDesign] : []}
                        accept=".pdf,.doc,.docx"
                        label="Upload System Design Procedure (PDF)"
                    />
                </ChecklistItem>

                {/* 7. Sub-contractors Agreement */}
                <ChecklistItem
                    title="7. Sub-contractors Agreement"
                    description="Design and manufacturing sub-contractors list"
                    icon={Wrench}
                    isComplete={checks.subcontractors}
                >
                    {subcontractors.length > 0 ? (
                        <div className="space-y-2">
                            {subcontractors.map((s) => (
                                <div key={s.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{s.companyName}</p>
                                        <p className="text-xs text-gray-500">{s.type}</p>
                                    </div>
                                </div>
                            ))}
                            <Link
                                href="/admin/subcontractors"
                                className="block text-center text-sm text-blue-500 hover:underline mt-4"
                            >
                                Manage Subcontractors →
                            </Link>
                        </div>
                    ) : (
                        <Link
                            href="/admin/subcontractors"
                            className="block text-center text-sm text-blue-500 hover:underline"
                        >
                            Add Subcontractors →
                        </Link>
                    )}
                </ChecklistItem>

                {/* 8. Hardware Security */}
                <ChecklistItem
                    title="8. Hardware Security"
                    description="Tamperproof requirements demonstration"
                    icon={Lock}
                    isComplete={checks.hardware}
                >
                    <FileUploader
                        onUpload={(files) => updateDroneUploads(droneId, "hardware_security", files)}
                        existingFiles={uploads.hardwareSecurity}
                        multiple
                        maxFiles={5}
                        label="Upload Tamperproof Demonstration Images"
                    />
                </ChecklistItem>

                {/* 9. Web Portal */}
                <ChecklistItem
                    title="9. Web Portal"
                    description="Public access portal for UAS information"
                    icon={Globe}
                    isComplete={checks.webPortal}
                >
                    <div className="space-y-4">
                        <input
                            type="url"
                            value={webPortalLink}
                            onChange={(e) => setWebPortalLink(e.target.value)}
                            placeholder="https://your-public-portal.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                        />
                        <button
                            onClick={() => updateWebPortal(droneId, webPortalLink)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2 rounded-xl transition-colors"
                        >
                            Save Portal Link
                        </button>
                        {uploads.webPortalLink && (
                            <p className="text-sm text-green-500 flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                Portal link saved:{" "}
                                <a
                                    href={uploads.webPortalLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline"
                                >
                                    {uploads.webPortalLink}
                                </a>
                            </p>
                        )}
                    </div>
                </ChecklistItem>
            </div>
        </div>
    );
}
