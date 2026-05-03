import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import AdminActions from "@/app/components/AdminActions";
import ReturnButton from "@/app/components/ReturnButton";
import BookingAdminActions from "@/app/components/BookingAdminActions";
import ExportPDFButton from "@/app/components/ExportPDFButton";
import {
    LayoutDashboard,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRightLeft,
    AlertCircle,
    ShieldCheck,
    Users,
    Inbox,
    DoorOpen,
    RotateCcw,
    CalendarDays,
} from "lucide-react";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    PENDING: {
        label: "Pending",
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        icon: Clock,
    },
    DIPINJAM: {
        label: "Dipinjam",
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        icon: ArrowRightLeft,
    },
    SELESAI: {
        label: "Dikembalikan",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        icon: CheckCircle2,
    },
    DITOLAK: {
        label: "Ditolak",
        color: "bg-red-500/10 text-red-600 dark:text-red-400",
        icon: XCircle,
    },
};

const bookingStatusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    PENDING: {
        label: "Pending",
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        icon: Clock,
    },
    APPROVED: {
        label: "Disetujui",
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        icon: CheckCircle2,
    },
    COMPLETED: {
        label: "Selesai",
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        icon: CheckCircle2,
    },
    REJECTED: {
        label: "Ditolak",
        color: "bg-red-500/10 text-red-600 dark:text-red-400",
        icon: XCircle,
    },
};

const roomLabels: Record<string, string> = {
    LAB_RPL: "Lab RPL",
    LAB_JARKOM: "Lab Jarkom",
    LAB_MM: "Lab MM",
    LAB_SI: "Lab SI",
};

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const isAdmin =
        session.user.role === "LABORAN" || session.user.role === "KEPALA_LAB";

    // ──────────────────────────────────────────────────
    // ADMIN VIEW
    // ──────────────────────────────────────────────────
    if (isAdmin) {
        const pendingBorrowings = await prisma.borrowing.findMany({
            where: { status: "PENDING" },
            include: {
                user: { select: { nama: true, email: true } },
                asset: { select: { namaAlat: true, barcode: true } },
            },
            orderBy: { tglPinjam: "desc" },
        });

        const borrowedItems = await prisma.borrowing.findMany({
            where: { status: "DIPINJAM" },
            include: {
                user: { select: { nama: true, email: true } },
                asset: { select: { namaAlat: true, barcode: true } },
            },
            orderBy: { tglPinjam: "desc" },
        });

        // All borrowings for PDF export
        const allBorrowings = await prisma.borrowing.findMany({
            include: {
                user: { select: { nama: true, email: true } },
                asset: { select: { namaAlat: true, barcode: true } },
            },
            orderBy: { tglPinjam: "desc" },
        });

        const pendingBookings = await prisma.roomBooking.findMany({
            where: { status: "PENDING" },
            include: {
                user: { select: { nama: true, email: true } },
            },
            orderBy: { bookingDate: "desc" },
        });

        const approvedBookings = await prisma.roomBooking.findMany({
            where: { status: "APPROVED" },
            include: {
                user: { select: { nama: true, email: true } },
            },
            orderBy: { bookingDate: "desc" },
        });

        const allBookings = await prisma.roomBooking.findMany({
            include: {
                user: { select: { nama: true, email: true } },
            },
            orderBy: { bookingDate: "desc" },
        }).catch((e) => {
            console.error("Error fetching allBookings:", e);
            return [];
        });

        // Serialize dates for client component
        const borrowingsForPDF = allBorrowings.map(b => ({
            ...b,
            tglPinjam: b.tglPinjam.toISOString(),
            returnedDate: b.returnedDate?.toISOString() || null,
            createdAt: b.createdAt.toISOString(),
            updatedAt: b.updatedAt.toISOString(),
        }));
        const bookingsForPDF = allBookings.map(b => ({
            ...b,
            bookingDate: b.bookingDate.toISOString(),
            createdAt: b.createdAt.toISOString(),
            updatedAt: b.updatedAt.toISOString(),
        }));

        return (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Admin Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                                Dashboard Admin
                            </h1>
                            <p className="text-sm text-muted">
                                Kelola peminjaman alat & booking ruangan laboratorium
                            </p>
                        </div>
                    </div>
                    <ExportPDFButton borrowings={borrowingsForPDF} bookings={bookingsForPDF} />
                </div>

                {/* Stats */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                                <Inbox className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{pendingBorrowings.length}</p>
                                <p className="text-xs text-muted">Antrean Alat</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                                <ArrowRightLeft className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{borrowedItems.length}</p>
                                <p className="text-xs text-muted">Sedang Dipinjam</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                                <DoorOpen className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{pendingBookings.length}</p>
                                <p className="text-xs text-muted">Antrean Booking</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                                <Users className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground capitalize">
                                    {session.user.role.toLowerCase().replace("_", " ")}
                                </p>
                                <p className="text-xs text-muted">Role Anda</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── TABLE 1: Pending Equipment Requests ── */}
                <div className="mb-8 rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="border-b border-border px-6 py-4">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            Antrean Peminjaman Alat
                        </h2>
                        <p className="text-sm text-muted">Permintaan peminjaman yang menunggu persetujuan</p>
                    </div>
                    {pendingBorrowings.length === 0 ? (
                        <div className="flex flex-col items-center py-16">
                            <Inbox className="mb-3 h-10 w-10 text-muted/40" />
                            <p className="font-medium text-foreground">Tidak Ada Antrean</p>
                            <p className="text-sm text-muted">Semua permintaan telah diproses.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-surface-hover/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                        <th className="px-6 py-3">Pemohon</th>
                                        <th className="px-6 py-3">Alat</th>
                                        <th className="px-6 py-3">Catatan</th>
                                        <th className="px-6 py-3">Tanggal</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {pendingBorrowings.map((b) => (
                                        <tr key={b.id} className="transition-colors hover:bg-surface-hover/30">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-foreground">{b.user.nama}</p>
                                                <p className="text-xs text-muted">{b.user.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-foreground">{b.asset.namaAlat}</p>
                                                <p className="font-mono text-xs text-muted">{b.asset.barcode}</p>
                                            </td>
                                            <td className="max-w-[200px] px-6 py-4">
                                                <p className="truncate text-xs text-muted italic">{b.catatan || "—"}</p>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                                                {new Date(b.tglPinjam).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                    <Clock className="h-3 w-3" />
                                                    Pending
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <AdminActions borrowingId={b.id} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── TABLE 2: Borrowed Equipment ── */}
                <div className="mb-8 rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="border-b border-border px-6 py-4">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                            <RotateCcw className="h-5 w-5 text-blue-500" />
                            Alat Sedang Dipinjam
                        </h2>
                        <p className="text-sm text-muted">Tandai jika alat sudah dikembalikan</p>
                    </div>
                    {borrowedItems.length === 0 ? (
                        <div className="flex flex-col items-center py-16">
                            <CheckCircle2 className="mb-3 h-10 w-10 text-muted/40" />
                            <p className="font-medium text-foreground">Semua Alat Kembali</p>
                            <p className="text-sm text-muted">Tidak ada alat yang sedang dipinjam.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-surface-hover/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                        <th className="px-6 py-3">Peminjam</th>
                                        <th className="px-6 py-3">Alat</th>
                                        <th className="px-6 py-3">Tgl Pinjam</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {borrowedItems.map((b) => (
                                        <tr key={b.id} className="transition-colors hover:bg-surface-hover/30">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-foreground">{b.user.nama}</p>
                                                <p className="text-xs text-muted">{b.user.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-foreground">{b.asset.namaAlat}</p>
                                                <p className="font-mono text-xs text-muted">{b.asset.barcode}</p>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                                                {new Date(b.tglPinjam).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                    <ArrowRightLeft className="h-3 w-3" />
                                                    Dipinjam
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <ReturnButton borrowingId={b.id} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── TABLE 3: Pending Room Booking Requests ── */}
                <div className="mb-8 rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="border-b border-border px-6 py-4">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                            <DoorOpen className="h-5 w-5 text-purple-500" />
                            Antrean Booking Ruangan
                        </h2>
                        <p className="text-sm text-muted">Permintaan booking ruangan yang menunggu persetujuan</p>
                    </div>
                    {pendingBookings.length === 0 ? (
                        <div className="flex flex-col items-center py-16">
                            <Inbox className="mb-3 h-10 w-10 text-muted/40" />
                            <p className="font-medium text-foreground">Tidak Ada Antrean</p>
                            <p className="text-sm text-muted">Semua booking telah diproses.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-surface-hover/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                        <th className="px-6 py-3">Pemohon</th>
                                        <th className="px-6 py-3">Ruangan</th>
                                        <th className="px-6 py-3">Tanggal</th>
                                        <th className="px-6 py-3">Waktu</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {pendingBookings.map((b) => (
                                        <tr key={b.id} className="transition-colors hover:bg-surface-hover/30">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-foreground">{b.user.nama}</p>
                                                <p className="text-xs text-muted">{b.user.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                                    <DoorOpen className="h-3 w-3" />
                                                    {roomLabels[b.roomName] || b.roomName}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                                                {new Date(b.bookingDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                                                {b.startTime} — {b.endTime}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                    <Clock className="h-3 w-3" />
                                                    Pending
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <BookingAdminActions bookingId={b.id} status="PENDING" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── TABLE 3.5: Active/Approved Room Bookings ── */}
                <div className="mb-8 rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="border-b border-border px-6 py-4">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            Ruangan Aktif (Disetujui)
                        </h2>
                        <p className="text-sm text-muted">Ruangan yang sedang digunakan — tandai selesai jika sudah selesai dipakai</p>
                    </div>
                    {approvedBookings.length === 0 ? (
                        <div className="flex flex-col items-center py-16">
                            <DoorOpen className="mb-3 h-10 w-10 text-muted/40" />
                            <p className="font-medium text-foreground">Tidak Ada Ruangan Aktif</p>
                            <p className="text-sm text-muted">Belum ada booking yang disetujui saat ini.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-surface-hover/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                        <th className="px-6 py-3">Pemohon</th>
                                        <th className="px-6 py-3">Ruangan</th>
                                        <th className="px-6 py-3">Tanggal</th>
                                        <th className="px-6 py-3">Waktu</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {approvedBookings.map((b) => (
                                        <tr key={b.id} className="transition-colors hover:bg-surface-hover/30">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-foreground">{b.user.nama}</p>
                                                <p className="text-xs text-muted">{b.user.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                                    <DoorOpen className="h-3 w-3" />
                                                    {roomLabels[b.roomName] || b.roomName}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                                                {new Date(b.bookingDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                                                {b.startTime} — {b.endTime}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Disetujui
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <BookingAdminActions bookingId={b.id} status="APPROVED" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── TABLE 4: All Room Booking History ── */}
                <div className="rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="border-b border-border px-6 py-4">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                            <CalendarDays className="h-5 w-5 text-indigo-500" />
                            Riwayat Booking Ruangan
                        </h2>
                        <p className="text-sm text-muted">
                            Semua riwayat pemesanan ruangan laboratorium untuk monitoring
                        </p>
                    </div>
                    {allBookings.length === 0 ? (
                        <div className="flex flex-col items-center py-16">
                            <DoorOpen className="mb-3 h-10 w-10 text-muted/40" />
                            <p className="font-medium text-foreground">Belum Ada Riwayat</p>
                            <p className="text-sm text-muted">Belum ada booking ruangan.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-surface-hover/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                        <th className="px-6 py-3">#</th>
                                        <th className="px-6 py-3">Pemohon</th>
                                        <th className="px-6 py-3">Ruangan</th>
                                        <th className="px-6 py-3">Tanggal</th>
                                        <th className="px-6 py-3">Waktu</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {allBookings.map((b, idx) => {
                                        const cfg = bookingStatusConfig[b.status] || bookingStatusConfig.PENDING;
                                        const StatusIcon = cfg.icon;
                                        return (
                                            <tr key={b.id} className="transition-colors hover:bg-surface-hover/30">
                                                <td className="px-6 py-4 text-sm text-muted">{idx + 1}</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold text-foreground">{b.user.nama}</p>
                                                    <p className="text-xs text-muted">{b.user.email}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                                        <DoorOpen className="h-3 w-3" />
                                                        {roomLabels[b.roomName] || b.roomName}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                                                    {new Date(b.bookingDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                                                    {b.startTime} — {b.endTime}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {cfg.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ──────────────────────────────────────────────────
    // MAHASISWA VIEW
    // ──────────────────────────────────────────────────
    const borrowings = await prisma.borrowing.findMany({
        where: { userId: session.user.id },
        include: {
            asset: { select: { namaAlat: true, barcode: true } },
        },
        orderBy: { tglPinjam: "desc" },
    });

    const roomBookings = await prisma.roomBooking.findMany({
        where: { userId: session.user.id },
        orderBy: { bookingDate: "desc" },
    });

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Student Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                        <LayoutDashboard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                            Dashboard Saya
                        </h1>
                        <p className="text-sm text-muted">
                            Halo, {session.user.nama} — Berikut riwayat aktivitas Anda.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {(["PENDING", "DIPINJAM", "SELESAI", "DITOLAK"] as const).map(
                    (status) => {
                        const cfg = statusConfig[status];
                        const Icon = cfg.icon;
                        const count = borrowings.filter((b) => b.status === status).length;
                        return (
                            <div key={status} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                                <div className="flex items-center gap-2.5">
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${cfg.color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-foreground">{count}</p>
                                        <p className="text-xs text-muted">{cfg.label}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                )}
            </div>

            {/* Equipment Borrowing History */}
            <div className="mb-8 rounded-2xl border border-border bg-surface shadow-sm">
                <div className="border-b border-border px-6 py-4">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <Clock className="h-5 w-5 text-primary" />
                        Riwayat Peminjaman Alat
                    </h2>
                    <p className="text-sm text-muted">Semua catatan peminjaman alat laboratorium Anda</p>
                </div>
                {borrowings.length === 0 ? (
                    <div className="flex flex-col items-center py-16">
                        <Inbox className="mb-3 h-10 w-10 text-muted/40" />
                        <p className="font-medium text-foreground">Belum Ada Riwayat</p>
                        <p className="text-sm text-muted">Anda belum pernah mengajukan peminjaman.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-surface-hover/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                    <th className="px-6 py-3">#</th>
                                    <th className="px-6 py-3">Nama Alat</th>
                                    <th className="px-6 py-3">Barcode</th>
                                    <th className="px-6 py-3">Tgl Pinjam</th>
                                    <th className="px-6 py-3">Tgl Kembali</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {borrowings.map((b, idx) => {
                                    const cfg = statusConfig[b.status] || statusConfig.PENDING;
                                    const StatusIcon = cfg.icon;
                                    return (
                                        <tr key={b.id} className="transition-colors hover:bg-surface-hover/30">
                                            <td className="px-6 py-4 text-sm text-muted">{idx + 1}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-foreground">{b.asset.namaAlat}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-muted">{b.asset.barcode}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                                                {new Date(b.tglPinjam).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                                                {b.returnedDate
                                                    ? new Date(b.returnedDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                                                    : "—"
                                                }
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {cfg.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Room Booking History */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm">
                <div className="border-b border-border px-6 py-4">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <CalendarDays className="h-5 w-5 text-purple-500" />
                        Riwayat Booking Ruangan
                    </h2>
                    <p className="text-sm text-muted">Semua catatan pemesanan ruang laboratorium Anda</p>
                </div>
                {roomBookings.length === 0 ? (
                    <div className="flex flex-col items-center py-16">
                        <DoorOpen className="mb-3 h-10 w-10 text-muted/40" />
                        <p className="font-medium text-foreground">Belum Ada Booking</p>
                        <p className="text-sm text-muted">Anda belum pernah melakukan booking ruangan.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-surface-hover/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                    <th className="px-6 py-3">#</th>
                                    <th className="px-6 py-3">Ruangan</th>
                                    <th className="px-6 py-3">Tanggal</th>
                                    <th className="px-6 py-3">Waktu</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {roomBookings.map((b, idx) => {
                                    const cfg = bookingStatusConfig[b.status] || bookingStatusConfig.PENDING;
                                    const StatusIcon = cfg.icon;
                                    return (
                                        <tr key={b.id} className="transition-colors hover:bg-surface-hover/30">
                                            <td className="px-6 py-4 text-sm text-muted">{idx + 1}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                                    <DoorOpen className="h-3 w-3" />
                                                    {roomLabels[b.roomName] || b.roomName}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                                                {new Date(b.bookingDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted">
                                                {b.startTime} — {b.endTime}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {cfg.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
