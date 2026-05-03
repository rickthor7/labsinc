import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { hash } from "bcryptjs";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Helper: create multiple individual units for one equipment type
function generateItems(
    prefix: string,
    namaAlat: string,
    kategori: string,
    count: number,
    startNum: number = 1,
    kondisiOverrides?: Record<number, "RUSAK">,
    statusOverrides?: Record<number, "DIPINJAM">
) {
    return Array.from({ length: count }, (_, i) => {
        const num = startNum + i;
        const padded = String(num).padStart(3, "0");
        return {
            barcode: `${prefix}-${padded}`,
            namaAlat,
            kategori,
            kondisi: kondisiOverrides?.[num] ? "RUSAK" as const : "BAIK" as const,
            status: statusOverrides?.[num] ? "DIPINJAM" as const : "TERSEDIA" as const,
        };
    });
}

async function main() {
    console.log("🌱 Seeding database...\n");

    // Clean existing data (order matters for foreign keys)
    await prisma.roomBooking.deleteMany();
    await prisma.borrowing.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.user.deleteMany();

    // ── Create Users ──
    const hashedPassword = await hash("password123", 10);

    const mahasiswa = await prisma.user.create({
        data: {
            nama: "Budi Santoso",
            email: "budi@mahasiswa.ac.id",
            password: hashedPassword,
            role: "MAHASISWA",
        },
    });

    const laboran = await prisma.user.create({
        data: {
            nama: "Siti Laboran",
            email: "siti@lab.ac.id",
            password: hashedPassword,
            role: "LABORAN",
        },
    });

    const kepalaLab = await prisma.user.create({
        data: {
            nama: "Dr. Ahmad Kepala",
            email: "ahmad@lab.ac.id",
            password: hashedPassword,
            role: "KEPALA_LAB",
        },
    });

    console.log("✅ Users created:");
    console.log(`   - ${mahasiswa.nama} (${mahasiswa.role})`);
    console.log(`   - ${laboran.nama} (${laboran.role})`);
    console.log(`   - ${kepalaLab.nama} (${kepalaLab.role})`);

    // ── Create Individual Assets ──
    // Each physical unit gets its own record + unique barcode
    const allItems = [
        // PC Desktop: 5 units (PC-001 to PC-005), unit 3 sedang dipinjam
        ...generateItems("PC", "PC Desktop All-in-One", "Komputer", 5, 1, {}, { 3: "DIPINJAM" }),

        // Laptop: 3 units
        ...generateItems("LPT", "Laptop ASUS VivoBook", "Laptop", 3, 1, {}, { 1: "DIPINJAM" }),

        // Monitor: 5 units
        ...generateItems("MON", "Monitor LED 24 inch", "Display", 5),

        // Keyboard: 5 units
        ...generateItems("KB", "Keyboard Mechanical", "Peripheral", 5),

        // Mouse: 5 units
        ...generateItems("MS", "Mouse Wireless Logitech", "Peripheral", 5),

        // Proyektor: 2 units, unit 1 sedang dipinjam
        ...generateItems("PRJ", "Proyektor Epson", "Proyektor", 2, 1, {}, { 1: "DIPINJAM" }),

        // Printer: 2 units, unit 2 rusak
        ...generateItems("PRN", "Printer LaserJet HP", "Printer", 2, 1, { 2: "RUSAK" }),

        // Headset: 3 units
        ...generateItems("HST", "Headset USB Logitech", "Audio", 3),

        // Switch: 2 units, unit 2 rusak
        ...generateItems("SWT", "Switch Managed 24-Port", "Jaringan", 2, 1, { 2: "RUSAK" }),

        // Router: 3 units
        ...generateItems("RTR", "Router MikroTik", "Jaringan", 3),

        // UPS: 3 units
        ...generateItems("UPS", "UPS APC 1200VA", "Power", 3),

        // External HDD: 3 units, unit 2 sedang dipinjam
        ...generateItems("HDD", "External HDD 1TB", "Storage", 3, 1, {}, { 2: "DIPINJAM" }),
    ];

    const assets = await prisma.asset.createManyAndReturn({
        data: allItems,
    });

    console.log(`\n✅ ${assets.length} individual assets created (Lab Komputer)`);

    // Show summary per category
    const summary = new Map<string, number>();
    for (const item of allItems) {
        summary.set(item.namaAlat, (summary.get(item.namaAlat) || 0) + 1);
    }
    for (const [name, count] of summary) {
        console.log(`   - ${name}: ${count} unit`);
    }

    // ── Create Sample Borrowings ──
    // Find specific assets for borrowing records
    const laptopDipinjam = assets.find(a => a.barcode === "LPT-001");
    const pcDipinjam = assets.find(a => a.barcode === "PC-003");
    const hddDipinjam = assets.find(a => a.barcode === "HDD-002");

    if (laptopDipinjam) {
        await prisma.borrowing.create({
            data: {
                userId: mahasiswa.id,
                assetId: laptopDipinjam.id,
                status: "DIPINJAM",
            },
        });
    }

    if (pcDipinjam) {
        await prisma.borrowing.create({
            data: {
                userId: mahasiswa.id,
                assetId: pcDipinjam.id,
                status: "DIPINJAM",
            },
        });
    }

    if (hddDipinjam) {
        await prisma.borrowing.create({
            data: {
                userId: mahasiswa.id,
                assetId: hddDipinjam.id,
                status: "DIPINJAM",
            },
        });
    }

    console.log("✅ Sample borrowings created\n");
    console.log("🎉 Seed complete!\n");
    console.log("📋 Login credentials (all accounts use password: password123):");
    console.log("   Mahasiswa : budi@mahasiswa.ac.id");
    console.log("   Laboran   : siti@lab.ac.id");
    console.log("   Kepala Lab: ahmad@lab.ac.id");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
