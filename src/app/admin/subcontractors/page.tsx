"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Wrench,
    Trash2,
    Edit2,
    X,
    Building2,
    User,
    Mail,
    Phone,
    Calendar,
} from "lucide-react";
import { useComplianceStore, Subcontractor } from "@/lib/complianceStore";

export default function SubcontractorsPage() {
    const { subcontractors, fetchSubcontractors, addSubcontractor, updateSubcontractor, deleteSubcontractor } =
        useComplianceStore();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Subcontractor | null>(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [companyName, setCompanyName] = useState("");
    const [type, setType] = useState<"Design" | "Manufacturing">("Design");
    const [contactPerson, setContactPerson] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [agreementDate, setAgreementDate] = useState("");

    useEffect(() => {
        fetchSubcontractors().finally(() => setLoading(false));
    }, [fetchSubcontractors]);

    const resetForm = () => {
        setCompanyName("");
        setType("Design");
        setContactPerson("");
        setContactEmail("");
        setContactPhone("");
        setAgreementDate("");
        setEditing(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (sub: Subcontractor) => {
        setEditing(sub);
        setCompanyName(sub.companyName);
        setType(sub.type);
        setContactPerson(sub.contactPerson);
        setContactEmail(sub.contactEmail);
        setContactPhone(sub.contactPhone);
        setAgreementDate(sub.agreementDate);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            companyName,
            type,
            contactPerson,
            contactEmail,
            contactPhone,
            agreementDate,
        };

        if (editing) {
            await updateSubcontractor(editing.id, data);
        } else {
            await addSubcontractor(data);
        }

        resetForm();
        setShowModal(false);
    };

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                        Sub-contractors Agreement
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Design and manufacturing sub-contractors list
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" />
                    Add Subcontractor
                </button>
            </div>

            {/* List */}
            {subcontractors.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {subcontractors.map((sub) => (
                        <div
                            key={sub.id}
                            className="bg-[#0f0f12] border border-white/5 rounded-2xl p-4 sm:p-6 group hover:border-white/10 transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-tr from-orange-600/20 to-red-600/20 rounded-2xl flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{sub.companyName}</h3>
                                        <span
                                            className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${sub.type === "Design"
                                                ? "bg-purple-500/20 text-purple-400"
                                                : "bg-green-500/20 text-green-400"
                                                }`}
                                        >
                                            {sub.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(sub)}
                                        className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
                                    >
                                        <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => deleteSubcontractor(sub.id)}
                                        className="w-8 h-8 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <User className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{sub.contactPerson}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar className="w-4 h-4 shrink-0" />
                                    <span>{sub.agreementDate}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Mail className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{sub.contactEmail}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    <span>{sub.contactPhone}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <Wrench className="w-12 h-12 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400 mb-2">
                        No Subcontractors Added
                    </h3>
                    <p className="text-gray-600 max-w-sm mb-6">
                        Add your design and manufacturing subcontractors for DGCA compliance.
                    </p>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-6 py-3 rounded-xl transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add First Subcontractor
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />

                    <div className="relative bg-[#0f0f12] border-x border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col mt-auto sm:mt-0">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-4 p-8 pb-4 border-b border-white/5">
                            <div className="w-12 h-12 bg-orange-600/20 rounded-2xl flex items-center justify-center shrink-0">
                                <Building2 className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {editing ? "Edit Subcontractor" : "Add Subcontractor"}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Design or manufacturing partner
                                </p>
                            </div>
                        </div>

                        <div className="p-8 overflow-y-auto flex-1">
                            <form onSubmit={handleSubmit} id="sub-form" className="space-y-5 pb-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Acme Manufacturing Ltd."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                        Type
                                    </label>
                                    <div className="flex gap-4">
                                        {(["Design", "Manufacturing"] as const).map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setType(t)}
                                                className={`flex-1 py-3 rounded-xl font-medium transition-all ${type === t
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                        Contact Person
                                    </label>
                                    <input
                                        type="text"
                                        value={contactPerson}
                                        onChange={(e) => setContactPerson(e.target.value)}
                                        placeholder="Jane Smith"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                            placeholder="jane@acme.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                        Agreement Date
                                    </label>
                                    <input
                                        type="date"
                                        value={agreementDate}
                                        onChange={(e) => setAgreementDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                        required
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="p-8 border-t border-white/5 bg-[#0f0f12]">
                            <button
                                type="submit"
                                form="sub-form"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                            >
                                {editing ? "Update Subcontractor" : "Add Subcontractor"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
