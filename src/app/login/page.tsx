"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Lock, User, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid credentials. Access Denied.");
            setLoading(false);
        } else {
            router.push("/admin");
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4 selection:bg-blue-500/30">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md relative">
                {/* Card */}
                <div className="bg-[#121214] border border-white/5 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                            <Shield className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Secure Gateway</h1>
                        <p className="text-gray-400 text-sm text-center">Aerosys Aviation India - Restricted Access</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Username</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-[#1a1a1e] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                    placeholder="Enter administrator ID"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#1a1a1e] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl flex items-center gap-2 animate-shake">
                                <Shield className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                        >
                            {loading ? "Authenticating..." : "Authorize Access"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">High Entropy Security Protocol Active</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
