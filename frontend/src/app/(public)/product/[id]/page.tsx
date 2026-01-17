"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ShoppingCart, Loader2, Minus, Plus } from "lucide-react";
import Toast from "@/components/ui/Toast";
import { useCart } from "@/context/CartContext";
import { getColorHex } from "@/lib/colors";
import ProductCard from "@/components/ProductCard";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const id = params.id;
                // Fetch Main Product
                const res = await api.get(`/products/${id}`);
                const currentProduct = res.data;
                setProduct(currentProduct);

                // Fetch Related Products (Client-side filtering for simplicity)
                const resAll = await api.get('/products');
                const related = resAll.data
                    .filter((p: any) => p.category === currentProduct.category && p.id !== currentProduct.id)
                    .slice(0, 3);
                setRelatedProducts(related);

            } catch (err) {
                console.error(err);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id]);

    useEffect(() => {
        if (product && !selectedVariant) {
            setSelectedVariant(product);
        }
    }, [product]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, quantity);
        setToast({ message: "Produk berhasil ditambahkan ke keranjang!", type: "success" });
    };

    const handleBuyNow = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setToast({ message: "Silakan login terlebih dahulu!", type: "error" });
            setTimeout(() => router.push("/login"), 1500);
            return;
        }

        if (!product) return;

        // Redirect to Cart for cleaner flow
        addToCart(product, quantity);
        router.push("/cart");
    };

    if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    // If API/Mock failed completely
    if (!product) return (
        <div className="min-h-screen pt-24 text-center text-white flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-4">Produk Tidak Ditemukan</h2>
            <Button onClick={() => router.push("/")} variant="ghost">Kembali ke Home</Button>
        </div>
    );

    const getImageUrl = (path: string) => {
        if (!path) return "https://placehold.co/400?text=No+Img";
        if (path.startsWith("http")) return path;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5238";
        return `${baseUrl}${path}`;
    };

    const isLowStock = product.stock > 0 && product.stock <= 5;

    return (
        <div className="min-h-screen bg-zinc-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                {/* Image Section */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 glass order-first md:order-none">
                    {/* Simplified Image Render */}
                    <img
                        src={getImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-contain p-8 hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* Details Section */}
                <div className="space-y-8 flex flex-col justify-center">
                    <div>
                        <h2 className="text-sm font-semibold text-accent-gold uppercase tracking-widest mb-2">{product.brand}</h2>
                        <h1 className="text-4xl xs:text-5xl font-black text-white mb-4 leading-tight">{product.name}</h1>
                        <p className="text-gray-400 leading-relaxed text-lg">{product.description || "Velg berkualitas tinggi untuk kebutuhan motor anda."}</p>
                    </div>

                    {/* Price & Stock with Smart Alert */}
                    <div className="border-t border-b border-white/10 py-8">
                        <div className="flex flex-col gap-2">
                            <span className="text-4xl font-bold text-white tracking-tight">
                                Rp {product.price?.toLocaleString('id-ID')}
                            </span>
                            <div className="flex items-center gap-3">
                                <span className={`relative flex h-3 w-3`}>
                                    {isLowStock && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                                    <span className={`relative inline-flex rounded-full h-3 w-3 ${product.stock > 0 ? (isLowStock ? "bg-red-500" : "bg-green-500") : "bg-red-500"}`}></span>
                                </span>
                                <span className={`text-sm font-bold ${isLowStock ? "text-red-500" : "text-gray-400"}`}>
                                    {product.stock > 0
                                        ? (isLowStock ? `Stok Menipis! Sisa ${product.stock} items` : `Stok Tersedia (${product.stock})`)
                                        : "Stok Habis"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Spesifikasi Panel */}
                    <div className="bg-zinc-900/50 rounded-xl border border-white/5 p-6 mb-6 backdrop-blur-sm">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Spesifikasi Detail</h3>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <span className="text-xs text-gray-500 block mb-1">Brand</span>
                                <span className="text-white font-medium">{product.brand}</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 block mb-1">Kategori</span>
                                <span className="text-white font-medium">{product.category}</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 block mb-1">Tipe / Spec</span>
                                <span className="text-accent-gold font-bold">{product.spec || "-"}</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 block mb-1">Warna</span>
                                <span className="text-white font-medium flex items-center gap-2">
                                    {product.color && getColorHex(product.color) && (
                                        <span
                                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                                            style={{ backgroundColor: getColorHex(product.color)! }}
                                        />
                                    )}
                                    {product.color || "-"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Jumlah</label>
                        <div className="flex items-center gap-4 bg-zinc-900 w-max p-1 rounded-lg border border-white/10">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-3 text-white hover:bg-white/10 rounded-md transition-colors"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-xl font-bold text-white w-8 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="p-3 text-white hover:bg-white/10 rounded-md transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>


                    <div className="pt-4 flex gap-4">
                        <Button
                            size="lg"
                            variant="outline"
                            className="flex-1 h-16 text-lg font-bold border-white/20 hover:bg-white/10 hover:border-accent-gold hover:text-accent-gold transition-all"
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                        >
                            <ShoppingCart className="mr-2 w-6 h-6" /> + Keranjang
                        </Button>
                        <Button
                            size="lg"
                            className="flex-1 h-16 text-lg font-bold bg-accent-gold text-black hover:bg-yellow-500 rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all transform hover:-translate-y-1"
                            onClick={handleBuyNow}
                            disabled={isSubmitting || product.stock <= 0}
                        >
                            Beli Sekarang
                        </Button>
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="max-w-7xl mx-auto border-t border-white/10 pt-16">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-white">Produk Sejenis</h3>
                        <span className="text-sm text-gray-500">Rekomendasi Terbaik</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {relatedProducts.map(p => (
                            <ProductCard key={p.id} {...p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

