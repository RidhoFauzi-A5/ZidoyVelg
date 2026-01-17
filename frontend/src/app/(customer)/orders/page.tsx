"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Package, Clock, CheckCircle, Truck, XCircle, ShoppingBag } from "lucide-react";

interface OrderItem {
    productName: string;
    variantSpec: string;
    color: string;
    price: number;
    quantity: number;
}

interface Order {
    id: string;
    totalAmount: number;
    status: string;
    items: OrderItem[];
    createdAt: string;
}

export default function CustomerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get("/orders/my-orders");
                setOrders(res.data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
            case "paid": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
            case "shipped": return "text-purple-500 bg-purple-500/10 border-purple-500/20";
            case "done": return "text-green-500 bg-green-500/10 border-green-500/20";
            case "cancelled": return "text-red-500 bg-red-500/10 border-red-500/20";
            default: return "text-gray-500 bg-gray-500/10 border-gray-500/20";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending": return <Clock className="w-4 h-4 ml-2" />;
            case "paid": return <CheckCircle className="w-4 h-4 ml-2" />;
            case "shipped": return <Truck className="w-4 h-4 ml-2" />;
            case "done": return <Package className="w-4 h-4 ml-2" />;
            case "cancelled": return <XCircle className="w-4 h-4 ml-2" />;
            default: return <Clock className="w-4 h-4 ml-2" />;
        }
    };

    const handleConfirmReceived = async (id: string) => {
        if (!confirm("Apakah barang sudah diterima dengan baik?")) return;
        try {
            await api.put(`/orders/${id}/status`, { status: "Done" });
            setOrders(orders.map(o => o.id === id ? { ...o, status: "Done" } : o));
        } catch (error) {
            console.error("Failed to update", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-gold"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent-gold rounded-xl">
                        <ShoppingBag className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Riwayat Pesanan</h1>
                        <p className="text-gray-400">Pantau status pesanan velg impianmu disini.</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-white/5">
                        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Belum ada pesanan</h3>
                        <p className="text-gray-400">Ayo mulai belanja dan upgrade motor kamu sekarang!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-zinc-900/80 border border-white/5 rounded-2xl p-6 hover:border-accent-gold/30 transition-all duration-300 shadow-lg">
                                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Order ID: <span className="font-mono text-gray-300">#{order.id.substring(0, 8)}...</span></p>
                                        <p className="text-sm text-gray-500">Tanggal: {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <div className={`flex items-center px-4 py-2 rounded-full border ${getStatusColor(order.status)}`}>
                                        <span className="text-sm font-bold uppercase tracking-wider">{order.status}</span>
                                        {getStatusIcon(order.status)}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-black/20 p-4 rounded-xl">
                                            <div>
                                                <h4 className="font-bold text-white text-lg">{item.productName}</h4>
                                                <p className="text-sm text-gray-400">
                                                    {item.variantSpec} • {item.color} • {item.quantity} pcs
                                                </p>
                                            </div>
                                            <p className="font-medium text-accent-gold">
                                                Rp {item.price.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-center sm:text-left">
                                        <p className="text-gray-400 text-sm">Total Pembayaran</p>
                                        <p className="text-2xl font-black text-white">Rp {order.totalAmount.toLocaleString('id-ID')}</p>
                                    </div>

                                    {order.status === "Shipped" && (
                                        <button
                                            onClick={() => handleConfirmReceived(order.id)}
                                            className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center shadow-lg shadow-green-900/20"
                                        >
                                            <CheckCircle className="w-5 h-5 mr-2" /> Pesanan Diterima
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
