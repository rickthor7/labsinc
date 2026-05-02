"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetAllStatus } from "@/app/actions/manageAssets";
import { RefreshCcw, Loader2 } from "lucide-react";

export default function ResetAllButton() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleReset = () => {
        if (!confirm("Yakin ingin mengubah semua status aset DIPINJAM menjadi TERSEDIA?\n\nIni akan mereset semua aset yang sedang dipinjam.")) return;

        startTransition(async () => {
            const result = await resetAllStatus();
            if (!result.success) {
                alert(result.error);
            } else {
                alert(`✅ ${result.count} aset berhasil direset ke TERSEDIA.`);
                router.refresh();
            }
        });
    };

    return (
        <button
            onClick={handleReset}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-600 transition-all hover:bg-amber-500/20 disabled:opacity-50 dark:text-amber-400"
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <RefreshCcw className="h-4 w-4" />
            )}
            Reset Semua Status
        </button>
    );
}
