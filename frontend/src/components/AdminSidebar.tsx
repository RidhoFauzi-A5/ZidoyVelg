"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, FileText, LogOut } from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Reports", href: "/admin/reports", icon: FileText },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex flex-col w-64 bg-zinc-900 border-r border-white/10 min-h-screen fixed left-0 top-0 pt-20">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="px-5 mb-6">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Admin Panel</h2>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? "bg-zinc-800 text-white"
                                    : "text-gray-300 hover:bg-zinc-800 hover:text-white"
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? "text-accent-gold" : "text-gray-400 group-hover:text-gray-300"
                                        }`}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/";
                    }}
                    className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
