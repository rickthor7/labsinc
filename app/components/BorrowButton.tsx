"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ajukanPinjaman } from "@/app/actions/laboratorium";
import { Send, Loader2, X, MessageSquare } from "lucide-react";

interface BorrowButtonProps {
    assetId: string;
    disabled: boolean;
}

export default function BorrowButton({ assetId, disabled }: BorrowButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [showModal, setShowModal] = useState(false);
    const [catatan, setCatatan] = useState("");
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (showModal && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [showModal]);

    const handleBorrow = () => {
        startTransition(async () => {
            const result = await ajukanPinjaman(assetId, catatan);

            if (!result.success) {
                if (result.error?.includes("login")) {
                    const confirmLogin = window.confirm(
                        result.error + "\n\nApakah Anda ingin login sekarang?"
                    );
                    if (confirmLogin) {
                        router.push("/login");
                    }
                } else {
                    alert(result.error || "Gagal mengajukan pinjaman.");
                }
            } else {
                alert("✅ Pinjaman berhasil diajukan! Status: PENDING.\nSilakan cek Dashboard untuk melihat status.");
                setCatatan("");
                setShowModal(false);
            }
        });
    };

    const modal = showModal ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isPending && setShowModal(false)} />
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
                <button
                    onClick={() => setShowModal(false)}
                    disabled={isPending}
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-muted hover:bg-surface-hover hover:text-foreground transition-colors disabled:opacity-50"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="mb-5">
                    <h3 className="text-lg font-bold text-foreground">Ajukan Peminjaman</h3>
                    <p className="mt-1 text-sm text-muted">
                        Tambahkan catatan atau alasan peminjaman (opsional)
                    </p>
                </div>

                <div className="mb-5">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Catatan / Alasan
                    </label>
                    <div className="relative">
                        <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
                        <textarea
                            ref={textareaRef}
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            placeholder="Contoh: Untuk praktikum mata kuliah RPL, pertemuan ke-5"
                            rows={3}
                            maxLength={500}
                            className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 resize-none"
                        />
                    </div>
                    <p className="mt-1 text-right text-xs text-muted">{catatan.length}/500</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        disabled={isPending}
                        className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted transition-all hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleBorrow}
                        disabled={isPending}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Ajukan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                disabled={disabled || isPending}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${disabled
                        ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                        : isPending
                            ? "cursor-wait bg-primary/80 text-white"
                            : "bg-gradient-to-r from-primary to-primary-dark text-white shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
                    }`}
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Memproses...
                    </>
                ) : disabled ? (
                    "Tidak Tersedia"
                ) : (
                    <>
                        <Send className="h-4 w-4" />
                        Ajukan Pinjam
                    </>
                )}
            </button>

            {/* Portal modal to document.body to avoid z-index/overflow issues */}
            {mounted && modal && createPortal(modal, document.body)}
        </>
    );
}
