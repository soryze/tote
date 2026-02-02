
import React from 'react';
import { Order, Purchase } from '../types';
import { calculateOrderTotals, formatVND } from '../utils';

interface Props {
  orders: Order[];
  purchases: Purchase[];
}

const Statistics: React.FC<Props> = ({ orders, purchases }) => {
  // Aggregate data by Month
  const monthlyStats = orders.reduce((acc: any, order) => {
    const date = new Date(order.createdAt);
    const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
    const totals = calculateOrderTotals(order);
    
    if (!acc[monthKey]) acc[monthKey] = { revenue: 0, profit: 0, count: 0 };
    acc[monthKey].revenue += totals.afterDiscount;
    acc[monthKey].profit += totals.profit;
    acc[monthKey].count += 1;
    return acc;
  }, {});

  // Top 5 Customers
  const customerStats = orders.reduce((acc: any, order) => {
    if (!acc[order.customerName]) acc[order.customerName] = 0;
    acc[order.customerName] += calculateOrderTotals(order).afterDiscount;
    return acc;
  }, {});
  const topCustomers = Object.entries(customerStats)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5);

  // Supplier totals
  const supplierTotals = purchases.reduce((acc: any, p) => {
    if (!acc[p.supplierId]) acc[p.supplierId] = 0;
    acc[p.supplierId] += p.total;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Báo cáo & Phân tích</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">📅 Hiệu quả theo tháng</h3>
          <div className="space-y-4">
            {Object.entries(monthlyStats).map(([month, data]: [string, any]) => (
              <div key={month} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                <div>
                  <p className="font-bold text-slate-800">{month}</p>
                  <p className="text-xs text-slate-400">{data.count} đơn hàng</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">{formatVND(data.revenue)} đ</p>
                  <p className="text-xs font-bold text-emerald-600">Lãi: {formatVND(data.profit)} đ</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">🏆 Top 5 Khách hàng</h3>
          <div className="space-y-4">
            {topCustomers.map(([name, total]: [string, any], idx) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full">{idx + 1}</span>
                <p className="flex-1 font-medium text-slate-700">{name}</p>
                <p className="font-bold text-slate-900">{formatVND(total)} đ</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
          <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">🚚 Nhập hàng từ đối tác</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(supplierTotals).map(([name, total]: [string, any]) => (
              <div key={name} className="bg-slate-50 p-4 rounded-xl text-center">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">{name}</p>
                <p className="text-lg font-bold text-slate-800">{formatVND(total)} <span className="text-[10px]">đ</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
