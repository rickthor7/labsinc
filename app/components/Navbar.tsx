"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FlaskConical, Menu, X, LayoutDashboard, Package, LogIn, LogOut, User, Settings } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
    const { data: session, status } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="glass fixed top-0 left-0 right-0 z-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-md transition-transform group-hover:scale-105">
                            <FlaskConical className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">
                            Labs<span className="text-primary">Inc</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link
                            href="/"
                            className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-muted transition-all hover:text-foreground hover:bg-surface-hover"
                        >
                            <Package className="h-4 w-4" />
                            Katalog
                        </Link>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-muted transition-all hover:text-foreground hover:bg-surface-hover"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Link>
                        {session?.user?.role && ["LABORAN", "KEPALA_LAB"].includes(session.user.role) && (
                            <Link
                                href="/dashboard/manage-assets"
                                className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-muted transition-all hover:text-foreground hover:bg-surface-hover"
                            >
                                <Settings className="h-4 w-4" />
                                Kelola Aset
                            </Link>
                        )}

                        <div className="mx-2 h-6 w-px bg-border" />

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        <div className="mx-1 h-6 w-px bg-border" />

                        {status === "loading" ? (
                            <div className="h-9 w-24 animate-pulse rounded-lg bg-surface-hover" />
                        ) : session ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 rounded-lg bg-surface-hover px-3 py-1.5">
                                    <User className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium text-foreground">
                                        {session.user.nama}
                                    </span>
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                        {session.user.role}
                                    </span>
                                </div>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-950/30"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
                            >
                                <LogIn className="h-4 w-4" />
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile: Theme Toggle + Menu */}
                    <div className="md:hidden flex items-center gap-1">
                        <ThemeToggle />
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="rounded-lg p-2 text-muted hover:bg-surface-hover"
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border bg-surface/95 backdrop-blur-md">
                    <div className="space-y-1 px-4 py-3">
                        <Link
                            href="/"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:text-foreground hover:bg-surface-hover"
                        >
                            <Package className="h-4 w-4" />
                            Katalog
                        </Link>
                        <Link
                            href="/dashboard"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:text-foreground hover:bg-surface-hover"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Link>
                        {session?.user?.role && ["LABORAN", "KEPALA_LAB"].includes(session.user.role) && (
                            <Link
                                href="/dashboard/manage-assets"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:text-foreground hover:bg-surface-hover"
                            >
                                <Settings className="h-4 w-4" />
                                Kelola Aset
                            </Link>
                        )}

                        <div className="my-2 h-px bg-border" />

                        {session ? (
                            <>
                                <div className="flex items-center gap-2 rounded-lg bg-surface-hover px-3 py-2.5">
                                    <User className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium text-foreground">{session.user.nama}</span>
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                        {session.user.role}
                                    </span>
                                </div>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-950/30"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-3 py-2.5 text-sm font-semibold text-white"
                            >
                                <LogIn className="h-4 w-4" />
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
