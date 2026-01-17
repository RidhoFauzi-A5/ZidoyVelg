import { Instagram, Facebook, Twitter, Sparkles } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-black border-t border-white/10 py-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-white/5 pb-12">
                    {/* Brand */}
                    <div className="md:col-span-4 space-y-4">
                        <h2 className="text-3xl font-black text-white tracking-tighter">ZIDOY <span className="text-accent-gold">VELG</span></h2>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                            Pusat Velg Racing & Original Terlengkap di Indonesia.
                            <br />
                            Jalan Raya Otomotif No. 88, Bekasi, Tambun.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="md:col-span-2">
                        <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Menu</h3>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><a href="/" className="hover:text-accent-gold transition-colors">Beranda</a></li>
                            <li><a href="/catalog" className="hover:text-accent-gold transition-colors">Katalog</a></li>
                            <li><a href="/about" className="hover:text-accent-gold transition-colors">Tentang Kami</a></li>
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Bantuan</h3>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-accent-gold transition-colors">Cara Belanja</a></li>
                            <li><a href="#" className="hover:text-accent-gold transition-colors">Konfirmasi Pembayaran</a></li>
                            <li><a href="#" className="hover:text-accent-gold transition-colors">Cek Resi</a></li>
                        </ul>
                    </div>

                    {/* Socials */}
                    <div className="md:col-span-4">
                        <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Ikuti Kami</h3>
                        <div className="flex gap-4">
                            {[Instagram, Facebook, Twitter, Sparkles].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-gray-400 hover:bg-accent-gold hover:text-black transition-all duration-300">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
                    <p>&copy; {new Date().getFullYear()} Zidoy Velg Indonesia. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-zinc-400">Privacy Policy</a>
                        <a href="#" className="hover:text-zinc-400">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
