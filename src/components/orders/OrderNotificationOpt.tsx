'use client'

import { useState, useEffect } from "react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface OrderNotificationOptProps {
  orderNumber: string;
  className?: string;
}

type NotificationPermission = 'default' | 'denied' | 'granted';

export default function OrderNotificationOpt({ orderNumber, className }: OrderNotificationOptProps) {
  // Sử dụng localStorage để lưu trạng thái thông báo giữa các lần truy cập
  const [enabled, setEnabled] = useLocalStorage<boolean>(`notification_${orderNumber}`, false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  
  // Kiểm tra quyền thông báo khi component mount và cập nhật khi trạng thái thay đổi
  useEffect(() => {
    const checkNotificationPermission = async () => {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        return;
      }
      
      const currentPermission = Notification.permission as NotificationPermission;
      setPermissionState(currentPermission);
      
      if (currentPermission === "denied" && enabled) {
        // Nếu quyền bị từ chối nhưng trạng thái vẫn là bật, cập nhật lại trạng thái
        setEnabled(false);
        toast.error("Thông báo đã bị vô hiệu hóa", {
          description: "Trình duyệt của bạn đã chặn quyền thông báo"
        });
      }
    };
    
    checkNotificationPermission();
    
    // Đăng ký event listener cho thay đổi quyền thông báo (nếu trình duyệt hỗ trợ)
    if (typeof window !== 'undefined' && 'Notification' in window && window.navigator.permissions) {
      try {
        navigator.permissions.query({ name: 'notifications' }).then(permissionStatus => {
          permissionStatus.onchange = () => {
            checkNotificationPermission();
          };
        });
      } catch (error) {
        console.error("Không thể theo dõi thay đổi quyền thông báo:", error);
      }
    }
  }, [enabled, setEnabled]);
  
  const handleToggleNotifications = async (checked: boolean) => {
    setIsLoading(true);
    
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (checked && Notification.permission !== 'granted') {
          // Yêu cầu quyền thông báo nếu chưa được cấp
          const permission = await Notification.requestPermission();
          setPermissionState(permission as NotificationPermission);
          
          if (permission !== 'granted') {
            toast.error("Không thể đăng ký thông báo", {
              description: "Vui lòng vào cài đặt trình duyệt để cấp quyền thông báo"
            });
            setEnabled(false);
            setIsLoading(false);
            return;
          }
        }
      } else if (checked) {
        // Trình duyệt không hỗ trợ thông báo
        toast.error("Trình duyệt không hỗ trợ thông báo", {
          description: "Vui lòng sử dụng trình duyệt hiện đại hơn"
        });
        setEnabled(false);
        setIsLoading(false);
        return;
      }
      
      // Mô phỏng API call để đăng ký/hủy thông báo (thay thế bằng API thực tế)
      try {
        // Giả lập gọi API để đăng ký hoặc hủy thông báo
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
        
        // Nếu đăng ký thành công, hiển thị thông báo kiểm tra
        if (checked && Notification.permission === 'granted') {
          // Hiển thị thông báo kiểm tra
          const testNotification = new Notification("Kiểm tra thông báo", {
            body: "Bạn sẽ nhận được thông báo khi đơn hàng có cập nhật mới",
            icon: "/favicon.ico"
          });
          
          // Tự động đóng thông báo sau 3 giây
          setTimeout(() => testNotification.close(), 3000);
        }
        
        setEnabled(checked);
        
        if (checked) {
          toast.success("Đăng ký thông báo thành công", {
            description: "Bạn sẽ nhận được thông báo khi đơn hàng có cập nhật mới"
          });
        } else {
          toast.success("Đã hủy đăng ký thông báo", {
            description: "Bạn sẽ không nhận thông báo về đơn hàng này nữa"
          });
        }
      } catch (apiError) {
        console.error("Lỗi khi gọi API thông báo:", apiError);
        toast.error("Không thể kết nối đến dịch vụ thông báo", {
          description: "Vui lòng thử lại sau"
        });
        throw apiError;
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái thông báo:", error);
      toast.error("Không thể thay đổi trạng thái thông báo", {
        description: "Đã xảy ra lỗi, vui lòng thử lại sau"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Nếu không thể sử dụng thông báo trên thiết bị này, hiển thị thông báo khác
  if (typeof window !== 'undefined' && (!('Notification' in window) || permissionState === 'denied')) {
    return (
      <div className={cn("bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8", className)}>
        <div className="flex items-center gap-3">
          <BellOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {permissionState === 'denied'
                ? "Không thể gửi thông báo"
                : "Thiết bị không hỗ trợ thông báo"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {permissionState === 'denied'
                ? "Bạn đã chặn thông báo. Vui lòng vào cài đặt trình duyệt để cấp quyền thông báo."
                : "Trình duyệt của bạn không hỗ trợ thông báo."}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("bg-gray-50 dark:bg-gray-800 rounded-lg p-4 md:p-6 mb-8 transition-all", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          {enabled ? (
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          )}
          <div>
            <Label htmlFor={`notifications-${orderNumber}`} className="font-medium text-gray-900 dark:text-gray-100">
              {enabled ? "Đã đăng ký nhận thông báo" : "Nhận thông báo về đơn hàng"}
            </Label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {enabled 
                ? "Bạn sẽ nhận được thông báo khi đơn hàng được xác nhận, vận chuyển và giao hàng" 
                : "Đăng ký để nhận thông báo khi trạng thái đơn hàng thay đổi"}
            </p>
          </div>
        </div>
        <Switch
          id={`notifications-${orderNumber}`}
          checked={enabled}
          onCheckedChange={handleToggleNotifications}
          disabled={isLoading}
          className="data-[state=checked]:bg-blue-600 flex-shrink-0"
        />
      </div>
    </div>
  );
}