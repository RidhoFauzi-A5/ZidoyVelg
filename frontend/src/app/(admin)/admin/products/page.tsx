"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, X, Loader2, FileText } from "lucide-react";
import api from "@/lib/api";
import { getColorHex } from "@/lib/colors";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Toast from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface Product {
    id: string;
    name: string;
    brand: string;
    category: string;
    stock: number;
    price: number;
    imageUrl: string;
    description: string;
    color?: string;
    spec?: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal & Feedback States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, productId: string | null }>({ isOpen: false, productId: null });

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        category: "",
        stock: 0,
        price: 0,
        imageUrl: "",
        description: "",
        color: "",
        spec: ""
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get("/products");
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleOpenModal = (product?: Product) => {
        setImageFile(null);
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                brand: product.brand,
                category: product.category,
                stock: product.stock,
                price: product.price,
                imageUrl: product.imageUrl || "",
                description: product.description || "",
                color: product.color || "",
                spec: product.spec || ""
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: "",
                brand: "",
                category: "",
                stock: 0,
                price: 0,
                imageUrl: "",
                description: "",
                color: "",
                spec: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = new FormData();
            data.append("Name", formData.name);
            data.append("Brand", formData.brand);
            data.append("Category", formData.category);
            data.append("Stock", formData.stock.toString());
            data.append("Price", formData.price.toString());
            data.append("Description", formData.description);
            data.append("Color", formData.color);
            data.append("Spec", formData.spec);

            if (imageFile) {
                data.append("Image", imageFile);
            } else if (formData.imageUrl) {
                data.append("ImageUrl", formData.imageUrl);
            }

            const token = localStorage.getItem("token");
            const baseUrl = "http://localhost:5238/api";

            let url = `${baseUrl}/products`;
            let method = "POST";

            if (editingProduct) {
                url = `${baseUrl}/products/${editingProduct.id}`;
                method = "PUT";
            }

            const response = await fetch(url, {
                method: method,
                headers: { "Authorization": `Bearer ${token}` },
                body: data
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error: ${response.status}`);
            }

            await fetchProducts();
            handleCloseModal();
            setToast({ message: editingProduct ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan!", type: "success" });
        } catch (error: any) {
            console.error("Failed to save product", error);
            setToast({ message: error.message || "Gagal menyimpan produk.", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (id: string) => {
        setDeleteModal({ isOpen: true, productId: id });
    };

    const handleDelete = async () => {
        if (!deleteModal.productId) return;
        setIsSubmitting(true);
        try {
            await api.delete(`/products/${deleteModal.productId}`);
            setToast({ message: "Produk berhasil dihapus.", type: "success" });
            fetchProducts();
        } catch (error) {
            console.error("Failed to delete product", error);
            setToast({ message: "Gagal menghapus produk.", type: "error" });
        } finally {
            setIsSubmitting(false);
            setDeleteModal({ isOpen: false, productId: null });
        }
    };

    const getImageUrl = (path: string) => {
        if (!path) return "https://placehold.co/100?text=No+Img";
        if (path.startsWith("http")) return path;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5238";
        return `${baseUrl}${path}`;
    };

    const generateStockPDF = async () => {
        const doc = new jsPDF();

        // Header Background
        doc.setFillColor(15, 15, 15);
        doc.rect(0, 0, 210, 40, 'F');

        // Initial Text Positions (fallback if logo fails)
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
            textX = 40; // Shift text if logo loaded
        } catch (err) {
            console.error("Failed to load logo for PDF", err);
        }

        doc.setTextColor(212, 175, 55);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text("ZIDOY VELG", textX, 20);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Inventory & Stock Report", textX, 28);
        doc.text(`Generated: ${new Date().toLocaleDateString('id-ID')}`, 140, 20);

        const tableRows: any[] = [];
        let totalItems = 0;
        let totalAssetValue = 0;

        products.forEach((p: any, index: number) => {
            if (p.variants && p.variants.length > 0) {
                p.variants.forEach((v: any) => {
                    tableRows.push([
                        `SKU-${index + 1}`,
                        p.name,
                        v.spec || p.spec || "-",
                        v.color || p.color || "-",
                        `Rp ${v.price.toLocaleString('id-ID')}`,
                        `${v.stock} pcs`
                    ]);
                    totalItems += v.stock;
                    totalAssetValue += v.stock * v.price;
                });
            } else {
                tableRows.push([
                    `SKU-${index + 1}`,
                    p.name,
                    p.spec || "-",
                    p.color || "-",
                    `Rp ${p.price.toLocaleString('id-ID')}`,
                    `${p.stock} pcs`
                ]);
                totalItems += p.stock;
                totalAssetValue += p.stock * p.price;
            }
        });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Total SKU: ${tableRows.length} Variants`, 14, 50);
        doc.text(`Total Items in Stock: ${totalItems} pcs`, 14, 56);
        doc.text(`Total Asset Value: Rp ${totalAssetValue.toLocaleString('id-ID')}`, 14, 62);

        // @ts-ignore
        autoTable(doc, {
            head: [["ID", "Product Name", "Spec", "Color", "Price", "Stock"]],
            body: tableRows,
            startY: 70,
            theme: 'grid',
            headStyles: {
                fillColor: [212, 175, 55],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                halign: 'center'
            },
            columnStyles: {
                5: { halign: 'center' },
                4: { halign: 'right' }
            },
            styles: { fontSize: 9, cellPadding: 3 }
        });

        doc.save("Laporan_Stok_ZidoyVelg.pdf");
    };

    return (
        <div className="space-y-8 relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Hapus Produk"
                message="Apakah anda yakin ingin menghapus produk ini? TIndakan ini tidak dapat dibatalkan."
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ isOpen: false, productId: null })}
                isLoading={isSubmitting}
            />

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Manajemen Produk</h1>
                <div className="flex gap-3">
                    <Button onClick={generateStockPDF} className="bg-red-600 hover:bg-red-500 text-white font-bold flex items-center">
                        <FileText className="w-4 h-4 mr-2" /> Download Laporan Stok
                    </Button>
                    <Button onClick={() => handleOpenModal()} className="bg-accent-gold text-black hover:bg-yellow-500 font-bold">
                        <Plus className="w-4 h-4 mr-2" /> Tambah Produk
                    </Button>
                </div>
            </div>

            <div className="glass rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-zinc-900/80 text-gray-200 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Nama Produk</th>
                                <th className="p-4">Brand</th>
                                <th className="p-4">Kategori</th>
                                <th className="p-4">Spec</th>
                                <th className="p-4">Warna</th>
                                <th className="p-4">Stok</th>
                                <th className="p-4">Harga</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {loading ? (
                                <tr><td colSpan={8} className="p-8 text-center">Loading Data...</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan={8} className="p-8 text-center text-gray-500">Belum ada produk. Silakan tambah produk baru.</td></tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-zinc-800/50 transition-colors">
                                        <td className="p-4 font-medium text-white flex items-center gap-3">
                                            {product.imageUrl && (
                                                <div className="w-10 h-10 relative rounded overflow-hidden bg-zinc-800 shrink-0">
                                                    <img
                                                        src={getImageUrl(product.imageUrl)}
                                                        alt={product.name}
                                                        className="object-cover w-full h-full"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = "https://placehold.co/100?text=Error";
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {product.name}
                                        </td>

                                        <td className="p-4">{product.brand}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-zinc-800 text-white border border-zinc-700">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400">{product.spec || "-"}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {product.color && getColorHex(product.color) && (
                                                    <span
                                                        className="w-3 h-3 rounded-full border border-white/20"
                                                        style={{ backgroundColor: getColorHex(product.color)! }}
                                                    />
                                                )}
                                                <span className="text-white">{product.color || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-white">{product.stock}</td>
                                        <td className="p-4 text-accent-gold font-bold">Rp {product.price.toLocaleString('id-ID')}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <Button
                                                onClick={() => handleOpenModal(product)}
                                                variant="ghost"
                                                size="sm"
                                                className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => confirmDelete(product.id)}
                                                variant="ghost"
                                                size="sm"
                                                className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Nama Produk</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-zinc-800 border-none rounded p-2 text-white focus:ring-1 focus:ring-accent-gold"
                                    placeholder="Contoh: RCB SP522 Ring 17"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Brand</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        className="w-full bg-zinc-800 border-none rounded p-2 text-white focus:ring-1 focus:ring-accent-gold"
                                        placeholder="Contoh: RCB"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Kategori</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-zinc-800 border-none rounded p-2 text-white focus:ring-1 focus:ring-accent-gold"
                                        placeholder="Contoh: Racing"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Spesifikasi (Spec)</label>
                                    <input
                                        type="text"
                                        value={formData.spec}
                                        onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                                        className="w-full bg-zinc-800 border-none rounded p-2 text-white focus:ring-1 focus:ring-accent-gold"
                                        placeholder="Contoh: Ring 17 4x100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Warna</label>
                                    <select
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-full bg-zinc-800 border-none rounded p-2 text-white focus:ring-1 focus:ring-accent-gold"
                                    >
                                        <option value="">-- Pilih Warna --</option>
                                        <optgroup label="Best Seller">
                                            <option value="Gold">Gold</option>
                                            <option value="Silver">Silver</option>
                                            <option value="Bronze">Bronze</option>
                                            <option value="Matte Black">Matte Black</option>
                                            <option value="Gloss Black">Gloss Black</option>
                                            <option value="White">White</option>
                                        </optgroup>
                                        <optgroup label="Premium Finishes">
                                            <option value="Gunmetal">Gunmetal</option>
                                            <option value="Titanium">Titanium</option>
                                            <option value="Chrome">Chrome</option>
                                            <option value="Hyper Black">Hyper Black</option>
                                        </optgroup>
                                        <optgroup label="Racing Colors">
                                            <option value="Red">Red</option>
                                            <option value="Blue">Blue</option>
                                            <option value="Green">Green</option>
                                            <option value="Yellow">Yellow</option>
                                            <option value="Orange">Orange</option>
                                            <option value="Purple">Purple</option>
                                            <option value="Pink">Pink</option>
                                        </optgroup>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Stok</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                        className="w-full bg-zinc-800 border-none rounded p-2 text-white focus:ring-1 focus:ring-accent-gold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Harga (Rp)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                        className="w-full bg-zinc-800 border-none rounded p-2 text-white focus:ring-1 focus:ring-accent-gold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Gambar Produk</label>
                                <div className="space-y-2">
                                    {formData.imageUrl && !imageFile && (
                                        <div className="text-xs text-gray-400">
                                            Gambar saat ini: <span className="text-accent-gold truncate">{getImageUrl(formData.imageUrl)}</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                                        className="w-full bg-zinc-800 border-none rounded p-2 text-white focus:ring-1 focus:ring-accent-gold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-gold file:text-black hover:file:bg-yellow-500"
                                    />
                                    <p className="text-xs text-gray-500">Upload gambar baru untuk mengganti yang lama.</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-zinc-800 border-none rounded p-2 text-white focus:ring-1 focus:ring-accent-gold h-24"
                                    placeholder="Deskripsi detail produk..."
                                ></textarea>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <Button type="button" onClick={handleCloseModal} variant="ghost" className="flex-1">
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-accent-gold text-black font-bold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                                        </>
                                    ) : (
                                        editingProduct ? "Simpan Perubahan" : "Simpan Produk"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
