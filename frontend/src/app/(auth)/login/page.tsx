"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/auth/login", { email, password });
            const token = res.data.token;
            localStorage.setItem("token", token);

            // Simple JWT decode to check role (payload is part 2 of token)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.role || "customer";

            if (role === "admin") {
                router.push("/admin/dashboard");
            } else {
                router.push("/");
            }

        } catch (err: any) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 glass p-8 rounded-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Masuk ke Zidoy Velg
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Atau{" "}
                        <Link href="/register" className="font-medium text-accent-gold hover:text-white transition-colors">
                            buat akun baru
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-zinc-700 bg-zinc-900/50 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-accent-gold focus:border-accent-gold focus:z-10 sm:text-sm"
                                placeholder="Alamat Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-zinc-700 bg-zinc-900/50 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-accent-gold focus:border-accent-gold focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                    <div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 text-sm font-bold rounded-md text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-white"
                        >
                            {loading ? "Memproses..." : "Masuk"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
