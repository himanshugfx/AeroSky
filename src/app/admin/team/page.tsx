"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Users,
    Trash2,
    Edit2,
    X,
    User,
    Phone,
    Mail,
    Briefcase,
    Copy,
    Check,
} from "lucide-react";
import { useComplianceStore, TeamMember } from "@/lib/complianceStore";

export default function TeamPage() {
    const { teamMembers, fetchTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember } =
        useComplianceStore();
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [position, setPosition] = useState("");

    useEffect(() => {
        fetchTeamMembers().finally(() => setLoading(false));
    }, [fetchTeamMembers]);

    const resetForm = () => {
        setName("");
        setPhone("");
        setEmail("");
        setPosition("");
        setEditingMember(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (member: TeamMember) => {
        setEditingMember(member);
        setName(member.name);
        setPhone(member.phone);
        setEmail(member.email);
        setPosition(member.position);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingMember) {
            await updateTeamMember(editingMember.id, { name, phone, email, position });
        } else {
            await addTeamMember({ name, phone, email, position });
        }

        resetForm();
        setShowModal(false);
    };

    const copyAccessId = (accessId: string) => {
        navigator.clipboard.writeText(accessId);
        setCopiedId(accessId);
        setTimeout(() => setCopiedId(null), 2000);
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
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        Organizational Manual
                    </h1>
                    <p className="text-gray-500">
                        Manage team members and their access credentials
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" />
                    Add Team Member
                </button>
            </div>

            {/* Team Members List */}
            {teamMembers.length > 0 ? (
                <div className="space-y-4">
                    {teamMembers.map((member) => (
                        <div
                            key={member.id}
                            className="bg-[#0f0f12] border border-white/5 rounded-2xl p-6 flex items-center gap-6 group hover:border-white/10 transition-all"
                        >
                            {/* Avatar */}
                            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 rounded-2xl flex items-center justify-center shrink-0">
                                <User className="w-7 h-7 text-blue-500" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 grid grid-cols-4 gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                                        Name
                                    </p>
                                    <p className="font-semibold text-white">{member.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                                        Position
                                    </p>
                                    <p className="text-sm text-gray-300">{member.position}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                                        Contact
                                    </p>
                                    <p className="text-sm text-gray-300">{member.phone}</p>
                                    <p className="text-xs text-gray-500">{member.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                                        Access ID
                                    </p>
                                    <button
                                        onClick={() => copyAccessId(member.accessId)}
                                        className="flex items-center gap-2 bg-blue-500/10 text-blue-500 px-3 py-1.5 rounded-lg text-sm font-mono hover:bg-blue-500/20 transition-colors"
                                    >
                                        {member.accessId}
                                        {copiedId === member.accessId ? (
                                            <Check className="w-3.5 h-3.5" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEditModal(member)}
                                    className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors"
                                >
                                    <Edit2 className="w-4 h-4 text-gray-400" />
                                </button>
                                <button
                                    onClick={() => deleteTeamMember(member.id)}
                                    className="w-10 h-10 bg-red-500/10 hover:bg-red-500/20 rounded-xl flex items-center justify-center transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <Users className="w-12 h-12 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-400 mb-2">
                        No Team Members Yet
                    </h3>
                    <p className="text-gray-600 max-w-sm mb-6">
                        Add team members to your organizational manual. Each member will receive
                        a unique access ID.
                    </p>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-6 py-3 rounded-xl transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add First Member
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />

                    <div className="relative bg-[#0f0f12] border border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-2xl">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {editingMember ? "Edit Team Member" : "Add Team Member"}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {editingMember
                                        ? "Update member information"
                                        : "Add to organizational manual"}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                    Position
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={position}
                                        onChange={(e) => setPosition(e.target.value)}
                                        placeholder="Chief Technical Officer"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                        Phone
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="john@company.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                            >
                                {editingMember ? "Update Member" : "Add Member"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
