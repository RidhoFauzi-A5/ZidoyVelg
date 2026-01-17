"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingCart, ChevronRight } from "lucide-react";

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-950 pt-24 pb-12 flex flex-col items-center justify-center text-center px-4">
                <div className="bg-zinc-900/50 p-8 rounded-full mb-6">
                    <ShoppingCart className="w-16 h-16 text-gray-600" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Keranjang Belanja Kosong</h1>
                <p className="text-gray-400 mb-8 max-w-md">
                    Sepertinya anda belum menambahkan velg impian anda. Yuk cari velg keren sekarang!
                </p>
                <Link href="/catalog">
                    <Button className="bg-accent-gold text-black font-bold px-8 py-3 rounded-xl hover:bg-yellow-500 transition-colors">
                        Mulai Belanja
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4 flex items-center gap-3">
                    <ShoppingCart className="text-accent-gold" /> Keranjang Belanja
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item, index) => {
                            if (!item) return null;
                            return (
                                <div key={item.id || index} className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl flex gap-4 items-center group hover:border-white/10 transition-colors">
                                    {/* Image */}
                                    <div className="w-24 h-24 bg-zinc-800 rounded-lg overflow-hidden shrink-0 relative">
                                        <img
                                            src={item.imageUrl ? (item.imageUrl.startsWith("http") ? item.imageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5238"}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}`) : "/placeholder.png"}
                                            alt={item.name || "Product"}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100?text=No+Img"; }}
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-bold text-lg truncate">{item.name || "Unknown Product"}</h3>
                                        <p className="text-gray-400 text-sm mb-2">{item.variantSpec || "Standard"}</p>
                                        <p className="text-accent-gold font-bold">Rp {(item.price || 0).toLocaleString('id-ID')}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-end gap-3">
                                        <div className="flex items-center gap-3 bg-zinc-950 rounded-lg border border-white/10 p-1">
                                            <button
                                                onClick={() => updateQuantity(item.productId, (item.quantity || 1) - 1)}
                                                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="text-white font-bold w-6 text-center text-sm">{item.quantity || 1}</span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, (item.quantity || 1) + 1)}
                                                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.productId)}
                                            className="text-red-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" /> Hapus
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="flex justify-between pt-4">
                            <Button onClick={clearCart} variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-transparent p-0">
                                Kosongkan Keranjang
                            </Button>
                            <Link href="/catalog" className="text-gray-400 hover:text-white text-sm hover:underline">
                                Tambah Barang Lain
                            </Link>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl sticky top-24">
                            <h3 className="text-xl font-bold text-white mb-6">Ringkasan</h3>

                            <div className="space-y-3 border-b border-white/10 pb-6 mb-6">
                                <div className="flex justify-between text-gray-400">
                                    <span>Total Barang</span>
                                    <span>{items.reduce((acc, item) => acc + item.quantity, 0)} Pcs</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span>Rp {(totalAmount || 0).toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-8">
                                <span className="text-lg font-bold text-white">Total</span>
                                <span className="text-2xl font-bold text-accent-gold">Rp {(totalAmount || 0).toLocaleString('id-ID')}</span>
                            </div>

                            <Link href="/checkout">
                                <Button className="w-full bg-accent-gold text-black font-bold py-4 rounded-xl hover:bg-yellow-500 hover:shadow-[0_0_20px_rgba(255,215,0,0.2)] transition-all flex items-center justify-center gap-2">
                                    Checkout Sekarang <ChevronRight className="w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
