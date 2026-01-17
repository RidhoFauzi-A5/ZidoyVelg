"use client";

import { useEffect, useState } from 'react';
import api from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Package, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        products: 0,
        lowStock: 0,
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, productsRes] = await Promise.all([
                    api.get("/orders/all"),
                    api.get("/products")
                ]);

                const orders = ordersRes.data;
                const products = productsRes.data;

                // 1. Calculate Revenue (exclude Cancelled)
                const validOrders = orders.filter((o: any) => o.status !== "Cancelled");
                const totalRevenue = validOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);

                // 2. Count Low Stock
                const lowStockCount = products.filter((p: any) => (p.stock || 0) <= 2).length;

                setStats({
                    revenue: totalRevenue,
                    orders: orders.length,
                    products: products.length,
                    lowStock: lowStockCount
                });

                // 3. Prepare Chart Data (Group by Day)
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const weeklyMap = new Array(7).fill(0); // Index 0 is Sunday

                validOrders.forEach((o: any) => {
                    const date = new Date(o.createdAt);
                    const dayIndex = date.getDay();
                    weeklyMap[dayIndex] += o.totalAmount;
                });

                const chart = days.map((day, index) => ({
                    name: day,
                    revenue: weeklyMap[index]
                }));

                // Rotate to start from Monday if desired, or keep Sun-Sat
                // Let's keep Standard Sun-Sat or shift to make today last. 
                // Simple static Sun-Sat is fine.
                const rotatedChart = [...chart.slice(1), chart[0]]; // Mon-Sun
                setChartData(rotatedChart);

            } catch (error) {
                console.error("Dashboard fetch error", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-10 flex text-white items-center gap-2"><Loader2 className="animate-spin" /> Loading Dashboard...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Executive Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`Rp ${stats.revenue.toLocaleString('id-ID')}`}
                    icon={DollarSign}
                    color="text-green-400"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.orders.toString()}
                    icon={ShoppingBag}
                    color="text-blue-400"
                />
                <StatCard
                    title="Total Products"
                    value={stats.products.toString()}
                    icon={Package}
                    color="text-purple-400"
                />
                <StatCard
                    title="Low Stock Alerts"
                    value={stats.lowStock.toString()}
                    icon={AlertTriangle}
                    color="text-red-400"
                />
            </div>

            {/* Chart */}
            <div className="glass p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-6">Weekly Revenue</h2>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" tickFormatter={(value) => `Rp${value / 1000}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Revenue']}
                            />
                            <Bar dataKey="revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }: any) {
    return (
        <div className="glass p-6 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors">
            <div>
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-lg bg-white/5 ${color} border border-white/5`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
}
