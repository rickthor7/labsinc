import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import AddAssetForm from "@/app/components/AddAssetForm";
import AssetActions from "@/app/components/AssetActions";
import ResetAllButton from "@/app/components/ResetAllButton";
import Link from "next/link";
import {
    Settings,
    Barcode,
    ShieldCheck,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    Package,
    Tag,
    ArrowLeft,
    Search,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function ManageAssetsPage({ searchParams }: PageProps) {
    const session = await getServerSession(authOptions);

    if (!session) redirect("/login");
    if (!["LABORAN", "KEPALA_LAB"].includes(session.user.role)) redirect("/dashboard");

    const { q } = await searchParams;

    const assets = await prisma.asset.findMany({
        where: q
            ? {
                OR: [
                    { namaAlat: { contains: q, mode: "insensitive" } },
                    { barcode: { contains: q, mode: "insensitive" } },
                    { kategori: { contains: q, mode: "insensitive" } },
                ],
            }
            : undefined,
        orderBy: [{ namaAlat: "asc" }, { barcode: "asc" }],
    });

    const totalAssets = assets.length;
    const tersediaCount = assets.filter((a) => a.status === "TERSEDIA" && a.kondisi === "BAIK").length;
    const dipinjamCount = assets.filter((a) => a.status === "DIPINJAM").length;
    const rusakCount = assets.filter((a) => a.kondisi === "RUSAK").length;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/dashboard"
                    className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Dashboard
                </Link>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                            <Settings className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                                Manajemen Aset
                            </h1>
                            <p className="text-sm text-muted">
                                Tambah, ubah status, atau hapus aset laboratorium
                            </p>
                        </div>
                    </div>
                    <ResetAllButton />
                </div>
            </div>

            {/* Stats */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                            <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-foreground">{totalAssets}</p>
                            <p className="text-xs text-muted">Total Unit</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-foreground">{tersediaCount}</p>
                            <p className="text-xs text-muted">Tersedia</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
                            <XCircle className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-foreground">{dipinjamCount}</p>
                            <p className="text-xs text-muted">Dipinjam</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10">
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-foreground">{rusakCount}</p>
                            <p className="text-xs text-muted">Rusak</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Asset Form */}
            <div className="mb-8">
                <AddAssetForm />
            </div>

            {/* Search */}
            <div className="mb-6">
                <form className="group relative max-w-md">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary" />
                    <input
                        type="text"
                        name="q"
                        defaultValue={q}
                        placeholder="Cari barcode, nama, atau kategori..."
                        className="w-full rounded-xl border border-border bg-surface py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    />
                </form>
            </div>

            {/* Asset Table */}
            <div className="rounded-2xl border border-border bg-surface shadow-sm">
                <div className="border-b border-border px-6 py-4">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <Package className="h-5 w-5 text-primary" />
                        Daftar Aset ({assets.length} unit)
                    </h2>
                </div>

                {assets.length === 0 ? (
                    <div className="flex flex-col items-center py-16">
                        <Package className="mb-3 h-10 w-10 text-muted/40" />
                        <p className="font-medium text-foreground">Tidak Ada Aset</p>
                        <p className="text-sm text-muted">
                            {q ? `Tidak ditemukan hasil untuk "${q}"` : "Belum ada aset yang terdaftar."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-surface-hover/50 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                    <th className="px-6 py-3">#</th>
                                    <th className="px-6 py-3">Barcode</th>
                                    <th className="px-6 py-3">Nama Alat</th>
                                    <th className="px-6 py-3">Kategori</th>
                                    <th className="px-6 py-3">Kondisi</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {assets.map((asset, idx) => (
                                    <tr key={asset.id} className="transition-colors hover:bg-surface-hover/30">
                                        <td className="px-6 py-4 text-sm text-muted">{idx + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Barcode className="h-3.5 w-3.5 text-muted" />
                                                <span className="font-mono text-sm font-bold tracking-wider text-foreground">
                                                    {asset.barcode}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                                            {asset.namaAlat}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 rounded-lg bg-surface-hover px-2 py-1 text-xs font-medium text-muted">
                                                <Tag className="h-3 w-3" />
                                                {asset.kategori}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    asset.kondisi === "BAIK"
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                                                }`}
                                            >
                                                {asset.kondisi === "BAIK" ? (
                                                    <ShieldCheck className="h-3 w-3" />
                                                ) : (
                                                    <ShieldAlert className="h-3 w-3" />
                                                )}
                                                {asset.kondisi}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    asset.status === "TERSEDIA"
                                                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                }`}
                                            >
                                                {asset.status === "TERSEDIA" ? (
                                                    <CheckCircle2 className="h-3 w-3" />
                                                ) : (
                                                    <XCircle className="h-3 w-3" />
                                                )}
                                                {asset.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <AssetActions
                                                assetId={asset.id}
                                                currentStatus={asset.status}
                                                currentKondisi={asset.kondisi}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
