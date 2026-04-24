import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getProcessedTopics, fetchTopicDetail } from "@/lib/github";
import { Topic, TopicDetail } from "@/lib/types";

/**
 * Hook to manage wiki data, filtering, and detail fetching.
 */
export function useWiki() {
    const [searchParams] = useSearchParams();
    
    // Data State
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<TopicDetail | Topic | null>(null);
    
    // UI/Filter State
    const [topicFilter, setTopicFilter] = useState("");
    const [hiddenDiffs, setHiddenDiffs] = useState<Set<string>>(new Set());
    
    // Status State
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Derived State
    const currentTrack = searchParams.get("track") || "React";

    // --- EFFECTS ---

    // Load initial list
    useEffect(() => {
        const load = async () => {
            try {
                const processed = await getProcessedTopics();
                setTopics(processed);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    // Sync sub-filter with track
    useEffect(() => {
        const defaultFilter = currentTrack === "Fundamentals" 
            ? "All Basic Concepts" 
            : (currentTrack === "React" ? "All React" : "All JavaScript");
            
        setTopicFilter(searchParams.get("topic") || defaultFilter);
    }, [searchParams, currentTrack]);

    // Fetch full detail when selected
    useEffect(() => {
        if (selectedTopic && !('content' in selectedTopic)) {
            const loadDetails = async () => {
                setFetchError(null);
                const full = await fetchTopicDetail(selectedTopic.slug);
                if (full) setSelectedTopic(full);
                else setFetchError("Failed to load content from GitHub.");
            };
            loadDetails();
        }
    }, [selectedTopic?.slug]);

    // --- COMPUTED ---

    const filtered = useMemo(() => {
        // 1. Filter by Track
        const byTrack = topics.filter(t => {
            if (currentTrack === "Fundamentals") return t.category === "Basic Concepts";
            if (currentTrack === "React") return t.category === "React";
            return t.category === "JavaScript";
        });

        // 2. Filter by Topic/Category
        const isAll = topicFilter.startsWith("All ");
        const byTopic = isAll 
            ? byTrack 
            : byTrack.filter(t => t.category.toLowerCase() === topicFilter.toLowerCase());

        // 3. Filter by Difficulty
        return byTopic.filter(t => !hiddenDiffs.has(t.difficulty));
    }, [topics, currentTrack, topicFilter, hiddenDiffs]);

    // --- ACTIONS ---

    const toggleDiff = (diff: string) => {
        setHiddenDiffs(prev => {
            const next = new Set(prev);
            if (next.has(diff)) next.delete(diff);
            else next.add(diff);
            return next;
        });
    };

    return {
        topics,
        filtered,
        selectedTopic,
        setSelectedTopic,
        topicFilter,
        currentTrack,
        hiddenDiffs,
        toggleDiff,
        isLoading,
        fetchError
    };
}
