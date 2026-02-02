
import { Order, OrderItem } from './types';

export const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const isPaper = (name: string): boolean => {
  return name.toLowerCase().includes('giấy');
};

export const calculateItemStats = (item: OrderItem) => {
  const isPaperType = isPaper(item.name);
  let area = 0;
  let revenue = 0;
  let cost = 0;

  if (isPaperType) {
    area = item.width * item.length * item.qty;
    revenue = area * item.sellPrice;
    cost = area * item.buyPrice;
  } else {
    revenue = item.qty * item.sellPrice;
    cost = item.qty * item.buyPrice;
  }

  return { area, revenue, cost };
};

export const calculateOrderTotals = (order: Order) => {
  let subtotal = 0;
  let totalCost = 0;

  order.items.forEach(item => {
    const { revenue, cost } = calculateItemStats(item);
    subtotal += revenue;
    totalCost += cost;
  });

  const afterDiscount = subtotal * (1 - order.discountPercent / 100);
  const profit = afterDiscount - totalCost;
  const profitPercent = afterDiscount > 0 ? (profit / afterDiscount) * 100 : 0;
  const totalCustomerPays = afterDiscount + order.shippingFee + order.cashOnDelivery;

  return {
    subtotal,
    afterDiscount,
    totalCost,
    profit,
    profitPercent,
    totalCustomerPays
  };
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
