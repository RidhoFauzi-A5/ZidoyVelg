"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminReportsPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get("/orders/all"); // Correct endpoint
            setOrders(res.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const generatePDF = async () => {
        const doc = new jsPDF();

        // 1. Header (Black Background with Gold Text)
        doc.setFillColor(15, 15, 15); // Zinc-950 equivalent
        doc.rect(0, 0, 210, 40, 'F');

        let textX = 20;
        try {
            const response = await fetch('/logoziodyvelg.png');
            const blob = await response.blob();
            const reader = new FileReader();
            const base64data = await new Promise<string>((resolve) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
            doc.addImage(base64data, "PNG", 10, 8, 24, 24);
            textX = 40;
        } catch (err) {
            console.error("Logo Error", err);
        }

        doc.setTextColor(212, 175, 55); // Accent Gold
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("ZIDOY VELG", textX, 20);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Premium Wheel Store Management", textX, 28);

        // Date Info (Top Right)
        const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        doc.setFontSize(10);
        doc.text(`Generated: ${dateStr}`, 140, 20);
        doc.text("Report: Sales Recap", 140, 25);

        // 2. Summary Section
        const validOrders = orders.filter((o: any) => o.status !== "Cancelled");
        const totalRevenue = validOrders.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0);
        const totalOrders = validOrders.length;
        const pendingOrders = orders.filter((o: any) => o.status === "Pending").length;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Ringkasan Keuangan", 14, 55);

        // Summary Boxes Logic (Simplified manual drawing for now)
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Total Pendapatan Bersih: Rp ${totalRevenue.toLocaleString('id-ID')}`, 14, 65);
        doc.text(`Total Transaksi Berhasil: ${totalOrders} Pesanan`, 14, 72);
        doc.text(`Menunggu Konfirmasi: ${pendingOrders} Pesanan`, 14, 79);

        // 3. Table
        const tableColumn = ["ID", "Tanggal", "Customer", "Detail Produk", "Status", "Total"];
        const tableRows: any[] = [];

        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).forEach(order => {
            // Format items list with bullets
            const itemsStr = order.items?.map((i: any) => `• ${i.productName} (${i.variantSpec}, ${i.color}) x${i.quantity}`).join('\n') || "-";

            const orderData = [
                order.id.substring(0, 8).toUpperCase(),
                new Date(order.createdAt).toLocaleDateString('id-ID'),
                order.customerName || "Guest",
                itemsStr,
                order.status,
                `Rp ${order.totalAmount.toLocaleString('id-ID')}`,
            ];
            tableRows.push(orderData);
        });

        // @ts-ignore
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 90,
            theme: 'grid',
            headStyles: {
                fillColor: [212, 175, 55], // Gold
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [252, 252, 252]
            },
            columnStyles: {
                0: { cellWidth: 22 }, // ID
                1: { cellWidth: 25 }, // Date
                2: { cellWidth: 25 }, // Customer
                3: { cellWidth: 'auto' }, // Product (Flexible)
                4: { cellWidth: 22, halign: 'center' }, // Status
                5: { cellWidth: 35, halign: 'right' }  // Total
            },
            styles: {
                fontSize: 9,
                cellPadding: 4,
                valign: 'top', // Top align better for multiline items
                lineColor: [220, 220, 220],
                lineWidth: 0.1
            },
            // Colorize status column and format total
            didParseCell: function (data: any) {
                if (data.section === 'body' && data.column.index === 4) {
                    const status = data.cell.raw;
                    if (status === 'Done') data.cell.styles.textColor = [34, 197, 94];
                    if (status === 'Paid') data.cell.styles.textColor = [59, 130, 246];
                    if (status === 'Cancelled') data.cell.styles.textColor = [239, 68, 68];
                    if (status === 'Pending') data.cell.styles.textColor = [234, 179, 8];
                }
            }
        });

        // 4. Footer
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Laporan ini digenerate otomatis oleh sistem Zidoy Velg.", 14, finalY);

        doc.save(`Laporan_Penjualan_ZidoyVelg_${new Date().getTime()}.pdf`);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Laporan Penjualan</h1>
                <Button onClick={generatePDF} disabled={loading || orders.length === 0} className="bg-red-600 hover:bg-red-700 text-white">
                    Download PDF
                </Button>
            </div>

            <div className="glass rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Ringkasan Transaksi</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-zinc-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-400">Loading data...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Belum ada data penjualan.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#{order.id.substring(0, 8)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                                            Rp {order.totalAmount?.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
