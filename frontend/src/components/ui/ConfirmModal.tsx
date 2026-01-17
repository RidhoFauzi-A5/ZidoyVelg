"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isLoading }: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-red-500/20 rounded-xl w-full max-w-md p-6 shadow-2xl transform scale-100 transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 text-red-500">
                        <div className="p-2 bg-red-500/10 rounded-full">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                    </div>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-gray-400 mb-8 pl-1">{message}</p>

                <div className="flex gap-3 justify-end">
                    <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-6"
                    >
                        {isLoading ? "Menghapus..." : "Ya, Hapus"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
