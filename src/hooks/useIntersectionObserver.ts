import { useState, useEffect, useRef, RefObject } from 'react';

interface IntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

/**
 * Custom hook để phát hiện khi một element xuất hiện trong viewport
 * Hữu ích cho lazy loading, infinite scrolling, và animation khi xuất hiện
 * 
 * @param options Cấu hình cho Intersection Observer
 * @param freezeOnceVisible Nếu true, sẽ ngừng theo dõi sau khi element đã hiển thị
 * @returns [ref, isVisible, entry]
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false,
}: IntersectionObserverOptions = {}): [RefObject<T>, boolean, IntersectionObserverEntry | null] {
  const ref = useRef<T>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  
  const frozen = entry?.isIntersecting && freezeOnceVisible;
  const isVisible = !!entry?.isIntersecting;

  useEffect(() => {
    const node = ref.current;
    if (!node || frozen) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
      },
      { threshold, root, rootMargin }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, frozen]);

  return [ref, isVisible, entry];
}

/**
 * Custom hook để lazy load hình ảnh
 * 
 * @param src URL của hình ảnh
 * @param options Cấu hình cho Intersection Observer
 * @returns [ref, isVisible, imageSrc]
 */
export function useLazyImage(
  src: string,
  options: IntersectionObserverOptions = {}
): [RefObject<HTMLImageElement>, boolean, string] {
  const [ref, isVisible] = useIntersectionObserver<HTMLImageElement>({
    ...options,
    freezeOnceVisible: true,
  });
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    if (isVisible && src) {
      setImageSrc(src);
    }
  }, [isVisible, src]);

  return [ref, isVisible, imageSrc];
}

export default useIntersectionObserver;
