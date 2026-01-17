"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
    message: string;
    type: "success" | "error";
    onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for animation
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-8 right-8 z-[150] transition-all duration-300 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${type === "success"
                    ? "bg-zinc-900 border-green-500/20 text-green-400"
                    : "bg-zinc-900 border-red-500/20 text-red-400"
                }`}>
                {type === "success" ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                <div>
                    <h4 className="font-bold text-sm tracking-wide uppercase">{type === "success" ? "Sukses" : "Error"}</h4>
                    <p className="text-sm text-gray-400">{message}</p>
                </div>
                <button onClick={() => setIsVisible(false)} className="ml-4 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
