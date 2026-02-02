
import React from 'react';
import { Order, Role } from '../types';
import { calculateOrderTotals, formatVND } from '../utils';

interface Props {
  orders: Order[];
  role: Role;
  onNewOrder: () => void;
}

const Dashboard: React.FC<Props> = ({ orders, role, onNewOrder }) => {
  const stats = orders.reduce((acc, order) => {
    const totals = calculateOrderTotals(order);
    acc.revenue += totals.afterDiscount;
    acc.profit += totals.profit;
    return acc;
  }, { revenue: 0, profit: 0 });

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Bảng điều khiển</h2>
        <button 
          onClick={onNewOrder}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-sm font-semibold transition"
        >
          + Đơn hàng mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Doanh thu tổng</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{formatVND(stats.revenue)} <span className="text-sm font-normal text-slate-400">đ</span></p>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded font-bold">Lượng đơn: {orders.length}</span>
          </div>
        </div>

        {role === 'OWNER' && (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm font-medium">Lợi nhuận gộp</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{formatVND(stats.profit)} <span className="text-sm font-normal text-slate-400">đ</span></p>
              <div className="mt-4">
                 <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                 </div>
              </div>
            </div>

            <div className="bg-blue-600 p-6 rounded-xl shadow-sm text-white">
              <p className="text-blue-100 text-sm font-medium">Hiệu suất ròng</p>
              <p className="text-3xl font-bold mt-1">
                {stats.revenue > 0 ? ((stats.profit / stats.revenue) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-blue-100 text-xs mt-4">Dựa trên {orders.length} đơn hàng gần nhất</p>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Đơn hàng vừa lập</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-3">Khách hàng</th>
                <th className="px-6 py-3">Ngày</th>
                <th className="px-6 py-3">Kênh</th>
                <th className="px-6 py-3 text-right">Tổng thanh toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map(order => {
                const totals = calculateOrderTotals(order);
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-800">{order.customerName}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                        {order.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">{formatVND(totals.totalCustomerPays)} đ</td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">Chưa có đơn hàng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
