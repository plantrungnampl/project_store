import { useState, useEffect, useRef } from "react";

/**
 * Custom hook that returns a debounced version of the provided value
 * Useful for preventing too many API calls during typing
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook that detects clicks outside of the specified element
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback]);

  return ref;
}

/**
 * Custom hook for managing local search history
 */
export function useSearchHistory(limit: number = 5) {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const storedHistory = localStorage.getItem("searchHistory");
    if (storedHistory) {
      try {
        setSearchHistory(JSON.parse(storedHistory));
      } catch (error) {
        console.error("Failed to parse search history:", error);
        setSearchHistory([]);
      }
    }
  }, []);

  // Add a search term to history
  const addToHistory = (term: string) => {
    if (!term.trim()) return;

    setSearchHistory((prev) => {
      // Create a new array without the current term (if it exists)
      const filtered = prev.filter((item) => item !== term);

      // Add the term to the beginning of the array
      const updated = [term, ...filtered].slice(0, limit);

      // Save to localStorage
      localStorage.setItem("searchHistory", JSON.stringify(updated));

      return updated;
    });
  };

  // Clear search history
  const clearHistory = () => {
    localStorage.removeItem("searchHistory");
    setSearchHistory([]);
  };

  return { searchHistory, addToHistory, clearHistory };
}
