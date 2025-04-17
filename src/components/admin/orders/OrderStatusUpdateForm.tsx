"use client";

import { useState } from "react";
import { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { CircleOff, Loader2 } from "lucide-react";

interface OrderStatusUpdateFormProps {
  orderId: string;
  currentStatus: OrderStatus;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function OrderStatusUpdateForm({
  orderId,
  currentStatus,
  onCancel,
  onSuccess,
}: OrderStatusUpdateFormProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // All possible order statuses
  const orderStatuses = [
    { value: "PENDING", label: "Pending" },
    { value: "PROCESSING", label: "Processing" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELED", label: "Canceled" },
    { value: "REFUNDED", label: "Refunded" },
    { value: "FAILED", label: "Failed" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status === currentStatus) {
      toast({
        title: "No changes detected",
        description: "Please select a different status or cancel.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          comment,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update order status");
      }
      
      toast({
        title: "Status updated",
        description: `Order status updated to ${status}`,
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Select
        value={status}
        onValueChange={(value) => setStatus(value as OrderStatus)}
        disabled={isSubmitting}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {orderStatuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Textarea
        placeholder="Add a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="h-10 min-h-0 py-2 w-60"
        disabled={isSubmitting}
      />
      
      <Button type="submit" disabled={isSubmitting || status === currentStatus}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update"
        )}
      </Button>
      
      <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
        <CircleOff className="mr-2 h-4 w-4" />
        Cancel
      </Button>
    </form>
  );
}
