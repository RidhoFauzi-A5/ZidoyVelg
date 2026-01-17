import Image from 'next/image';
import Link from 'next/link';
import { getColorHex } from "@/lib/colors";

interface ProductCardProps {
    id: string;
    name: string;
    brand: string;
    price: number;
    imageUrl: string;
    category: string;
    spec?: string; // e.g. Ring 17
    color?: string; // e.g. Gold
}

export default function ProductCard({ id, name, brand, price, imageUrl, category, spec, color }: ProductCardProps) {
    const getImageUrl = (path: string) => {
        if (!path) return "https://placehold.co/400?text=No+Img";
        if (path.startsWith("http")) return path;

        // Remove /api if present in NEXT_PUBLIC_API_URL to get base URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5238";
        return `${baseUrl}${path}`;
    };

    return (
        <Link href={`/product/${id}`} className="group relative block">
            <div className="relative h-[380px] w-full overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/5 shadow-xl group-hover:shadow-2xl group-hover:shadow-accent-gold/10 transition-all duration-500">

                {/* Image Section */}
                <div className="relative h-[240px] w-full overflow-hidden bg-zinc-900/50 flex items-center justify-center p-6">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Brand Badge */}
                    <div className="absolute top-4 left-4 z-20">
                        <span className="text-[10px] font-black tracking-widest text-black bg-accent-gold px-2 py-1 rounded-sm uppercase">
                            {brand}
                        </span>
                    </div>

                    {/* Color Badge */}
                    {color && getColorHex(color) && (
                        <div className="absolute top-4 right-4 z-20">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-white bg-black/60 backdrop-blur-md border border-white/10 pl-1.5 pr-2 py-1 rounded-full uppercase">
                                <span
                                    className="w-2.5 h-2.5 rounded-full border border-white/20"
                                    style={{ backgroundColor: getColorHex(color)! }}
                                />
                                {color}
                            </span>
                        </div>
                    )}

                    <img
                        src={getImageUrl(imageUrl)}
                        alt={name}
                        className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out z-10"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/400?text=No+Img";
                        }}
                    />
                </div>

                {/* Content Section */}
                <div className="p-5 relative z-20 bg-gradient-to-b from-zinc-900/0 to-zinc-900/80">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">{category}</span>
                        {spec && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-accent-gold border border-accent-gold/20 font-bold">{spec}</span>}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-1 group-hover:text-accent-gold transition-colors">
                        {name}
                    </h3>

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Harga</span>
                            <span className="text-xl font-bold text-white">
                                Rp {price.toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent-gold group-hover:text-black transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </div>
                    </div>
                </div>

                {/* Border Glow */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 group-hover:ring-accent-gold/30 transition-all duration-500 pointer-events-none" />
            </div>
        </Link>
    );
}
