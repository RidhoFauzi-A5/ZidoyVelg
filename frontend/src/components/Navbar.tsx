"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<{ role: string, name: string } | null>(null);
    const { totalItems } = useCart();

    const pathname = usePathname();

    const checkAuth = () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);

                // Common claims for username: unique_name, name, sub, or custom property
                const name = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || payload["unique_name"] || payload.username || payload.sub || "User";
                const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.role || "customer";

                setUser({ role, name });
            } catch (e) {
                console.error("Invalid token", e);
                localStorage.removeItem("token");
                setUser(null);
            }
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        // Check auth on mount and whenever path changes
        checkAuth();

        window.addEventListener("storage", checkAuth);
        window.addEventListener("auth-update", checkAuth);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("storage", checkAuth);
            window.removeEventListener("auth-update", checkAuth);
        };
    }, [pathname]); // Added pathname dependency to re-check auth on navigation

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        window.dispatchEvent(new Event("auth-update")); // Notify other components
        router.push("/");
    };

    // Hide navbar on admin pages
    if (pathname.startsWith("/admin")) return null;

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-zinc-950/80 backdrop-blur-lg border-b border-white/10" : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="relative w-10 h-10 overflow-hidden rounded-full border border-white/10 group-hover:border-accent-gold transition-colors">
                            <img src="/logoziodyvelg.png" alt="Zidoy Velg Logo" className="object-cover w-full h-full" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-accent-gold transition-colors">
                            ZIDOY VELG
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <NavLink href="/">Home</NavLink>
                            <NavLink href="/catalog">Katalog</NavLink>
                            {/* Show Orders for Customer */}
                            {user && user.role !== 'admin' && <NavLink href="/orders">Pesanan Saya</NavLink>}
                            {user?.role === 'admin' && (
                                <NavLink href="/admin/dashboard">Dashboard Admin</NavLink>
                            )}
                        </div>
                    </div>

                    {/* Icons */}
                    <div className="hidden md:flex items-center space-x-6">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-400 capitalize">Hi, <span className="text-white font-bold">{user.name}</span></span>
                                <button onClick={handleLogout} className="text-red-500 hover:text-red-400 transition-colors text-sm font-medium">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                <User className="w-5 h-5" />
                                <span className="text-sm">Login</span>
                            </Link>
                        )}
                        <Link href="/cart" className="text-gray-300 hover:text-white transition-colors relative group">
                            <ShoppingCart className="w-5 h-5 group-hover:text-accent-gold transition-colors" />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-accent-gold text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                    {totalItems > 99 ? '99+' : totalItems}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-300 hover:text-white"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-zinc-900 border-b border-white/10">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <MobileNavLink href="/">Home</MobileNavLink>
                        <MobileNavLink href="/catalog">Katalog</MobileNavLink>
                        <MobileNavLink href="/about">About</MobileNavLink>
                        {user?.role === 'admin' && (
                            <MobileNavLink href="/admin/dashboard">Dashboard</MobileNavLink>
                        )}
                        <div className="border-t border-gray-700 pt-4 mt-4">
                            {user ? (
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-zinc-800"
                                >
                                    Logout
                                </button>
                            ) : (
                                <MobileNavLink href="/login">Login</MobileNavLink>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
        href={href}
        className="text-gray-300 hover:text-white hover:text-shadow-glow transition-all duration-300 text-sm font-medium tracking-wide uppercase"
    >
        {children}
    </Link>
);

const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
        href={href}
        className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-zinc-800"
    >
        {children}
    </Link>
);
