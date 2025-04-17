"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PromotionBanner() {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Thiết lập ngày kết thúc khuyến mãi (ví dụ: 7 ngày từ now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const updateCountdown = () => {
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference <= 0) {
        // Khuyến mãi đã kết thúc
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    // Cập nhật đếm ngược mỗi giây
    const timer = setInterval(updateCountdown, 1000);
    updateCountdown(); // Gọi một lần đầu tiên

    return () => clearInterval(timer);
  }, []);

  const CountdownItem = ({
    value,
    label,
  }: {
    value: number;
    label: string;
  }) => (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg text-primary text-2xl font-bold">
        {value.toString().padStart(2, "0")}
      </div>
      <span className="text-white text-sm mt-1">{label}</span>
    </div>
  );

  return (
    <section className="py-10 bg-gradient-to-r from-primary via-primary-600 to-primary-700 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
              Ưu đãi đặc biệt
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Giảm giá lên đến 50% cho toàn bộ sản phẩm
            </h2>
            <p className="text-lg text-white/90 mb-6">
              Đừng bỏ lỡ cơ hội sở hữu những sản phẩm chất lượng với giá ưu đãi
              nhất. Chương trình có hạn, nhanh tay đặt hàng ngay hôm nay!
            </p>
            <Button
              asChild
              className="bg-white text-primary hover:bg-white/90"
              size="lg"
            >
              <Link href="/product?filter=sale">Mua ngay</Link>
            </Button>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-6">Ưu đãi kết thúc sau:</h3>
            <div className="flex gap-4">
              <CountdownItem value={countdown.days} label="Ngày" />
              <CountdownItem value={countdown.hours} label="Giờ" />
              <CountdownItem value={countdown.minutes} label="Phút" />
              <CountdownItem value={countdown.seconds} label="Giây" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
