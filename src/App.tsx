import { Suspense } from "react";
import AppContent from "@/components/AppContent";

/**
 * Main App Entry Point
 * Only responsible for global wrappers and Suspense boundaries.
 */
export default function App() {
    return (
        <Suspense fallback={<div className="wiki-app__loading-overlay">Loading Application...</div>}>
            <AppContent />
        </Suspense>
    );
}
