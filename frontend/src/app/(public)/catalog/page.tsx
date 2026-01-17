"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function CatalogPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        brand: "",
        spec: "", // Ring or PCD
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/products');
            setAllProducts(res.data);
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Client-side filtering for robust UX
    useEffect(() => {
        let result = allProducts;
        if (filters.brand) {
            result = result.filter(p => p.brand && p.brand.toLowerCase() === filters.brand.toLowerCase());
        }
        if (filters.spec) {
            // Loose matching for Spec (e.g. "Ring 17" matches "Ring 17 4x100")
            result = result.filter(p => p.spec && p.spec.toLowerCase().includes(filters.spec.toLowerCase()));
        }
        setProducts(result);
    }, [filters, allProducts]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value === prev[key as keyof typeof prev] ? "" : value }));
    };

    return (
        <div className="min-h-screen bg-zinc-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar Filter */}
                <aside className="lg:col-span-1 space-y-8">
                    <div className="glass p-6 rounded-xl sticky top-24">
                        <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">Filter Produk</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Merk / Brand</h3>
                                <div className="space-y-2">
                                    {["Racing Boy", "Rossi", "TDR", "Excel", "BRT", "Scarlet"].map(brand => (
                                        <div key={brand} className="flex items-center">
                                            <button
                                                onClick={() => handleFilterChange('brand', brand)}
                                                className={`text-sm hover:text-white transition-colors ${filters.brand === brand ? 'text-accent-gold font-bold' : 'text-gray-500'}`}
                                            >
                                                {brand}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Ukuran Ring</h3>
                                <div className="flex flex-wrap gap-2">
                                    {["Ring 14", "Ring 17", "Ring 12", "Ring 10"].map(size => (
                                        <button
                                            key={size}
                                            onClick={() => handleFilterChange('spec', size)}
                                            className={`px-3 py-1 rounded text-xs border ${filters.spec === size ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-zinc-700 hover:border-gray-500'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Button onClick={() => setFilters({ brand: "", spec: "" })} variant="outline" size="sm" className="w-full mt-4 text-xs">
                                    Reset Filter
                                </Button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <main className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-white">Katalog Velg Motor</h1>
                        <span className="text-gray-400 text-sm">{products.length} Produk</span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-80 bg-zinc-900 rounded-xl"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map(product => (
                                <ProductCard key={product.id} {...product} />
                            ))}
                        </div>
                    )}

                    {products.length === 0 && !loading && (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-lg">Tidak ada produk yang cocok dengan filter.</p>
                            <Button onClick={() => setFilters({ brand: "", spec: "" })} variant="secondary" className="mt-4">
                                Bersihkan Filter
                            </Button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
