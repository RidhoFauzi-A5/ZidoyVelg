"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-green-500/10 p-6 rounded-full mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <CheckCircle className="w-20 h-20 text-green-500" />
            </div>

            <h1 className="text-4xl font-black text-white mb-2">Pesanan Berhasil!</h1>

            {orderId && (
                <div className="bg-zinc-900 border border-white/10 px-6 py-3 rounded-xl mb-6 flex flex-col items-center gap-1 shadow-inner">
                    <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">Order ID</span>
                    <span className="text-accent-gold font-mono text-xl font-bold tracking-wider">{orderId}</span>
                </div>
            )}

            <p className="text-gray-400 max-w-md mb-8 text-lg">
                Terima kasih sudah berbelanja di Zidoy Velg. Pesananmu sedang kami verifikasi. Admin akan segera menghubungi via WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <Link href="/orders" className="w-full">
                    <Button variant="outline" className="w-full h-14 text-lg border-white/10 hover:bg-white/5">
                        <ShoppingBag className="mr-2 w-5 h-5" /> Lihat Pesanan Saya
                    </Button>
                </Link>
                <Link href="/catalog" className="w-full">
                    <Button className="w-full h-14 text-lg bg-accent-gold text-black font-bold hover:bg-yellow-500">
                        Belanja Lagi <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
