"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FlaskConical, Mail, Lock, LogIn, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
            {/* Background decorations */}
            <div className="pointer-events-none fixed -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none fixed -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl" />

            <div className="relative w-full max-w-md">
                {/* Logo & Title */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-xl">
                        <FlaskConical className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Masuk ke <span className="text-primary">LabsInc</span>
                    </h1>
                    <p className="mt-1 text-sm text-muted">
                        Sistem Manajemen Laboratorium Terpadu
                    </p>
                </div>

                {/* Login Form Card */}
                <div className="rounded-2xl border border-border bg-surface p-8 shadow-xl shadow-primary/5">
                    {error && (
                        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-sm font-medium text-foreground"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="contoh@mahasiswa.ac.id"
                                    required
                                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-sm font-medium text-foreground"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    required
                                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <LogIn className="h-4 w-4" />
                                    Masuk
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-6 rounded-xl bg-surface-hover p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                            Demo Akun
                        </p>
                        <div className="space-y-1.5 text-xs text-muted">
                            <div className="flex justify-between">
                                <span>Mahasiswa:</span>
                                <span className="font-mono text-foreground">budi@mahasiswa.ac.id</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Laboran:</span>
                                <span className="font-mono text-foreground">siti@lab.ac.id</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Kepala Lab:</span>
                                <span className="font-mono text-foreground">ahmad@lab.ac.id</span>
                            </div>
                            <div className="mt-2 border-t border-border pt-2 text-center">
                                Password: <span className="font-mono font-semibold text-foreground">password123</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back to home */}
                <p className="mt-6 text-center text-sm text-muted">
                    <Link href="/" className="font-medium text-primary hover:text-primary-dark transition-colors">
                        ← Kembali ke Katalog
                    </Link>
                </p>
            </div>
        </div>
    );
}
