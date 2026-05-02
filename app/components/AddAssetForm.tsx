"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAsset } from "@/app/actions/manageAssets";
import { Plus, Loader2, Barcode, Tag, Package, X } from "lucide-react";

export default function AddAssetForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const [barcode, setBarcode] = useState("");
    const [namaAlat, setNamaAlat] = useState("");
    const [kategori, setKategori] = useState("");
    const [kondisi, setKondisi] = useState("BAIK");
    const [error, setError] = useState("");

    const resetForm = () => {
        setBarcode("");
        setNamaAlat("");
        setKategori("");
        setKondisi("BAIK");
        setError("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        startTransition(async () => {
            const result = await createAsset({ barcode, namaAlat, kategori, kondisi });
            if (!result.success) {
                setError(result.error || "Gagal menambah aset.");
            } else {
                resetForm();
                setIsOpen(false);
                router.refresh();
            }
        });
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
            >
                <Plus className="h-4 w-4" />
                Tambah Aset Baru
            </button>
        );
    }

    return (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Tambah Aset Baru</h3>
                <button
                    onClick={() => { setIsOpen(false); resetForm(); }}
                    className="rounded-lg p-1.5 text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted uppercase tracking-wider">Barcode</label>
                    <div className="relative">
                        <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            placeholder="PC-006"
                            required
                            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm font-mono text-foreground outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted uppercase tracking-wider">Nama Alat</label>
                    <div className="relative">
                        <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            value={namaAlat}
                            onChange={(e) => setNamaAlat(e.target.value)}
                            placeholder="PC Desktop All-in-One"
                            required
                            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted uppercase tracking-wider">Kategori</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            value={kategori}
                            onChange={(e) => setKategori(e.target.value)}
                            placeholder="Komputer"
                            required
                            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted uppercase tracking-wider">Kondisi</label>
                    <select
                        value={kondisi}
                        onChange={(e) => setKondisi(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    >
                        <option value="BAIK">BAIK</option>
                        <option value="RUSAK">RUSAK</option>
                    </select>
                </div>

                <div className="flex items-end">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    );
}
