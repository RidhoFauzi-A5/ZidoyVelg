"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import { Eye, CheckCircle, XCircle, FileText, Smartphone, MapPin, Package } from "lucide-react";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const fetchOrders = async () => {
        try {
            const res = await api.get("/orders/all");
            setOrders(res.data);
        } catch (error) {
            console.error("Failed to fetch admin orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await api.put(`/orders/${id}/status`, { status: newStatus });
            setToast({ message: `Order status updated to ${newStatus}`, type: "success" });
            fetchOrders(); // Refresh list
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (error) {
            console.error("Failed to update status", error);
            setToast({ message: "Failed to update status", type: "error" });
        }
    };

    const getImg = (url: string) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5238";
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${cleanPath}`;
    };

    if (loading) return <div className="text-white">Loading orders...</div>;

    return (
        <div className="space-y-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <h1 className="text-3xl font-bold text-white">Order Management</h1>

            <div className="glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-zinc-900 text-gray-200 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-zinc-800/50 transition-colors">
                                        <td className="p-4 font-mono text-white text-xs">{order.id.substring(0, 8)}...</td>
                                        <td className="p-4 font-medium text-white">{order.customerName}</td>
                                        <td className="p-4 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-accent-gold font-bold">Rp {order.totalAmount.toLocaleString('id-ID')}</td>
                                        <td className="p-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <Button variant="secondary" size="sm" className="text-xs" onClick={() => setSelectedOrder(order)}>
                                                <Eye className="w-3 h-3 mr-1" /> View Detail
                                            </Button>

                                            {order.status === "Pending" && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                                        onClick={() => handleStatusUpdate(order.id, "Paid")}
                                                        title="Approve / Mark Paid"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                                        onClick={() => handleStatusUpdate(order.id, "Cancelled")}
                                                        title="Reject / Cancel"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                            {order.status === "Paid" && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                                    onClick={() => handleStatusUpdate(order.id, "Shipped")}
                                                >
                                                    Ship Order
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ORDER DETAIL MODAL */}
            <Modal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                title={`Order Detail #${selectedOrder?.id?.substring(0, 8)}`}
            >
                {selectedOrder && (
                    <div className="space-y-6 text-white">
                        {/* Status Bar */}
                        <div className="flex justify-between items-center bg-zinc-800/50 p-4 rounded-lg">
                            <span className="text-gray-400">Current Status</span>
                            <StatusBadge status={selectedOrder.status} />
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h3 className="font-bold flex items-center text-accent-gold"><FileText className="w-4 h-4 mr-2" /> Customer Info</h3>
                                <div className="space-y-1 text-sm">
                                    <p className="flex justify-between"><span className="text-gray-500">Name:</span> <span>{selectedOrder.customerName}</span></p>
                                    <p className="flex justify-between"><span className="text-gray-500">Phone:</span> <span>{selectedOrder.customerPhone}</span></p>
                                    <p className="flex justify-between"><span className="text-gray-500">Method:</span> <span>{selectedOrder.paymentMethod}</span></p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-bold flex items-center text-accent-gold"><MapPin className="w-4 h-4 mr-2" /> Shipping Address</h3>
                                <p className="text-sm text-gray-300 bg-zinc-800 p-3 rounded">{selectedOrder.shippingAddress}</p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-3">
                            <h3 className="font-bold flex items-center text-accent-gold"><Package className="w-4 h-4 mr-2" /> Order Items</h3>
                            <div className="space-y-2">
                                {selectedOrder.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center bg-zinc-800 p-3 rounded text-sm">
                                        <div>
                                            <p className="font-bold">{item.productName}</p>
                                            <p className="text-xs text-gray-400">{item.variantSpec} • {item.color}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-400">{item.quantity} x {item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between pt-2 border-t border-white/10 font-bold text-lg">
                                <span>Total</span>
                                <span>Rp {selectedOrder.totalAmount.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        {/* Payment Proof */}
                        <div className="space-y-3">
                            <h3 className="font-bold flex items-center text-accent-gold"><Eye className="w-4 h-4 mr-2" /> Payment Proof</h3>
                            <div className="border border-white/10 rounded-lg overflow-hidden bg-black/50 p-2 text-center">
                                {selectedOrder.paymentProofUrl ? (
                                    <img
                                        src={getImg(selectedOrder.paymentProofUrl)!}
                                        alt="Proof"
                                        className="max-h-[300px] mx-auto object-contain"
                                    />
                                ) : (
                                    <p className="text-gray-500 py-8">No payment proof uploaded.</p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-white/10">
                            {selectedOrder.status === "Pending" ? (
                                <>
                                    <Button
                                        onClick={() => handleStatusUpdate(selectedOrder.id, "Paid")}
                                        className="bg-green-600 hover:bg-green-500 w-full"
                                    >
                                        Approve Payment
                                    </Button>
                                    <Button
                                        onClick={() => handleStatusUpdate(selectedOrder.id, "Cancelled")}
                                        className="bg-red-600 hover:bg-red-500 w-full"
                                    >
                                        Reject Order
                                    </Button>
                                </>
                            ) : selectedOrder.status === "Paid" ? (
                                <Button
                                    onClick={() => handleStatusUpdate(selectedOrder.id, "Shipped")}
                                    className="bg-blue-600 hover:bg-blue-500 w-full"
                                >
                                    Mark as Shipped
                                </Button>
                            ) : selectedOrder.status === "Shipped" ? (
                                <div className="grid grid-cols-1 gap-3 w-full">
                                    <Button
                                        onClick={() => handleStatusUpdate(selectedOrder.id, "Done")}
                                        className="bg-green-600 hover:bg-green-500 w-full"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" /> Mark as Completed
                                    </Button>
                                    <p className="text-xs text-center text-gray-500">
                                        Klik ini jika customer sudah menerima barang namun lupa konfirmasi.
                                    </p>
                                </div>
                            ) : null}
                        </div>

                    </div>
                )}
            </Modal>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        Pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        Paid: "bg-green-500/10 text-green-500 border-green-500/20",
        Shipped: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        Done: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        Cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${styles[status] || styles['Pending']} uppercase tracking-wide`}>
            {status}
        </span>
    );
}
