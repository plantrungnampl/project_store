// Định nghĩa type Address
export interface Address {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

// Định nghĩa type ProductImage
export interface ProductImage {
  url: string;
  alt?: string;
}

// Định nghĩa type ProductData
export interface ProductData {
  name: string;
  price: number;
  image?: ProductImage;
}

// Định nghĩa type OrderItem
export interface OrderItem {
  id: string;
  name: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productData?: ProductData;
}

// Định nghĩa type Order
export interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PROCESSING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELED';
  createdAt: string;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal?: number;
  grandTotal: number;
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  _count?: {
    items: number;
  };
}

// Định nghĩa type PaymentMethod
export type PaymentMethod = 'cod' | 'bank-transfer' | 'credit-card' | 'momo';

// Định nghĩa type StatusUpdate
export interface StatusUpdate {
  id: string;
  status: Order['status'];
  comment: string;
  createdAt: string;
}

// Định nghĩa OrderStatus map
export const OrderStatusLabels: Record<Order['status'], string> = {
  'PENDING': 'Chờ xử lý',
  'PROCESSING': 'Đang xử lý',
  'CONFIRMED': 'Đã xác nhận',
  'SHIPPED': 'Đang giao hàng',
  'DELIVERED': 'Đã giao hàng',
  'COMPLETED': 'Hoàn thành',
  'CANCELED': 'Đã hủy'
};