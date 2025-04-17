"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  History,
  Loader2,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { getSuggestions, saveSearchQuery } from "@/app/actions/searchActions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useClickOutside, useDebounce, useSearchHistory } from "@/lib/hook";

interface SearchInputProps {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function SearchInput({
  className = "",
  placeholder = "Tìm kiếm sản phẩm...",
  onClose,
  isMobile = false,
}: SearchInputProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { searchHistory, addToHistory, clearHistory } = useSearchHistory(5);
  const inputRef = useRef<HTMLInputElement>(null);

  // Track if the mouse is inside the suggestions box
  const [isMouseInSuggestions, setIsMouseInSuggestions] = useState(false);

  // Use custom hook to handle clicks outside
  const searchRef = useClickOutside<HTMLDivElement>(() => {
    if (!isMouseInSuggestions) {
      setShowSuggestions(false);
    }
  });

  // Animation states
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Fetch suggestions when search term changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchTerm.trim().length === 0) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await getSuggestions(debouncedSearchTerm);
        setSuggestions(results);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  // Add keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close suggestions on Escape
      if (e.key === "Escape" && showSuggestions) {
        setShowSuggestions(false);
        e.preventDefault();
      }

      // Navigate through suggestions with arrow keys
      if (showSuggestions && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        // Implement suggestion navigation if needed
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSuggestions]);

  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (searchTerm.trim().length > 0) {
      // Add to search history
      addToHistory(searchTerm.trim());

      // Save query for analytics (optional)
      saveSearchQuery(searchTerm.trim());

      // Navigate to search results page
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);

      if (onClose) {
        onClose();
      }
    }
  };

  // Clear search term
  const clearSearch = () => {
    setSearchTerm("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Use a history item as search term
  const useHistoryItem = (term: string) => {
    setSearchTerm(term);
    setShowSuggestions(true);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div
          className={`absolute inset-y-0 left-0 flex items-center pl-3 transition-all duration-300 ${
            isInputFocused ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {/* <Search className="h-4 w-4" /> */}
        </div>

        <Input
          ref={inputRef}
          type="search"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value.trim().length > 0) {
              setShowSuggestions(true);
            }
          }}
          onFocus={() => {
            setShowSuggestions(true);
            setIsInputFocused(true);
          }}
          onBlur={() => setIsInputFocused(false)}
          placeholder={placeholder}
          className={`pl-10 pr-9 ${
            isMobile
              ? "w-full rounded-full"
              : "h-10 rounded-full border-muted shadow-sm"
          } transition-all duration-300 ${
            isInputFocused ? "border-primary ring-1 ring-primary/20" : ""
          }`}
          aria-label="Tìm kiếm sản phẩm"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-9 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Xóa từ khóa tìm kiếm"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="submit"
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
            isLoading
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
          } transition-colors`}
          aria-label="Tìm kiếm"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </button>
      </form>

      {/* Suggestions dropdown with enhanced styling */}
      {showSuggestions && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto overflow-x-hidden"
          onMouseEnter={() => setIsMouseInSuggestions(true)}
          onMouseLeave={() => setIsMouseInSuggestions(false)}
          style={{
            animation: "fadeInDown 0.2s ease-out",
          }}
        >
          {/* Search history */}
          {searchTerm.trim().length === 0 && searchHistory.length > 0 && (
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center">
                  <History className="h-3.5 w-3.5 mr-1" />
                  Tìm kiếm gần đây
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="h-6 px-2 text-xs hover:text-primary text-muted-foreground"
                >
                  Xóa tất cả
                </Button>
              </div>
              <ul className="space-y-1">
                {searchHistory.map((term, index) => (
                  <li key={`history-${index}`}>
                    <button
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                      onClick={() => useHistoryItem(term)}
                    >
                      <History className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <span className="truncate">{term}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Search suggestions and results */}
          {searchTerm.trim().length > 0 && (
            <>
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Đang tìm kiếm "{searchTerm}"...
                  </p>
                </div>
              ) : suggestions.length > 0 ? (
                <ul>
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion.id}
                      className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <Link
                        href={`/product/${suggestion.slug}`}
                        className="flex items-center p-3"
                        onClick={() => {
                          addToHistory(searchTerm);
                          setShowSuggestions(false);
                          if (onClose) onClose();
                        }}
                      >
                        {suggestion.image && (
                          <div className="w-12 h-12 relative flex-shrink-0 mr-3 bg-muted rounded-md overflow-hidden border transition-all duration-300 group-hover:border-primary">
                            <Image
                              src={suggestion.image.url}
                              alt={suggestion.image.alt || suggestion.name}
                              fill
                              sizes="48px"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        )}
                        <div className="flex-grow">
                          <p className="text-sm font-medium line-clamp-1">
                            {suggestion.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-medium text-primary">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(suggestion.price)}
                            </p>
                            {suggestion.isNew && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-primary/10 text-primary border-primary/30 px-1.5 py-0"
                              >
                                Mới
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                  <li className="p-3 bg-gray-50">
                    <button
                      onClick={handleSearch}
                      className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium py-2 flex items-center justify-center"
                    >
                      <Search className="h-3.5 w-3.5 mr-2" />
                      Xem tất cả kết quả cho "{searchTerm}"
                    </button>
                  </li>
                </ul>
              ) : (
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                    <X className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Không tìm thấy sản phẩm cho "{searchTerm}"
                  </p>
                  <button
                    onClick={handleSearch}
                    className="text-sm text-primary hover:text-primary/80 font-medium px-4 py-2 border border-primary/20 rounded-full hover:bg-primary/5 transition-colors"
                  >
                    Tìm kiếm tất cả sản phẩm
                  </button>
                </div>
              )}
            </>
          )}

          {/* Popular searches */}
          {searchTerm.trim().length === 0 && (
            <div className="p-3">
              <p className="text-xs font-medium text-muted-foreground flex items-center mb-2">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                Tìm kiếm phổ biến
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Áo thun",
                  "Đầm dự tiệc",
                  "Sneakers",
                  "Túi xách",
                  "Khuyến mãi",
                ].map((term) => (
                  <button
                    key={term}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-xs font-medium"
                    onClick={() => useHistoryItem(term)}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search keyboard shortcut hint */}
      {!isMobile && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center justify-center opacity-70">
                <span className="sr-only">Press / to search</span>
                <kbd className="hidden xs:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:text-xs">
                  /
                </kbd>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Nhấn / để tìm kiếm</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
