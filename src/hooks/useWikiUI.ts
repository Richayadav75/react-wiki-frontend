import { useState, useEffect } from "react";
import { Topic } from "@/lib/types";

/**
 * Hook to manage the Wiki UI state (Panel, Focus Mode, Selection).
 */
export function useWikiUI(
    markAsRead: (slug: string) => void,
    selectedTopic: any,
    setSelectedTopic: (topic: any) => void
) {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-close focus mode when the panel is closed
    useEffect(() => {
        if (!isPanelOpen) setIsExpanded(false);
    }, [isPanelOpen]);

    /**
     * Handles selecting a topic from the list
     */
    const handleSelect = (topic: any) => {
        setSelectedTopic(topic);
        setIsPanelOpen(true);
        markAsRead(topic.slug);
    };

    /**
     * Closes the detail panel
     */
    const closePanel = () => {
        setIsPanelOpen(false);
        setSelectedTopic(null);
    };

    /**
     * Toggles full-screen focus mode
     */
    const toggleExpand = () => setIsExpanded(prev => !prev);

    return {
        selectedTopic,
        setSelectedTopic,
        isPanelOpen,
        isExpanded,
        handleSelect,
        closePanel,
        toggleExpand
    };
}
