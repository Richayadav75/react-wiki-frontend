import { useState, useEffect } from "react";

/**
 * Hook to manage user progress in local storage.
 * Tracks which topics have been read/solved.
 */
export function useProgress() {
    const [solvedSlugs, setSolvedSlugs] = useState<Set<string>>(new Set());

    // Load progress on mount
    useEffect(() => {
        const saved = localStorage.getItem("wiki_progress");
        if (saved) {
            try {
                setSolvedSlugs(new Set(JSON.parse(saved)));
            } catch (e) {
                console.error("Failed to parse progress", e);
            }
        }
    }, []);

    // Mark a topic as read
    const markAsRead = (slug: string) => {
        setSolvedSlugs(prev => {
            const next = new Set(prev);
            next.add(slug);
            localStorage.setItem("wiki_progress", JSON.stringify(Array.from(next)));
            return next;
        });
    };

    return { solvedSlugs, markAsRead };
}
