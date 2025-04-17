"use client";

import { useEffect, useState } from "react";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "@/context/ThemeContext";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PerformanceChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Mock data - in a real application this would come from an API
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  
  const [chartData, setChartData] = useState({
    labels,
    datasets: [
      {
        label: "Revenue",
        data: [3500000, 4200000, 3800000, 5100000, 4800000, 6200000, 5900000],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Orders",
        data: [45, 52, 49, 60, 55, 68, 62],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        yAxisID: "y1",
        fill: false,
        tension: 0.3,
      },
    ],
  });

  const [options, setOptions] = useState({
    responsive: true,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Revenue (VND)",
          color: isDark ? "#cbd5e1" : "#64748b",
        },
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: isDark ? "#cbd5e1" : "#64748b",
          callback: function(value: number) {
            if (value >= 1000000) {
              return value / 1000000 + "M";
            }
            return value;
          }
        }
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Orders",
          color: isDark ? "#cbd5e1" : "#64748b",
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: isDark ? "#cbd5e1" : "#64748b",
        }
      },
      x: {
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: isDark ? "#cbd5e1" : "#64748b",
        }
      }
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: isDark ? "#f8fafc" : "#334155",
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.datasetIndex === 0) {
              label += new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            } else {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },
  });

  // Update chart options when theme changes
  useEffect(() => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      scales: {
        ...prevOptions.scales,
        y: {
          ...prevOptions.scales.y,
          title: {
            ...prevOptions.scales.y.title,
            color: isDark ? "#cbd5e1" : "#64748b",
          },
          grid: {
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            ...prevOptions.scales.y.ticks,
            color: isDark ? "#cbd5e1" : "#64748b",
          }
        },
        y1: {
          ...prevOptions.scales.y1,
          title: {
            ...prevOptions.scales.y1.title,
            color: isDark ? "#cbd5e1" : "#64748b",
          },
          ticks: {
            ...prevOptions.scales.y1.ticks,
            color: isDark ? "#cbd5e1" : "#64748b",
          }
        },
        x: {
          ...prevOptions.scales.x,
          grid: {
            color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            ...prevOptions.scales.x.ticks,
            color: isDark ? "#cbd5e1" : "#64748b",
          }
        }
      },
      plugins: {
        ...prevOptions.plugins,
        legend: {
          ...prevOptions.plugins.legend,
          labels: {
            ...prevOptions.plugins.legend.labels,
            color: isDark ? "#f8fafc" : "#334155",
          }
        }
      }
    }));
  }, [isDark]);

  return (
    <div>
      <Line data={chartData} options={options} />
    </div>
  );
}
