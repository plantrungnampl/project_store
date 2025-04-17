import { Package, Clock, TruckIcon, CheckCircle } from "lucide-react";

interface OrderStatusStepperProps {
  currentStatus: string;
}

// Status order for the stepper
const statusOrder = [
  { key: "PENDING", label: "Đã đặt hàng", icon: Clock },
  { key: "PROCESSING", label: "Đang xử lý", icon: Package },
  { key: "SHIPPED", label: "Đang giao hàng", icon: TruckIcon },
  { key: "DELIVERED", label: "Đã giao hàng", icon: CheckCircle },
];

export default function OrderStatusStepper({
  currentStatus,
}: OrderStatusStepperProps) {
  // Find the index of the current status
  let currentIndex = statusOrder.findIndex(
    (status) => status.key === currentStatus
  );

  // If current status is not in our status order (e.g., CANCELED), show as pending
  if (currentIndex === -1) {
    currentIndex = 0;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between">
        {statusOrder.map((status, index) => {
          // Determine if this step is active, completed, or upcoming
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isUpcoming = index > currentIndex;

          // Icon component for this step
          const IconComponent = status.icon;

          return (
            <div
              key={status.key}
              className="flex flex-col items-center relative"
              style={{
                width:
                  index === 0
                    ? 0
                    : index === statusOrder.length - 1
                    ? 0
                    : "auto",
              }}
            >
              {/* Step circle */}
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center z-10 ${
                  isActive
                    ? "bg-primary text-white"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                <IconComponent className="h-5 w-5" />
              </div>

              {/* Step label */}
              <div className="mt-2 text-center">
                <p
                  className={`font-medium ${
                    isActive
                      ? "text-primary"
                      : isCompleted
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {status.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="relative mt-5">
        <div className="absolute top-0 h-1 w-full bg-gray-200"></div>
        <div
          className="absolute top-0 h-1 bg-primary transition-all duration-500"
          style={{
            width: `${Math.max(
              0,
              Math.min(100, (currentIndex / (statusOrder.length - 1)) * 100)
            )}%`,
          }}
        ></div>
      </div>
    </div>
  );
}
