"use client";

import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: number; // Trend percentage, positive or negative
  color?: "blue" | "green" | "amber" | "red" | "purple" | "pink";
}

export default function DashboardCard({
  title,
  value,
  description,
  icon,
  trend,
  color = "blue",
}: DashboardCardProps) {
  // Map color variants
  const colorVariants = {
    blue: "bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400",
    amber: "bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400",
    red: "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400",
    purple: "bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400",
    pink: "bg-pink-50 text-pink-500 dark:bg-pink-900/20 dark:text-pink-400",
  };

  const isTrendPositive = trend && trend > 0;

  return (
    <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={cn("p-3 rounded-full", colorVariants[color])}>
          {icon}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        
        {trend != null && (
          <div 
            className={cn(
              "flex items-center text-sm font-medium",
              isTrendPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}
          >
            {isTrendPositive ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}
