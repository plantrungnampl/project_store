'use client'

import { Order, StatusUpdate } from "@/types/index";
import { CheckCircle, Clock, Package, Truck, XCircle, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface OrderTrackingStatusProps {
  status: Order['status'];
  statusUpdates?: StatusUpdate[];
  className?: string;
  compact?: boolean; // Chế độ hiển thị compact cho các trang thể hiện nhiều đơn hàng
}

// Định nghĩa các bước trong quy trình đơn hàng
const orderSteps = [
  { 
    id: 'PENDING' as const, 
    label: 'Chờ xử lý', 
    icon: Clock,
    description: 'Đơn hàng của bạn đang chờ xử lý' 
  },
  { 
    id: 'PROCESSING' as const, 
    label: 'Đang xử lý', 
    icon: Clock,
    description: 'Đơn hàng đang được chuẩn bị' 
  },
  { 
    id: 'CONFIRMED' as const, 
    label: 'Đã xác nhận', 
    icon: CheckCircle,
    description: 'Đơn hàng đã được xác nhận' 
  },
  { 
    id: 'SHIPPED' as const, 
    label: 'Đang giao hàng', 
    icon: Truck,
    description: 'Đơn hàng đang được giao đến bạn' 
  },
  { 
    id: 'DELIVERED' as const, 
    label: 'Đã giao hàng', 
    icon: Package,
    description: 'Đơn hàng đã được giao thành công' 
  },
  { 
    id: 'COMPLETED' as const, 
    label: 'Hoàn thành', 
    icon: ShoppingBag,
    description: 'Đơn hàng đã hoàn thành' 
  }
];

// Helper function để lấy variant dựa trên trạng thái
const getStatusVariant = (status: Order['status']) => {
  if (status === 'DELIVERED' || status === 'COMPLETED') {
    return 'success';
  }
  if (status === 'CANCELED') {
    return 'destructive';
  }
  if (status === 'PENDING') {
    return 'secondary';
  }
  if (status === 'CONFIRMED') {
    return 'outline';
  }
  return 'default';
};

// Helper để lấy label cho status
const getStatusLabel = (status: Order['status']): string => {
  const step = orderSteps.find(step => step.id === status);
  if (step) return step.label;
  
  return status === 'CANCELED' ? 'Đã hủy' : 'Đang xử lý';
};

export default function OrderTrackingStatus({ 
  status, 
  statusUpdates = [], 
  className,
  compact = false 
}: OrderTrackingStatusProps) {
  // Nếu đơn hàng bị hủy, hiển thị trạng thái đặc biệt
  if (status === 'CANCELED') {
    return (
      <div className={cn("w-full py-4", className)}>
        <div className="flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <XCircle className="h-10 w-10 text-red-500 dark:text-red-400 mb-2" />
          <h3 className="text-md font-medium text-red-800 dark:text-red-300">Đơn hàng đã bị hủy</h3>
          {statusUpdates && statusUpdates.length > 0 && statusUpdates.find(update => update.status === 'CANCELED') && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {format(
                new Date(statusUpdates.find(update => update.status === 'CANCELED')!.createdAt), 
                'HH:mm - dd/MM/yyyy', 
                { locale: vi }
              )}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  // Tìm index của trạng thái hiện tại
  const currentStepIndex = orderSteps.findIndex(step => step.id === status);
  
  // Nếu status là COMPLETED thì giả định đã hoàn thành tất cả các bước
  const statusIndex = currentStepIndex > -1 
    ? currentStepIndex 
    : (status === 'COMPLETED' ? orderSteps.length - 1 : 0);
    
  // Khi compact=true, hiển thị chỉ trạng thái hiện tại với badge
  if (compact) {
    const currentStep = orderSteps[statusIndex] || orderSteps[0];
    const Icon = currentStep?.icon || Clock;
    return (
      <Badge variant={getStatusVariant(status)} className="gap-1">
        <Icon className="h-3 w-3" />
        <span>{getStatusLabel(status)}</span>
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("w-full py-6", className)}>
        <div className="flex flex-wrap md:flex-nowrap items-center">
          {orderSteps.map((step, index) => (
            <div key={step.id} className="relative flex flex-col items-center flex-1 mb-4 md:mb-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200",
                      index < statusIndex ? "bg-green-600 dark:bg-green-700" : 
                      index === statusIndex ? "bg-blue-600 dark:bg-blue-700" : 
                      "bg-gray-300 dark:bg-gray-700"
                    )}
                  >
                    <step.icon className={cn(
                      "w-5 h-5",
                      index <= statusIndex ? "text-white" : "text-gray-500 dark:text-gray-400"
                    )} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="text-sm">
                    <p className="font-medium">{step.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                    
                    {/* Hiển thị thời gian cập nhật trạng thái nếu có */}
                    {statusUpdates && statusUpdates.some(update => update.status === step.id) && (
                      <p className="text-xs mt-1">
                        {format(
                          new Date(statusUpdates.find(update => update.status === step.id)!.createdAt), 
                          'HH:mm - dd/MM/yyyy', 
                          { locale: vi }
                        )}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
              
              <div className="text-xs text-center mt-2 font-medium">
                {step.label}
              </div>
              
              {index < orderSteps.length - 1 && (
                <div className={cn(
                  "absolute top-5 left-1/2 w-full h-0.5 transition-colors duration-200 hidden md:block",
                  index < statusIndex ? "bg-green-600 dark:bg-green-700" : "bg-gray-300 dark:bg-gray-700"
                )} />
              )}
            </div>
          ))}
        </div>
        
        {/* Mobile-friendly timeline indicator */}
        <div className="mt-2 md:hidden">
          <div className="text-center">
            <Badge variant={getStatusVariant(status)} className="gap-1">
              <Clock className="h-3 w-3" />
              <span>Trạng thái: {getStatusLabel(status)}</span>
            </Badge>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}