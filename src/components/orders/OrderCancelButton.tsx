// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Loader2 } from "lucide-react";
// import { useRouter } from "next/navigation";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { cancelOrder } from "@/app/actions/orderActions";
// import { toast } from "sonner";

// interface OrderCancelButtonProps {
//   orderId: string;
// }

// export default function OrderCancelButton({ orderId }: OrderCancelButtonProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const router = useRouter();

//   const handleCancel = async () => {
//     setIsLoading(true);

//     try {
//       const result = await cancelOrder(orderId);

//       if (result.success) {
//         toast("Đơn hàng đã hủy", {
//           description: "Đơn hàng của bạn đã được hủy thành công",
//         });

//         // Close dialog and refresh page
//         setIsOpen(false);
//         router.refresh();
//       } else {
//         toast("Không thể hủy đơn hàng", {
//           description: result.error || "Đã có lỗi xảy ra khi hủy đơn hàng",
//         });
//       }
//     } catch (error) {
//       toast("Lỗi", {
//         description: "Đã có lỗi xảy ra khi hủy đơn hàng",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
//       <AlertDialogTrigger asChild>
//         <Button
//           variant="outline"
//           className="text-red-500 hover:text-red-700 hover:bg-red-50"
//         >
//           Hủy đơn hàng
//         </Button>
//       </AlertDialogTrigger>
//       <AlertDialogContent>
//         <AlertDialogHeader>
//           <AlertDialogTitle>
//             Bạn có chắc chắn muốn hủy đơn hàng?
//           </AlertDialogTitle>
//           <AlertDialogDescription>
//             Hành động này không thể hoàn tác. Đơn hàng sẽ bị hủy và bạn cần đặt
//             lại nếu muốn mua sản phẩm.
//           </AlertDialogDescription>
//         </AlertDialogHeader>
//         <AlertDialogFooter>
//           <AlertDialogCancel disabled={isLoading}>
//             Không, giữ đơn hàng
//           </AlertDialogCancel>
//           <AlertDialogAction
//             onClick={(e) => {
//               e.preventDefault();
//               handleCancel();
//             }}
//             className="bg-red-500 hover:bg-red-600 text-white"
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Đang hủy...
//               </>
//             ) : (
//               "Có, hủy đơn hàng"
//             )}
//           </AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// }
// src/components/orders/OrderCancelButton.tsx hiện có - cần xem lại và nâng cấp
import { useState } from "react";
import { Button } from "../ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog";
import { cancelOrder } from "@/app/actions/orderActions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface OrderCancelButtonProps {
  orderNumber: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

export default function OrderCancelButton({ 
  orderNumber, 
  onSuccess,
  disabled = false
}: OrderCancelButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      const { success, error } = await cancelOrder(orderNumber);
      
      if (success) {
        toast.success("Đơn hàng đã được hủy thành công");
        setIsOpen(false);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(error || "Không thể hủy đơn hàng. Vui lòng thử lại sau.");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
      >
        Hủy đơn hàng
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy đơn hàng #{orderNumber}? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Quay lại
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận hủy"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}