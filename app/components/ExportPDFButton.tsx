"use client";

import { useState } from "react";
import { FileDown, Loader2, X, FileText, DoorOpen } from "lucide-react";

interface BorrowingData {
    id: string;
    catatan: string | null;
    tglPinjam: string;
    returnedDate: string | null;
    status: string;
    user: { nama: string; email: string };
    asset: { namaAlat: string; barcode: string };
}

interface BookingData {
    id: string;
    roomName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: string;
    user: { nama: string; email: string };
}

interface ExportPDFButtonProps {
    borrowings: BorrowingData[];
    bookings: BookingData[];
}

const roomLabels: Record<string, string> = {
    LAB_RPL: "Lab RPL",
    LAB_JARKOM: "Lab Jarkom",
    LAB_MM: "Lab MM",
    LAB_SI: "Lab SI",
};

const statusLabels: Record<string, string> = {
    PENDING: "Pending",
    DIPINJAM: "Dipinjam",
    SELESAI: "Dikembalikan",
    DITOLAK: "Ditolak",
    APPROVED: "Disetujui",
    COMPLETED: "Selesai",
    REJECTED: "Ditolak",
};

export default function ExportPDFButton({ borrowings, bookings }: ExportPDFButtonProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [reportType, setReportType] = useState<"borrowings" | "bookings" | "all">("all");

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const { default: jsPDF } = await import("jspdf");
            const { default: autoTable } = await import("jspdf-autotable");

            const doc = new jsPDF({ orientation: "landscape" });
            const now = new Date().toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric",
            });

            // ── Header ──
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("LAPORAN LABORATORIUM — LabsInc", 14, 20);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Tanggal cetak: ${now}`, 14, 28);

            let yPos = 36;

            // ── Borrowings Table ──
            if (reportType === "borrowings" || reportType === "all") {
                doc.setFontSize(13);
                doc.setFont("helvetica", "bold");
                doc.text("Laporan Peminjaman Alat", 14, yPos);
                yPos += 4;

                const borrowingRows = borrowings.map((b, i) => [
                    String(i + 1),
                    b.user.nama,
                    b.user.email,
                    b.asset.namaAlat,
                    b.asset.barcode,
                    b.catatan || "—",
                    new Date(b.tglPinjam).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
                    b.returnedDate
                        ? new Date(b.returnedDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                        : "—",
                    statusLabels[b.status] || b.status,
                ]);

                autoTable(doc, {
                    startY: yPos,
                    head: [["#", "Peminjam", "Email", "Alat", "Barcode", "Catatan", "Tgl Pinjam", "Tgl Kembali", "Status"]],
                    body: borrowingRows,
                    theme: "grid",
                    headStyles: {
                        fillColor: [88, 80, 236],
                        textColor: 255,
                        fontSize: 8,
                        fontStyle: "bold",
                    },
                    bodyStyles: { fontSize: 7 },
                    columnStyles: {
                        0: { cellWidth: 8 },
                        5: { cellWidth: 40 },
                    },
                    margin: { left: 14, right: 14 },
                });

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                yPos = (doc as any).lastAutoTable.finalY + 14;
            }

            // ── Bookings Table ──
            if (reportType === "bookings" || reportType === "all") {
                if (reportType === "all" && yPos > 160) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.setFontSize(13);
                doc.setFont("helvetica", "bold");
                doc.text("Laporan Booking Ruangan", 14, yPos);
                yPos += 4;

                const bookingRows = bookings.map((b, i) => [
                    String(i + 1),
                    b.user.nama,
                    b.user.email,
                    roomLabels[b.roomName] || b.roomName,
                    new Date(b.bookingDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
                    `${b.startTime} — ${b.endTime}`,
                    statusLabels[b.status] || b.status,
                ]);

                autoTable(doc, {
                    startY: yPos,
                    head: [["#", "Pemohon", "Email", "Ruangan", "Tanggal", "Waktu", "Status"]],
                    body: bookingRows,
                    theme: "grid",
                    headStyles: {
                        fillColor: [139, 92, 246],
                        textColor: 255,
                        fontSize: 8,
                        fontStyle: "bold",
                    },
                    bodyStyles: { fontSize: 7 },
                    columnStyles: {
                        0: { cellWidth: 8 },
                    },
                    margin: { left: 14, right: 14 },
                });
            }

            // ── Footer ──
            const pageCount = doc.internal.pages.length ? doc.internal.pages.length - 1 : 0;
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.text(
                    `LabsInc — Halaman ${i} dari ${pageCount}`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: "center" }
                );
            }

            doc.save(`laporan-labsinc-${new Date().toISOString().split("T")[0]}.pdf`);
            setShowModal(false);
        } catch (err) {
            console.error("PDF export error:", err);
            alert("Gagal mengexport PDF. Coba lagi.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
            >
                <FileDown className="h-4 w-4" />
                Export PDF
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute right-4 top-4 rounded-lg p-1.5 text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="mb-5">
                            <h3 className="text-lg font-bold text-foreground">Export Laporan PDF</h3>
                            <p className="mt-1 text-sm text-muted">Pilih jenis laporan yang ingin dicetak</p>
                        </div>

                        <div className="mb-5 space-y-2">
                            {[
                                { value: "all" as const, label: "Semua Laporan", desc: "Peminjaman alat & booking ruangan", icon: FileDown },
                                { value: "borrowings" as const, label: "Peminjaman Alat", desc: `${borrowings.length} data peminjaman`, icon: FileText },
                                { value: "bookings" as const, label: "Booking Ruangan", desc: `${bookings.length} data booking`, icon: DoorOpen },
                            ].map((opt) => {
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => setReportType(opt.value)}
                                        className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${reportType === opt.value
                                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                                : "border-border hover:bg-surface-hover"
                                            }`}
                                    >
                                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${reportType === opt.value ? "bg-primary/10" : "bg-surface-hover"
                                            }`}>
                                            <Icon className={`h-4 w-4 ${reportType === opt.value ? "text-primary" : "text-muted"}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                                            <p className="text-xs text-muted">{opt.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Mengexport...
                                </>
                            ) : (
                                <>
                                    <FileDown className="h-4 w-4" />
                                    Download PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
