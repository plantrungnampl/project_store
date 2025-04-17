"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Component that enables keyboard shortcuts for search
 * Press '/' to focus the search input
 */
export default function SearchKeyboardShortcut() {
  const router = useRouter();
  const triggered = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if already in an input, textarea, or contentEditable element
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Trigger search on '/' key
      if (e.key === "/" && !triggered.current) {
        e.preventDefault();

        // Find search input
        const searchInput = document.querySelector(
          'input[type="search"]'
        ) as HTMLInputElement;

        if (searchInput) {
          // Focus the search input if it exists on the page
          searchInput.focus();
        } else {
          // Redirect to search page if search input is not available
          router.push("/search");
        }

        // Prevent multiple triggers
        triggered.current = true;
        setTimeout(() => {
          triggered.current = false;
        }, 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  // This component doesn't render anything
  return null;
}
