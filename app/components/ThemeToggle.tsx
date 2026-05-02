"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const [dark, setDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check localStorage or system preference
        const stored = localStorage.getItem("theme");
        if (stored === "dark") {
            setDark(true);
            document.documentElement.classList.add("dark");
        } else if (stored === "light") {
            setDark(false);
            document.documentElement.classList.remove("dark");
        } else {
            // Follow system preference
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setDark(prefersDark);
            if (prefersDark) {
                document.documentElement.classList.add("dark");
            }
        }
    }, []);

    const toggle = () => {
        const newDark = !dark;
        setDark(newDark);
        if (newDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    if (!mounted) {
        return <div className="h-9 w-9 rounded-lg bg-surface-hover animate-pulse" />;
    }

    return (
        <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-all hover:bg-surface-hover hover:text-foreground"
            title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {dark ? (
                <Sun className="h-[18px] w-[18px]" />
            ) : (
                <Moon className="h-[18px] w-[18px]" />
            )}
        </button>
    );
}
