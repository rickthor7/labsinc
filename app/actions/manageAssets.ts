"use server";

import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !["LABORAN", "KEPALA_LAB"].includes(session.user.role)) {
        throw new Error("Anda tidak memiliki akses admin.");
    }
    return session;
}

// ── Create a new asset ──
export async function createAsset(data: {
    barcode: string;
    namaAlat: string;
    kategori: string;
    kondisi: string;
}) {
    await requireAdmin();

    try {
        await prisma.asset.create({
            data: {
                barcode: data.barcode.toUpperCase(),
                namaAlat: data.namaAlat,
                kategori: data.kategori,
                kondisi: data.kondisi === "RUSAK" ? "RUSAK" : "BAIK",
                status: "TERSEDIA",
            },
        });

        revalidatePath("/");
        revalidatePath("/dashboard/manage-assets");
        return { success: true };
    } catch (err) {
        if (err instanceof Error && err.message.includes("Unique")) {
            return { success: false, error: "Barcode sudah digunakan. Gunakan barcode yang berbeda." };
        }
        return { success: false, error: err instanceof Error ? err.message : "Gagal menambah aset." };
    }
}

// ── Update asset status (TERSEDIA / DIPINJAM) ──
export async function updateAssetStatus(assetId: string, newStatus: string) {
    await requireAdmin();

    if (!["TERSEDIA", "DIPINJAM"].includes(newStatus)) {
        return { success: false, error: "Status tidak valid." };
    }

    try {
        await prisma.asset.update({
            where: { id: assetId },
            data: { status: newStatus === "TERSEDIA" ? "TERSEDIA" : "DIPINJAM" },
        });

        revalidatePath("/");
        revalidatePath("/dashboard/manage-assets");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal mengubah status." };
    }
}

// ── Update asset kondisi (BAIK / RUSAK) ──
export async function updateAssetKondisi(assetId: string, newKondisi: string) {
    await requireAdmin();

    if (!["BAIK", "RUSAK"].includes(newKondisi)) {
        return { success: false, error: "Kondisi tidak valid." };
    }

    try {
        await prisma.asset.update({
            where: { id: assetId },
            data: { kondisi: newKondisi === "BAIK" ? "BAIK" : "RUSAK" },
        });

        revalidatePath("/");
        revalidatePath("/dashboard/manage-assets");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal mengubah kondisi." };
    }
}

// ── Delete asset ──
export async function deleteAsset(assetId: string) {
    await requireAdmin();

    try {
        // Check if there are active borrowings
        const activeBorrowings = await prisma.borrowing.count({
            where: {
                assetId,
                status: { in: ["PENDING", "DIPINJAM"] },
            },
        });

        if (activeBorrowings > 0) {
            return { success: false, error: "Tidak bisa menghapus aset yang sedang dipinjam." };
        }

        // Delete related borrowings first, then asset
        await prisma.borrowing.deleteMany({ where: { assetId } });
        await prisma.asset.delete({ where: { id: assetId } });

        revalidatePath("/");
        revalidatePath("/dashboard/manage-assets");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal menghapus aset." };
    }
}

// ── Bulk update: Set all assets of a type to TERSEDIA ──
export async function resetAllStatus() {
    await requireAdmin();

    try {
        const result = await prisma.asset.updateMany({
            where: { status: "DIPINJAM" },
            data: { status: "TERSEDIA" },
        });

        revalidatePath("/");
        revalidatePath("/dashboard/manage-assets");
        return { success: true, count: result.count };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal reset status." };
    }
}
