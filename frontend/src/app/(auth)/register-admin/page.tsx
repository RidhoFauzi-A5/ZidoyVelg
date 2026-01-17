"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";

export default function RegisterAdminPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    address: "Kantor Pusat Zidoy Velg", // Default address for admin
    role: "admin"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", formData);
      alert("Akun Admin berhasil dibuat! Silakan login.");
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal membuat akun admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass p-8 rounded-2xl relative overflow-hidden">
        {/* Banner Warning */}
        <div className="bg-red-500/20 text-red-200 text-xs text-center py-2 mb-4 rounded border border-red-500/30">
           HALAMAN KHUSUS ADMIN - HAPUS SETELAH DIPAKAI
        </div>

        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
            Daftar Admin Baru
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Kembali ke{" "}
            <Link href="/login" className="font-medium text-accent-gold hover:text-white transition-colors">
              Halaman Login
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="text-sm text-gray-400">Username</label>
              <input
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-zinc-700 bg-zinc-900/50 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-accent-gold focus:border-accent-gold focus:z-10 sm:text-sm"
                placeholder="Username Admin"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
               <label className="text-sm text-gray-400">Email</label>
              <input
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-zinc-700 bg-zinc-900/50 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-accent-gold focus:border-accent-gold focus:z-10 sm:text-sm"
                placeholder="Email Admin"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
               <label className="text-sm text-gray-400">Password</label>
              <input
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-zinc-700 bg-zinc-900/50 placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-accent-gold focus:border-accent-gold focus:z-10 sm:text-sm"
                placeholder="Password Kuat"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 text-sm font-bold rounded-md text-black bg-accent-gold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-accent-gold"
            >
              {loading ? "Mendaftarkan..." : "Buat Akun Admin"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
