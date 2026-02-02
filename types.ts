
export type Role = 'OWNER' | 'STAFF';

export enum SaleChannel {
  ZALO = 'Zalo',
  FACEBOOK = 'Facebook',
  REFERRAL = 'Giới thiệu',
  RETURNING = 'Khách cũ',
  OTHER = 'Khác'
}

export interface OrderItem {
  id: string;
  name: string;
  width: number; // Q.cách (m)
  length: number; // C.dài (m)
  qty: number;
  unit: string;
  sellPrice: number;
  buyPrice: number;
  isPaper: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  note: string;
  channel: SaleChannel;
  createdAt: string;
  items: OrderItem[];
  shippingFee: number;
  cashOnDelivery: number; // Tiền xe / Thu hộ
  discountPercent: number;
  createdBy: string;
  status: 'DRAFT' | 'COMPLETED';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  note: string;
  channel: SaleChannel;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  category: string;
  note: string;
}

export interface Purchase {
  id: string;
  date: string;
  supplierId: string;
  productName: string;
  qty: number;
  buyPrice: number;
  total: number;
}
