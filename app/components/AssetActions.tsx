"use client";

import { useTransition } from "react";
import { updateAssetStatus, updateAssetKondisi, deleteAsset } from "@/app/actions/manageAssets";
import { ToggleLeft, ToggleRight, ShieldCheck, ShieldAlert, Trash2, Loader2 } from "lucide-react";

interface AssetActionsProps {
    assetId: string;
    currentStatus: string;
    currentKondisi: string;
}

export default function AssetActions({ assetId, currentStatus, currentKondisi }: AssetActionsProps) {
    const [isStatusPending, startStatusTransition] = useTransition();
    const [isKondisiPending, startKondisiTransition] = useTransition();
    const [isDeletePending, startDeleteTransition] = useTransition();

    const toggleStatus = () => {
        const newStatus = currentStatus === "TERSEDIA" ? "DIPINJAM" : "TERSEDIA";
        startStatusTransition(async () => {
            const result = await updateAssetStatus(assetId, newStatus);
            if (!result.success) alert(result.error);
        });
    };

    const toggleKondisi = () => {
        const newKondisi = currentKondisi === "BAIK" ? "RUSAK" : "BAIK";
        startKondisiTransition(async () => {
            const result = await updateAssetKondisi(assetId, newKondisi);
            if (!result.success) alert(result.error);
        });
    };

    const handleDelete = () => {
        if (!confirm("Yakin ingin menghapus aset ini? Data peminjaman terkait juga akan dihapus.")) return;
        startDeleteTransition(async () => {
            const result = await deleteAsset(assetId);
            if (!result.success) alert(result.error);
        });
    };

    return (
        <div className="flex items-center gap-1.5">
            {/* Toggle Status */}
            <button
                onClick={toggleStatus}
                disabled={isStatusPending}
                title={`Ubah ke ${currentStatus === "TERSEDIA" ? "DIPINJAM" : "TERSEDIA"}`}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                    currentStatus === "TERSEDIA"
                        ? "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
                        : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                }`}
            >
                {isStatusPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : currentStatus === "TERSEDIA" ? (
                    <ToggleLeft className="h-3.5 w-3.5" />
                ) : (
                    <ToggleRight className="h-3.5 w-3.5" />
                )}
                {currentStatus === "TERSEDIA" ? "→ Dipinjam" : "→ Tersedia"}
            </button>

            {/* Toggle Kondisi */}
            <button
                onClick={toggleKondisi}
                disabled={isKondisiPending}
                title={`Ubah ke ${currentKondisi === "BAIK" ? "RUSAK" : "BAIK"}`}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                    currentKondisi === "BAIK"
                        ? "bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400"
                        : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                }`}
            >
                {isKondisiPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : currentKondisi === "BAIK" ? (
                    <ShieldAlert className="h-3.5 w-3.5" />
                ) : (
                    <ShieldCheck className="h-3.5 w-3.5" />
                )}
                {currentKondisi === "BAIK" ? "→ Rusak" : "→ Baik"}
            </button>

            {/* Delete */}
            <button
                onClick={handleDelete}
                disabled={isDeletePending}
                title="Hapus aset"
                className="flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-500/20 disabled:opacity-50 dark:text-red-400"
            >
                {isDeletePending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                )}
            </button>
        </div>
    );
}
