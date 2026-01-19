"use client";

import { useEffect, useCallback, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/store";

const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minutes (600,000 ms)

export function SessionTimeout() {
    const { data: session } = useSession();
    const { isAuthenticated, logout } = useAuthStore();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleLogout = useCallback(() => {
        // Handle NextAuth
        if (session) {
            signOut({ callbackUrl: "/login" });
        }
        // Handle Custom Store (Dashboard)
        if (isAuthenticated) {
            logout();
            window.location.href = "/login";
        }
    }, [session, isAuthenticated, logout]);

    const resetTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (session || isAuthenticated) {
            timeoutRef.current = setTimeout(handleLogout, TIMEOUT_DURATION);
        }
    }, [handleLogout, session, isAuthenticated]);

    useEffect(() => {
        if (!session && !isAuthenticated) return;

        // Set initial timer
        resetTimer();

        // Events to track user activity
        const events = [
            "mousedown",
            "mousemove",
            "keydown",
            "scroll",
            "touchstart",
            "click",
        ];

        // Add event listeners
        events.forEach((event) => {
            window.addEventListener(event, resetTimer);
        });

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [session, isAuthenticated, resetTimer]);

    return null;
}

