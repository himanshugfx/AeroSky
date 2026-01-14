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
    AlertTriangle,
    Plane,
    GraduationCap,
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

interface ChecklistItemProps {
    title: string;
    description: string;
    icon: LucideIcon;
    isComplete?: boolean;
    status?: { label: string; color: 'green' | 'yellow' | 'red' };
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function ChecklistItem({
    title,
    description,
    icon: Icon,
    isComplete,
    status,
    children,
    defaultOpen = false,
}: ChecklistItemProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    // Determine status style
    let statusBg = "bg-orange-500/20";
    let statusText = "text-orange-500";
    let statusLabel = "Pending";
    let statusIcon = null;

    if (status) {
        if (status.color === 'green') {
            statusBg = "bg-green-500/20";
            statusText = "text-green-500";
            statusIcon = <Check className="w-2.5 h-2.5" />;
        } else if (status.color === 'yellow') {
            statusBg = "bg-yellow-500/20";
            statusText = "text-yellow-500";
            statusIcon = <AlertTriangle className="w-2.5 h-2.5" />;
        } else {
            statusBg = "bg-red-500/20";
            statusText = "text-red-500";
        }
        statusLabel = status.label;
    } else if (isComplete) {
        statusBg = "bg-green-500/20";
        statusText = "text-green-500";
        statusLabel = "Done";
        statusIcon = <Check className="w-2.5 h-2.5" />;
    }

    return (
        <div className="bg-[#0f0f12] border border-white/5 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
                style={{
                    borderLeft: `4px solid ${status?.color === 'yellow' ? '#EAB308' : status?.color === 'green' || isComplete ? '#22C55E' : 'transparent'}`
                }}
            >
                <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${statusBg}`}
                >
                    <Icon className={`w-5 h-5 ${statusText}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-sm">{title}</h3>
                        <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${statusBg} ${statusText}`}>
                            {statusIcon} {statusLabel}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{description}</p>
                </div>
                {isOpen ? (
                    <Check className="w-4 h-4 text-gray-500 shrink-0 opacity-0" /> /* Spacer to keep alignment */
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
        updateManufacturedUnits,
        updateRecurringData,
    } = useComplianceStore();

    const [loading, setLoading] = useState(true);
    const [webPortalLink, setWebPortalLink] = useState("");
    const [otherLabel, setOtherLabel] = useState("");
    const [printMode, setPrintMode] = useState<'one-time' | 'recurring'>('one-time');

    // Recurring Checklist State
    const [personnelData, setPersonnelData] = useState<{ date: string; position: string; previous: string; new: string }[]>([
        { date: '', position: '', previous: '', new: '' },
        { date: '', position: '', previous: '', new: '' },
        { date: '', position: '', previous: '', new: '' }
    ]);
    const [staffCompetenceData, setStaffCompetenceData] = useState<{ date: string; staff: string; examiner: string; result: string }[]>([
        { date: '', staff: '', examiner: '', result: '' },
        { date: '', staff: '', examiner: '', result: '' },
        { date: '', staff: '', examiner: '', result: '' }
    ]);
    const [trainingRecords, setTrainingRecords] = useState<{ date: string; trainer: string; session: string; description: string; duration: string }[]>([
        { date: '', trainer: '', session: '', description: '', duration: '' },
        { date: '', trainer: '', session: '', description: '', duration: '' },
        { date: '', trainer: '', session: '', description: '', duration: '' }
    ]);
    const [personnelReported, setPersonnelReported] = useState(false);

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

        // Load recurring data if exists
        const rData = (drone as any)?.recurringData;
        if (rData?.personnel) {
            setPersonnelData(rData.personnel);
        }
        if (rData?.personnelReported) {
            setPersonnelReported(rData.personnelReported);
        }
        if (rData?.staffCompetence) {
            setStaffCompetenceData(rData.staffCompetence);
        }
        if (rData?.trainingRecords) {
            setTrainingRecords(rData.trainingRecords);
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
        manufacturedUnits: (drone.manufacturedUnits || []).length > 0,
    };

    const completedCount = Object.values(checks).filter(Boolean).length;

    const handleDownloadPDF = (mode: 'one-time' | 'recurring' = 'one-time') => {
        setPrintMode(mode);
        setTimeout(() => window.print(), 100);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="print:hidden">
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
                                DGCA Type Certified
                            </p>
                        </div>
                    </div>
                </div>


                {/* Checklist Items */}
                {/* One Time Checklist Group */}
                <div className="bg-[#0f0f12] border border-white/5 rounded-xl overflow-hidden mb-6">
                    <button
                        onClick={() => {
                            const el = document.getElementById('one-time-checklist-content');
                            const icon = document.getElementById('one-time-checklist-icon');
                            if (el) el.classList.toggle('hidden');
                            if (icon) icon.classList.toggle('rotate-180');
                        }}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                <Check className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-bold text-white">One Time Checklist</h2>
                                <p className="text-sm text-gray-500">Complete these items once for certification</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadPDF('one-time');
                                }}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-4 py-2 rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] text-sm"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                            <ChevronDown id="one-time-checklist-icon" className="w-5 h-5 text-gray-500 transition-transform duration-300" />
                        </div>
                    </button>

                    <div id="one-time-checklist-content" className="hidden p-4 border-t border-white/5 space-y-2">
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

                        {/* 10. Manufactured Units */}
                        <ChecklistItem
                            title="10. Manufactured Units"
                            description="List of individual drone serial numbers"
                            icon={Wrench}
                            isComplete={checks.manufacturedUnits}
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-gray-300">Registered Units</h4>
                                    {drone.manufacturedUnits && drone.manufacturedUnits.length > 0 && (
                                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                                            {drone.manufacturedUnits.length} Units
                                        </span>
                                    )}
                                </div>

                                {/* List of Units */}
                                <div className="space-y-2">
                                    {drone.manufacturedUnits && drone.manufacturedUnits.length > 0 ? (
                                        drone.manufacturedUnits.map((unit, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
                                                <div>
                                                    <p className="text-sm text-white font-mono">{unit.serialNumber}</p>
                                                    <p className="text-xs text-gray-500 font-mono">UIN: {unit.uin}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No units registered yet.</p>
                                    )}
                                </div>

                                {/* Add New Unit Form */}
                                <div className="pt-4 border-t border-white/5">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                        Add New Unit
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        <input
                                            type="text"
                                            placeholder="Serial Number"
                                            id="new-sn"
                                            className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <input
                                            type="text"
                                            placeholder="UIN"
                                            id="new-uin"
                                            className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            const snInput = document.getElementById('new-sn') as HTMLInputElement;
                                            const uinInput = document.getElementById('new-uin') as HTMLInputElement;
                                            const sn = snInput.value.trim();
                                            const uin = uinInput.value.trim();

                                            if (sn && uin) {
                                                const currentUnits = drone.manufacturedUnits || [];
                                                const newUnits = [...currentUnits, { serialNumber: sn, uin: uin }];
                                                updateManufacturedUnits(droneId, newUnits);
                                                snInput.value = '';
                                                uinInput.value = '';
                                            }
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm"
                                    >
                                        Add Unit
                                    </button>
                                </div>
                            </div>
                        </ChecklistItem>
                    </div>
                </div>

                {/* Recurring Checklist Group */}
                <div className="bg-[#0f0f12] border border-white/5 rounded-xl overflow-hidden mb-6">
                    <button
                        onClick={() => {
                            const el = document.getElementById('recurring-checklist-content');
                            const icon = document.getElementById('recurring-checklist-icon');
                            if (el) el.classList.toggle('hidden');
                            if (icon) icon.classList.toggle('rotate-180');
                        }}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                                <Check className="w-5 h-5 text-purple-500" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-bold text-white">Recurring Checklist</h2>
                                <p className="text-sm text-gray-500">Periodic maintenance and compliance checks</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadPDF('recurring');
                                }}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-4 py-2 rounded-lg shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] text-sm"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                            <ChevronDown id="recurring-checklist-icon" className="w-5 h-5 text-gray-500 transition-transform duration-300" />
                        </div>
                    </button>

                    <div id="recurring-checklist-content" className="hidden p-4 border-t border-white/5 space-y-2">

                        {/* 1. Personnel Management */}
                        {/* 1. Personnel Management */}
                        <ChecklistItem
                            title="2. Personnel Management"
                            description="Record of personal competence"
                            icon={Users}
                            status={
                                !personnelData.some(p => p.position || p.new)
                                    ? { label: 'No Change', color: 'green' }
                                    : personnelReported
                                        ? { label: 'DGCA Notified', color: 'green' }
                                        : { label: 'Report to DGCA', color: 'yellow' }
                            }
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-400">
                                    <thead className="text-xs text-gray-500 uppercase bg-white/5">
                                        <tr>
                                            <th className="px-4 py-3 rounded-tl-lg">Date</th>
                                            <th className="px-4 py-3">Position</th>
                                            <th className="px-4 py-3">Previous Personnel</th>
                                            <th className="px-4 py-3 rounded-tr-lg">New Personnel</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {personnelData.map((row, index) => (
                                            <tr key={index} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="date"
                                                        value={row.date}
                                                        onChange={(e) => {
                                                            const newData = [...personnelData];
                                                            newData[index].date = e.target.value;
                                                            setPersonnelData(newData);
                                                            setPersonnelReported(false); // Reset on edit
                                                        }}
                                                        className="bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-white py-1 [&::-webkit-calendar-picker-indicator]:invert"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={row.position}
                                                        onChange={(e) => {
                                                            const newData = [...personnelData];
                                                            newData[index].position = e.target.value;
                                                            setPersonnelData(newData);
                                                            setPersonnelReported(false); // Reset on edit
                                                        }}
                                                        placeholder="e.g. Pilot"
                                                        className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-white py-1"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <select
                                                        value={row.previous}
                                                        onChange={(e) => {
                                                            const newData = [...personnelData];
                                                            newData[index].previous = e.target.value;
                                                            setPersonnelData(newData);
                                                            setPersonnelReported(false); // Reset on edit
                                                        }}
                                                        className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-white py-1 [&>option]:bg-[#0f0f12] [&>option]:text-white"
                                                    >
                                                        <option value="">Select...</option>
                                                        {teamMembers.map(m => (
                                                            <option key={m.id} value={m.name}>{m.name} ({m.accessId})</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <select
                                                        value={row.new}
                                                        onChange={(e) => {
                                                            const newData = [...personnelData];
                                                            newData[index].new = e.target.value;
                                                            setPersonnelData(newData);
                                                            setPersonnelReported(false); // Reset on edit
                                                        }}
                                                        className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-white py-1 [&>option]:bg-[#0f0f12] [&>option]:text-white"
                                                    >
                                                        <option value="">Select...</option>
                                                        {teamMembers.map(m => (
                                                            <option key={m.id} value={m.name}>{m.name} ({m.accessId})</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                                    {personnelData.some(p => p.position || p.new) && !personnelReported ? (
                                        <div className="flex items-center gap-4 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg w-full md:w-auto">
                                            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-yellow-500">Changes detected</p>
                                                <p className="text-[10px] text-gray-400">Please report these changes to DGCA.</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setPersonnelReported(true);
                                                    updateRecurringData(droneId, { personnel: personnelData, personnelReported: true });
                                                }}
                                                className="ml-auto bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border-2 border-transparent hover:border-yellow-300"
                                            >
                                                Reported to DGCA
                                            </button>
                                        </div>
                                    ) : (<div></div>)}

                                    <button
                                        onClick={() => {
                                            setPersonnelReported(false); // Reset reported status on edit save
                                            updateRecurringData(droneId, { personnel: personnelData, personnelReported: false });
                                        }}
                                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </ChecklistItem>

                        {/* 2. Staff Competence  */}
                        <ChecklistItem
                            title="3. Staff Competence"
                            description="Random checks of staff understanding and compliance"
                            icon={UserCheck}
                            isComplete={staffCompetenceData.some(s => s.staff && s.result)}
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-400">
                                    <thead className="text-xs text-gray-500 uppercase bg-white/5">
                                        <tr>
                                            <th className="px-4 py-3 rounded-tl-lg">Date</th>
                                            <th className="px-4 py-3">Staff Examined</th>
                                            <th className="px-4 py-3">Examined By</th>
                                            <th className="px-4 py-3 rounded-tr-lg">Result</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staffCompetenceData.map((row, index) => (
                                            <tr key={index} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="date"
                                                        value={row.date}
                                                        onChange={(e) => {
                                                            const newData = [...staffCompetenceData];
                                                            newData[index].date = e.target.value;
                                                            setStaffCompetenceData(newData);
                                                        }}
                                                        className="bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-white py-1 [&::-webkit-calendar-picker-indicator]:invert"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <select
                                                        value={row.staff}
                                                        onChange={(e) => {
                                                            const newData = [...staffCompetenceData];
                                                            newData[index].staff = e.target.value;
                                                            setStaffCompetenceData(newData);
                                                        }}
                                                        className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-white py-1 [&>option]:bg-[#0f0f12] [&>option]:text-white"
                                                    >
                                                        <option value="">Select Staff...</option>
                                                        {teamMembers.map(m => (
                                                            <option key={m.id} value={m.name}>{m.name} ({m.accessId})</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <select
                                                        value={row.examiner}
                                                        onChange={(e) => {
                                                            const newData = [...staffCompetenceData];
                                                            newData[index].examiner = e.target.value;
                                                            setStaffCompetenceData(newData);
                                                        }}
                                                        className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-white py-1 [&>option]:bg-[#0f0f12] [&>option]:text-white"
                                                    >
                                                        <option value="">Select Examiner...</option>
                                                        {teamMembers.map(m => (
                                                            <option key={m.id} value={m.name}>{m.name} ({m.accessId})</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <select
                                                        value={row.result}
                                                        onChange={(e) => {
                                                            const newData = [...staffCompetenceData];
                                                            newData[index].result = e.target.value;
                                                            setStaffCompetenceData(newData);
                                                        }}
                                                        className={`w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none py-1 [&>option]:bg-[#0f0f12] [&>option]:text-white ${row.result === 'Competent' ? 'text-green-500' : row.result === 'Needs Training' ? 'text-red-500' : 'text-white'
                                                            }`}
                                                    >
                                                        <option value="">Select Result...</option>
                                                        <option value="Competent">Staff is competent</option>
                                                        <option value="Needs Training">Staff needs to be trained</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => updateRecurringData(droneId, { staffCompetence: staffCompetenceData })}
                                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </ChecklistItem>

                        {/* 4. Training Records */}
                        <ChecklistItem
                            title="4. Training Record"
                            description="Training record of two years"
                            icon={GraduationCap}
                            isComplete={trainingRecords.some(t => t.trainer && t.session)}
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-400">
                                    <thead className="text-xs text-gray-500 uppercase bg-white/5">
                                        <tr>
                                            <th className="px-4 py-3 rounded-tl-lg">Date</th>
                                            <th className="px-4 py-3">Trainer</th>
                                            <th className="px-4 py-3">Session Name</th>
                                            <th className="px-4 py-3">Description</th>
                                            <th className="px-4 py-3 rounded-tr-lg">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trainingRecords.map((row, index) => (
                                            <tr key={index} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="date"
                                                        value={row.date}
                                                        onChange={(e) => {
                                                            const newData = [...trainingRecords];
                                                            newData[index].date = e.target.value;
                                                            setTrainingRecords(newData);
                                                        }}
                                                        className="bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-white py-1 [&::-webkit-calendar-picker-indicator]:invert"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={row.trainer}
                                                        onChange={(e) => {
                                                            const newData = [...trainingRecords];
                                                            newData[index].trainer = e.target.value;
                                                            setTrainingRecords(newData);
                                                        }}
                                                        placeholder="Trainer Name"
                                                        className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-white py-1"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={row.session}
                                                        onChange={(e) => {
                                                            const newData = [...trainingRecords];
                                                            newData[index].session = e.target.value;
                                                            setTrainingRecords(newData);
                                                        }}
                                                        placeholder="Session Name"
                                                        className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-white py-1"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={row.description}
                                                        onChange={(e) => {
                                                            const newData = [...trainingRecords];
                                                            newData[index].description = e.target.value;
                                                            setTrainingRecords(newData);
                                                        }}
                                                        placeholder="Topics covered..."
                                                        className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-white py-1"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        value={row.duration}
                                                        onChange={(e) => {
                                                            const newData = [...trainingRecords];
                                                            newData[index].duration = e.target.value;
                                                            setTrainingRecords(newData);
                                                        }}
                                                        placeholder="e.g. 2 hrs"
                                                        className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-white py-1"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => updateRecurringData(droneId, { trainingRecords: trainingRecords })}
                                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </ChecklistItem>

                    </div>
                </div>
            </div>

            {/* Print Only View */}
            <div className="hidden print:block text-black bg-white p-6">
                {printMode === 'one-time' ? (
                    <>
                        <div className="text-center mb-8 border-b-2 border-black pb-4">
                            <h1 className="text-3xl font-bold uppercase tracking-wider">{drone.modelName}</h1>
                            <p className="text-sm text-gray-600">DGCA Compliance Checklist Report</p>
                            <p className="text-xs text-gray-400 mt-1">Generated: {new Date().toLocaleDateString()}</p>
                        </div>

                        <div className="space-y-6">
                            {/* Organization */}
                            <section className="break-inside-avoid">
                                <h2 className="text-lg font-bold border-b border-gray-300 mb-3 pb-1">1. Organizational Structure</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {teamMembers.map((m) => (
                                        <div key={m.id} className="border p-2 rounded">
                                            <p className="font-bold">{m.name}</p>
                                            <p className="text-sm">{m.position}</p>
                                            <p className="text-xs text-gray-500">{m.email} | {m.phone}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Accountable Manager */}
                            <section className="break-inside-avoid">
                                <h2 className="text-lg font-bold border-b border-gray-300 mb-3 pb-1">2. Leadership & Accountability</h2>
                                <p className="text-sm">
                                    <span className="font-bold">Accountable Manager:</span> {accountableManager?.name || "Not Assigned"}
                                </p>
                            </section>

                            {/* Documents */}
                            <section className="break-inside-avoid">
                                <h2 className="text-lg font-bold border-b border-gray-300 mb-3 pb-1">3. Documentation</h2>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                    <li>Training Manual: {uploads.trainingManual ? "Uploaded" : "Pending"}</li>
                                    <li>System Design: {uploads.systemDesign ? "Uploaded" : "Pending"}</li>
                                    <li>Web Portal: {uploads.webPortalLink || "Not Set"}</li>
                                </ul>
                            </section>

                            {/* Infrastructure Images */}
                            <section className="break-inside-avoid">
                                <h2 className="text-lg font-bold border-b border-gray-300 mb-3 pb-1">4. Infrastructure Photos</h2>

                                <div className="mb-4">
                                    <h3 className="font-bold text-sm mb-2">Manufacturing Facility</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {uploads.infrastructureManufacturing.map((img: string, i: number) => (
                                            <img key={i} src={img} className="w-full h-32 object-cover border" alt="Manufacturing" />
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="font-bold text-sm mb-2">Testing Facility</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {uploads.infrastructureTesting.map((img: string, i: number) => (
                                            <img key={i} src={img} className="w-full h-32 object-cover border" alt="Testing" />
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <h3 className="font-bold text-sm mb-2">Office</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {uploads.infrastructureOffice.map((img: string, i: number) => (
                                            <img key={i} src={img} className="w-full h-32 object-cover border" alt="Office" />
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Regulatory Display */}
                            <section className="break-inside-avoid">
                                <h2 className="text-lg font-bold border-b border-gray-300 mb-3 pb-1">5. Regulatory Diplay & Security</h2>
                                <div className="grid grid-cols-3 gap-2">
                                    {uploads.regulatoryDisplay.map((img: string, i: number) => (
                                        <img key={i} src={img} className="w-full h-32 object-cover border" alt="Regulatory" />
                                    ))}
                                    {uploads.hardwareSecurity.map((img: string, i: number) => (
                                        <img key={i} src={img} className="w-full h-32 object-cover border" alt="Security" />
                                    ))}
                                </div>
                            </section>

                            {/* Units */}
                            <section className="break-inside-avoid">
                                <h2 className="text-lg font-bold border-b border-gray-300 mb-3 pb-1">6. Manufactured Units</h2>
                                <table className="w-full text-sm text-left border">
                                    <thead className="bg-gray-100 uppercase text-xs">
                                        <tr>
                                            <th className="p-2 border">Serial Number</th>
                                            <th className="p-2 border">UIN</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {drone.manufacturedUnits?.map((unit, i) => (
                                            <tr key={i} className="border-b">
                                                <td className="p-2 border font-mono">{unit.serialNumber}</td>
                                                <td className="p-2 border font-mono">{unit.uin}</td>
                                            </tr>
                                        ))}
                                        {(!drone.manufacturedUnits || drone.manufacturedUnits.length === 0) && (
                                            <tr>
                                                <td colSpan={2} className="p-2 text-center text-gray-500">No units registered</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </section>
                        </div>
                    </>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8 border-b-2 border-black pb-4">
                            <h1 className="text-3xl font-bold uppercase tracking-wider">{drone.modelName}</h1>
                            <p className="text-sm text-gray-600">Recurring Compliance Report</p>
                            <p className="text-xs text-gray-400 mt-1">Generated: {new Date().toLocaleDateString()}</p>
                        </div>

                        {/* Personnel Management Section in Print */}
                        <section className="break-inside-avoid mb-8">
                            <h2 className="text-lg font-bold border-b border-gray-300 mb-3 pb-1">2. Personnel Management</h2>
                            <table className="w-full text-sm text-left border collapse">
                                <thead className="bg-gray-100 uppercase text-xs">
                                    <tr>
                                        <th className="border p-2 w-1/6">Date</th>
                                        <th className="border p-2 w-1/4">Position</th>
                                        <th className="border p-2 w-1/4">Previous Personnel</th>
                                        <th className="border p-2 w-1/3">New Personnel</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {personnelData.some(p => p.position || p.previous || p.new) ? (
                                        personnelData.map((row, i) => (
                                            <tr key={i}>
                                                <td className="border p-2">{row.date || '-'}</td>
                                                <td className="border p-2 font-semibold min-h-[2rem]">{row.position || '-'}</td>
                                                <td className="border p-2">{row.previous || '-'}</td>
                                                <td className="border p-2">{row.new || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="border p-2 text-center text-gray-500 italic">No personnel changes recorded.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </section>

                        {/* Staff Competence Section in Print */}
                        <section className="break-inside-avoid mb-8">
                            <h2 className="text-lg font-bold border-b border-gray-300 mb-3 pb-1">3. Staff Competence</h2>
                            <table className="w-full text-sm text-left border collapse">
                                <thead className="bg-gray-100 uppercase text-xs">
                                    <tr>
                                        <th className="border p-2 w-1/6">Date</th>
                                        <th className="border p-2 w-1/4">Staff Examined</th>
                                        <th className="border p-2 w-1/4">Examined By</th>
                                        <th className="border p-2 w-1/3">Result</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffCompetenceData.some(s => s.staff || s.result) ? (
                                        staffCompetenceData.map((row, i) => (
                                            <tr key={i}>
                                                <td className="border p-2">{row.date || '-'}</td>
                                                <td className="border p-2">{row.staff || '-'}</td>
                                                <td className="border p-2">{row.examiner || '-'}</td>
                                                <td className={`border p-2 font-semibold ${row.result === 'Competent' ? 'text-green-700' :
                                                    row.result === 'Needs Training' ? 'text-red-700' : ''
                                                    }`}>
                                                    {row.result || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="border p-2 text-center text-gray-500 italic">No staff competence checks recorded.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </section>

                        {/* Training Records Section in Print */}
                        <section className="break-inside-avoid mb-8">
                            <h2 className="text-lg font-bold border-b border-gray-300 mb-3 pb-1">4. Training Record</h2>
                            <table className="w-full text-sm text-left border collapse">
                                <thead className="bg-gray-100 uppercase text-xs">
                                    <tr>
                                        <th className="border p-2 w-1/6">Date</th>
                                        <th className="border p-2 w-1/5">Trainer</th>
                                        <th className="border p-2 w-1/5">Session</th>
                                        <th className="border p-2 w-1/4">Description</th>
                                        <th className="border p-2 w-1/6">Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trainingRecords.some(t => t.trainer || t.session) ? (
                                        trainingRecords.map((row, i) => (
                                            <tr key={i}>
                                                <td className="border p-2">{row.date || '-'}</td>
                                                <td className="border p-2">{row.trainer || '-'}</td>
                                                <td className="border p-2 font-semibold">{row.session || '-'}</td>
                                                <td className="border p-2 text-xs">{row.description || '-'}</td>
                                                <td className="border p-2">{row.duration || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="border p-2 text-center text-gray-500 italic">No training records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </section>

                        <div className="border-t-2 border-gray-200 py-8 text-center">
                            <p className="text-xs text-gray-400">End of Recurring Compliance Report</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
