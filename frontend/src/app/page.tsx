"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch all products and slice the top 3 for "Featured"
        // In a real app, you might have a specific endpoint or query param like ?featured=true
        const res = await api.get("/products");
        setFeaturedProducts(res.data.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch featured products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-10" />
          {/* Placeholder for Video/Image */}
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1920')] bg-cover bg-center opacity-60 grayscale hover:grayscale-0 transition-all duration-1000 transform scale-105" />
        </div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-accent-gold/20 text-accent-gold text-sm font-bold tracking-widest uppercase mb-4 border border-accent-gold/30">
            Zidoy Velg Project
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter leading-tight drop-shadow-2xl">
            Upgrade Kaki-Kaki <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-white">Motor Impianmu</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-light">
            Pusat velg motor terlengkap. Dari harian sampai kompetisi. RCB, Rossi, TDR, Takasago Excel. 100% Original.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog">
              <Button size="lg" className="w-full sm:w-auto text-lg font-bold bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Belanja Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Terlaris Minggu Ini</h2>
            <p className="text-gray-400">Pilihan favorit para rider.</p>
          </div>
          <Link href="/catalog">
            <Button variant="ghost" className="text-accent-gold hover:text-white">Lihat Semua →</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Belum ada produk yang ditampilkan.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </section>

      {/* Brands / Trust */}
      <section className="py-20 border-t border-white/5 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">100% Original</h3>
            <p className="text-gray-400">Garansi uang kembali jika barang palsu.</p>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">Pemasangan Gratis</h3>
            <p className="text-gray-400">Khusus pembelian di store offline kami.</p>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">Pengiriman Aman</h3>
            <p className="text-gray-400">Packing kayu untuk pengiriman luar kota.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
