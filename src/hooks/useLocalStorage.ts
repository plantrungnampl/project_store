'use client';

import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Trạng thái để lưu trữ giá trị
  // Chuyển hàm initial state để hook chỉ chạy một lần
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Lấy từ local storage theo key
      const item = window.localStorage.getItem(key);
      // Phân tích cú pháp JSON lưu trữ hoặc trả về initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Nếu có lỗi cũng trả về giá trị ban đầu
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  // Trả về hàm setter được đồng bộ hóa với localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Cho phép giá trị là một hàm
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Lưu trạng thái
      setStoredValue(valueToStore);
      
      // Lưu vào localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Kích hoạt sự kiện storage để các component khác có thể lắng nghe sự thay đổi
        const event = new StorageEvent('storage', {
          key: key,
          newValue: JSON.stringify(valueToStore),
          storageArea: localStorage
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  // Lắng nghe các thay đổi trong các tab/cửa sổ khác
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (e) {
          console.error(`Error parsing localStorage change for key "${key}":`, e);
        }
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [key]);
  
  return [storedValue, setValue];
}

export { useLocalStorage };
