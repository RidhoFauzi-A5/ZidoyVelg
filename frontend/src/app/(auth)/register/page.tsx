"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import Toast from "@/components/ui/Toast";
import { User, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/auth/register", {
                ...formData,
                address: "-" // Send dummy address since backend might still expect it, or if it's optional it's fine.
            });
            setToast({ message: "Registrasi berhasil! Silakan login.", type: "success" });
            setTimeout(() => {
                router.push("/login?registered=true");
            }, 2000);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Registrasi gagal. Silakan coba lagi.";
            setToast({ message: msg, type: "error" });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1629891005391-ab5104fbcc6b?q=80&w=1920')] bg-cover bg-center relative py-12 px-4 sm:px-6 lg:px-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-0" />

            <div className="max-w-md w-full space-y-8 glass p-8 rounded-2xl relative z-10 border border-white/10 shadow-2xl animate-fade-in-up">
                <div className="text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-accent-gold/20 text-accent-gold text-xs font-bold tracking-widest uppercase mb-4 border border-accent-gold/30">
                        Zidoy Velg
                    </span>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                        Bergabunglah <span className="text-accent-gold">Sekarang</span>
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Dapatkan akses ke koleksi velg premium terbaik.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-accent-gold transition-colors">
                                <User className="h-5 w-5" />
                            </div>
                            <input
                                name="name"
                                type="text"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-lg leading-5 bg-zinc-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-gold focus:border-accent-gold transition-all duration-300"
                                placeholder="Nama Lengkap"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-accent-gold transition-colors">
                                <User className="h-5 w-5" />
                            </div>
                            <input
                                name="username"
                                type="text"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-lg leading-5 bg-zinc-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-gold focus:border-accent-gold transition-all duration-300"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-accent-gold transition-colors">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-lg leading-5 bg-zinc-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-gold focus:border-accent-gold transition-all duration-300"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-accent-gold transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-lg leading-5 bg-zinc-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-gold focus:border-accent-gold transition-all duration-300"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-black bg-white hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-white transition-all duration-300 transform hover:scale-[1.02]"
                    >
                        {loading ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Mendaftar...</>
                        ) : (
                            <div className="flex items-center">
                                Daftar Sekarang <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        Sudah punya akun?{" "}
                        <Link href="/login" className="font-bold text-accent-gold hover:text-yellow-400 transition-colors">
                            Masuk disini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
