"use server";

import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

const VALID_ROOMS = ["LAB_RPL", "LAB_JARKOM", "LAB_MM", "LAB_SI"] as const;
type RoomName = (typeof VALID_ROOMS)[number];

// ──────────────────────────────────────────────────────
// Equipment Borrowing Actions
// ──────────────────────────────────────────────────────

export async function ajukanPinjaman(assetId: string, catatan?: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { success: false, error: "Anda harus login terlebih dahulu untuk mengajukan pinjaman." };
    }

    const userId = session.user.id;

    try {
        const borrowing = await prisma.$transaction(async (tx) => {
            const asset = await tx.asset.findUnique({
                where: { id: assetId },
            });

            if (!asset) {
                throw new Error("Alat tidak ditemukan.");
            }

            if (asset.status !== "TERSEDIA") {
                throw new Error("Maaf, alat ini sedang tidak tersedia (sudah dipinjam).");
            }

            if (asset.kondisi === "RUSAK") {
                throw new Error("Maaf, alat ini dalam kondisi rusak.");
            }

            // Mark asset as DIPINJAM
            await tx.asset.update({
                where: { id: assetId },
                data: { status: "DIPINJAM" },
            });

            return tx.borrowing.create({
                data: {
                    userId,
                    assetId,
                    catatan: catatan?.trim() || null,
                    status: "PENDING",
                },
            });
        });

        revalidatePath("/");
        revalidatePath("/dashboard");

        return { success: true, borrowingId: borrowing.id };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal mengajukan pinjaman." };
    }
}

export async function setujuiPinjaman(borrowingId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !["LABORAN", "KEPALA_LAB"].includes(session.user.role)) {
        return { success: false, error: "Anda tidak memiliki akses untuk menyetujui pinjaman." };
    }

    try {
        await prisma.borrowing.update({
            where: { id: borrowingId },
            data: { status: "DIPINJAM" },
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal menyetujui pinjaman." };
    }
}

export async function tolakPinjaman(borrowingId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !["LABORAN", "KEPALA_LAB"].includes(session.user.role)) {
        return { success: false, error: "Anda tidak memiliki akses untuk menolak pinjaman." };
    }

    try {
        await prisma.$transaction(async (tx) => {
            const borrowing = await tx.borrowing.findUnique({
                where: { id: borrowingId },
            });

            if (!borrowing) {
                throw new Error("Data peminjaman tidak ditemukan.");
            }

            await tx.borrowing.update({
                where: { id: borrowingId },
                data: { status: "DITOLAK" },
            });

            // Return asset to TERSEDIA
            await tx.asset.update({
                where: { id: borrowing.assetId },
                data: { status: "TERSEDIA" },
            });
        });

        revalidatePath("/");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal menolak pinjaman." };
    }
}

// ──────────────────────────────────────────────────────
// Equipment Return Action
// ──────────────────────────────────────────────────────

export async function returnEquipment(borrowingId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !["LABORAN", "KEPALA_LAB"].includes(session.user.role)) {
        return { success: false, error: "Anda tidak memiliki akses untuk mengembalikan alat." };
    }

    try {
        await prisma.$transaction(async (tx) => {
            const borrowing = await tx.borrowing.findUnique({
                where: { id: borrowingId },
            });

            if (!borrowing) {
                throw new Error("Data peminjaman tidak ditemukan.");
            }

            if (borrowing.status !== "DIPINJAM") {
                throw new Error("Alat ini tidak dalam status dipinjam.");
            }

            await tx.borrowing.update({
                where: { id: borrowingId },
                data: {
                    status: "SELESAI",
                    returnedDate: new Date(),
                },
            });

            // Return asset to TERSEDIA
            await tx.asset.update({
                where: { id: borrowing.assetId },
                data: { status: "TERSEDIA" },
            });
        });

        revalidatePath("/");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal mengembalikan alat." };
    }
}

// ──────────────────────────────────────────────────────
// Room Booking Actions
// ──────────────────────────────────────────────────────

export async function bookRoom(
    roomName: string,
    bookingDate: string,
    startTime: string,
    endTime: string
) {
    // Validate room name
    if (!VALID_ROOMS.includes(roomName as RoomName)) {
        return { success: false, error: "Nama ruangan tidak valid." };
    }

    // Validate auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { success: false, error: "Anda harus login terlebih dahulu untuk booking ruangan." };
    }

    // Validate time range
    if (!startTime || !endTime) {
        return { success: false, error: "Jam mulai dan jam selesai harus diisi." };
    }
    if (startTime >= endTime) {
        return { success: false, error: "Jam mulai harus lebih awal dari jam selesai." };
    }

    // Validate date not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(bookingDate);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
        return { success: false, error: "Tidak bisa booking untuk tanggal yang sudah lewat." };
    }

    try {
        // Check for overlapping bookings (PENDING or APPROVED)
        const existingBookings = await prisma.roomBooking.findMany({
            where: {
                roomName: roomName as RoomName,
                bookingDate: new Date(bookingDate),
                status: { in: ["PENDING", "APPROVED"] },
            },
        });

        const hasOverlap = existingBookings.some((existing) => {
            // Check if the time ranges overlap
            return startTime < existing.endTime && endTime > existing.startTime;
        });

        if (hasOverlap) {
            return {
                success: false,
                error: "Ruangan sudah dibooking pada waktu tersebut. Silakan pilih waktu lain.",
            };
        }

        const booking = await prisma.roomBooking.create({
            data: {
                userId: session.user.id,
                roomName: roomName as RoomName,
                bookingDate: new Date(bookingDate),
                startTime,
                endTime,
                status: "PENDING",
            },
        });

        revalidatePath("/");
        revalidatePath("/dashboard");
        return { success: true, bookingId: booking.id };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal membooking ruangan." };
    }
}

export async function approveBooking(bookingId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !["LABORAN", "KEPALA_LAB"].includes(session.user.role)) {
        return { success: false, error: "Anda tidak memiliki akses." };
    }

    try {
        await prisma.roomBooking.update({
            where: { id: bookingId },
            data: { status: "APPROVED" },
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal menyetujui booking." };
    }
}

export async function rejectBooking(bookingId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !["LABORAN", "KEPALA_LAB"].includes(session.user.role)) {
        return { success: false, error: "Anda tidak memiliki akses." };
    }

    try {
        await prisma.roomBooking.update({
            where: { id: bookingId },
            data: { status: "REJECTED" },
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal menolak booking." };
    }
}

export async function completeBooking(bookingId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !["LABORAN", "KEPALA_LAB"].includes(session.user.role)) {
        return { success: false, error: "Anda tidak memiliki akses." };
    }

    try {
        const booking = await prisma.roomBooking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            return { success: false, error: "Data booking tidak ditemukan." };
        }

        if (booking.status !== "APPROVED") {
            return { success: false, error: "Hanya booking yang sudah disetujui yang bisa ditandai selesai." };
        }

        await prisma.roomBooking.update({
            where: { id: bookingId },
            data: { status: "COMPLETED" },
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal menyelesaikan booking." };
    }
}
