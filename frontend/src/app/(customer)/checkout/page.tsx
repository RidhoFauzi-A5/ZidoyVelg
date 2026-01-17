"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { Loader2, Upload, CreditCard, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { items: cartItems, clearCart, totalAmount: cartTotal } = useCart();

    // Mode: Direct Buy (URL) vs Cart
    const paramProductId = searchParams.get("productId");
    const paramQuantity = parseInt(searchParams.get("quantity") || "1");
    const isDirectBuy = !!paramProductId;

    const [directItem, setDirectItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // FIX: Flag to prevent redirect to cart if order is successful
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        customerName: "",
        customerPhone: "",
        shippingAddress: "",
        paymentMethod: "BCA",
    });
    const [paymentProof, setPaymentProof] = useState<File | null>(null);

    // Fetch product if direct buy
    useEffect(() => {
        const init = async () => {
            // If we just succeeded, don't run this logic to avoid redirecting back to cart/home
            if (isSuccess) return;

            if (isDirectBuy) {
                try {
                    const res = await api.get(`/products/${paramProductId}`);
                    const p = res.data;
                    setDirectItem({
                        productId: p.id,
                        name: p.name,
                        price: p.price,
                        imageUrl: p.imageUrl,
                        variantSpec: p.category || "Standard",
                        quantity: paramQuantity,
                        color: "Standard"
                    });
                } catch (error) {
                    console.error("Product fetch failed", error);
                    setToast({ message: "Produk tidak ditemukan", type: "error" });
                    setTimeout(() => router.push("/"), 2000);
                }
            } else {
                // Cart mode check
                if (cartItems.length === 0) {
                    // Double check success flag here just in case
                    if (isSuccess) return;

                    // If cart is empty and not direct buy, go to cart (or home)
                    // But wait a bit to ensure hydration
                    const t = setTimeout(() => router.push("/cart"), 100);
                    return () => clearTimeout(t);
                }
            }
            setLoading(false);
        };
        init();
    }, [isDirectBuy, paramProductId, paramQuantity, cartItems, router, isSuccess]);

    const itemsToCheckout = isDirectBuy ? (directItem ? [directItem] : []) : cartItems;
    const total = isDirectBuy ? (directItem ? directItem.price * directItem.quantity : 0) : cartTotal;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentProof) {
            setToast({ message: "Mohon upload bukti transfer terlebih dahulu.", type: "error" });
            return;
        }

        if (itemsToCheckout.length === 0) {
            setToast({ message: "Tidak ada barang yang akan dibeli.", type: "error" });
            return;
        }

        setSubmitting(true);
        try {
            const data = new FormData();

            // Customer Info
            data.append("CustomerName", formData.customerName);
            data.append("CustomerPhone", formData.customerPhone);
            data.append("ShippingAddress", formData.shippingAddress);
            data.append("PaymentMethod", formData.paymentMethod);
            data.append("PaymentProofImage", paymentProof);

            // Append Items
            itemsToCheckout.forEach((item, index) => {
                data.append(`Items[${index}].ProductId`, item.productId);
                data.append(`Items[${index}].ProductName`, item.name);
                data.append(`Items[${index}].VariantSpec`, item.variantSpec || "Standard");
                data.append(`Items[${index}].Color`, item.color || "Standard");
                data.append(`Items[${index}].Price`, item.price.toString());
                data.append(`Items[${index}].Quantity`, item.quantity.toString());
            });

            data.append("TotalAmount", total.toString());

            const res = await api.post("/orders", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // Capture ID
            const newOrderId = res.data.id;

            // Mark validation flag
            setIsSuccess(true);

            if (!isDirectBuy) {
                clearCart();
            }

            setToast({ message: "Pesanan berhasil dibuat! Menunggu konfirmasi admin.", type: "success" });
            // Redirect with ID
            setTimeout(() => router.push(`/checkout/success?orderId=${newOrderId}`), 1500);

        } catch (error: any) {
            console.error("Order failed", error);
            const msg = error.response?.data?.message || "Gagal membuat pesanan.";
            // Debug errors if any
            const detail = error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : error.message;
            setToast({ message: `${msg}: ${detail}`.substring(0, 150), type: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    const getImg = (url: string) => {
        if (!url) return "/placeholder.png";
        if (url.startsWith("http")) return url;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5238";
        // Handle double slashes if any
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${cleanPath}`;
    };

    return (
        <div className="min-h-screen bg-zinc-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">Checkout</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: FORM */}
                    <div className="md:col-span-2 space-y-8">

                        {/* 1. Customer Details */}
                        <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-accent-gold text-black w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                                Data Pengiriman
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Nama Penerima</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-zinc-800 border-none rounded p-3 text-white focus:ring-1 focus:ring-accent-gold"
                                        value={formData.customerName}
                                        onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Nomor WhatsApp</label>
                                    <input
                                        required
                                        type="tel"
                                        className="w-full bg-zinc-800 border-none rounded p-3 text-white focus:ring-1 focus:ring-accent-gold"
                                        value={formData.customerPhone}
                                        onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Alamat Lengkap</label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="w-full bg-zinc-800 border-none rounded p-3 text-white focus:ring-1 focus:ring-accent-gold"
                                        value={formData.shippingAddress}
                                        onChange={e => setFormData({ ...formData, shippingAddress: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* 2. Payment Method */}
                        <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-accent-gold text-black w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                                Metode Pembayaran
                            </h2>
                            <div className="space-y-3">
                                <div className="p-4 border border-accent-gold/50 bg-accent-gold/5 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="text-accent-gold w-5 h-5" />
                                        <span className="font-bold text-white">Transfer Bank (Manual Check)</span>
                                    </div>
                                    <div className="mt-3 pl-8 text-sm text-gray-300 space-y-1">
                                        <p>Silakan transfer ke rekening berikut:</p>
                                        <div className="bg-black/30 p-3 rounded border border-white/5 font-mono">
                                            <p className="text-accent-gold font-bold">BCA: 123-456-7890</p>
                                            <p className="text-accent-gold font-bold">MANDIRI: 098-765-4321</p>
                                            <p className="text-xs text-gray-500 mt-1">a/n Zidoy Velg Official</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Upload Proof */}
                        <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-accent-gold text-black w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                                Upload Bukti Transfer
                            </h2>
                            <div className="border-2 border-dashed border-zinc-700 hover:border-accent-gold/50 transition-colors rounded-xl p-8 text-center cursor-pointer group relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setPaymentProof(e.target.files ? e.target.files[0] : null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {paymentProof ? (
                                    <div className="text-green-400 flex flex-col items-center">
                                        <Upload className="w-8 h-8 mb-2" />
                                        <p className="font-bold">{paymentProof.name}</p>
                                        <p className="text-xs text-gray-500">Klik untuk ganti file</p>
                                    </div>
                                ) : (
                                    <div className="text-gray-400 group-hover:text-accent-gold transition-colors flex flex-col items-center">
                                        <Upload className="w-8 h-8 mb-2" />
                                        <p className="font-medium">Klik disini untuk upload screenshot bukti transfer</p>
                                        <p className="text-xs text-gray-600 mt-1">Format: JPG, PNG, JPEG</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: SUMMARY */}
                    <div className="md:col-span-1">
                        <div className="glass p-6 rounded-xl sticky top-24">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-accent-gold" /> Ringkasan Pesanan
                            </h3>

                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-1">
                                {itemsToCheckout.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                                        <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden relative shrink-0">
                                            <img
                                                src={getImg(item.imageUrl)}
                                                className="w-full h-full object-cover"
                                                alt={item.name}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-white text-sm line-clamp-2">{item.name}</h4>
                                            <p className="text-xs text-gray-400">{item.quantity} x Rp {(item.price || 0).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 mb-6 pt-4 border-t border-white/10">
                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>Subtotal ({itemsToCheckout.reduce((a: any, b: any) => a + b.quantity, 0)} item)</span>
                                    <span>Rp {(total || 0).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>Ongkos Kirim</span>
                                    <span>Gratis</span>
                                </div>
                                <div className="flex justify-between text-white font-bold text-lg pt-4 border-t border-white/10">
                                    <span>Total</span>
                                    <span>Rp {(total || 0).toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full bg-accent-gold text-black font-bold py-4 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Buat Pesanan"}
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-24 text-center text-white">Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
