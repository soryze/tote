
import React, { useState } from 'react';
import { Order, Role } from '../types';
import { calculateOrderTotals, formatVND } from '../utils';

interface Props {
  orders: Order[];
  role: Role;
  onDelete: (id: string) => void;
  onEdit: (order: Order) => void;
  onClone: (order: Order) => void;
}

const OrderHistory: React.FC<Props> = ({ orders, role, onDelete, onEdit, onClone }) => {
  const [search, setSearch] = useState('');

  const filtered = orders.filter(o => 
    o.customerName.toLowerCase().includes(search.toLowerCase()) || 
    o.orderNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Lịch sử & Nhân bản đơn</h2>
        <div className="relative w-full md:w-64">
           <input 
              type="text" 
              placeholder="Tìm khách hàng, số đơn..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
           />
           <span className="absolute left-3 top-2.5">🔍</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">Ngày / Số đơn</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4 text-right">Doanh thu</th>
                {role === 'OWNER' && <th className="px-6 py-4 text-right">Lợi nhuận</th>}
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(order => {
                const totals = calculateOrderTotals(order);
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{order.orderNumber || 'Chưa có mã'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600">
                      {formatVND(totals.totalCustomerPays)} đ
                    </td>
                    {role === 'OWNER' && (
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">
                        {formatVND(totals.profit)} đ
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => onEdit(order)} className="p-2 text-slate-400 hover:text-blue-600 transition" title="Mở lại">📂</button>
                        <button onClick={() => onClone(order)} className="p-2 text-slate-400 hover:text-emerald-600 transition" title="Nhân bản">👥</button>
                        {role === 'OWNER' && (
                          <button onClick={() => onDelete(order.id)} className="p-2 text-slate-400 hover:text-red-600 transition" title="Xóa">🗑️</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={role === 'OWNER' ? 5 : 4} className="px-6 py-20 text-center text-slate-400">
                     <p className="text-2xl mb-2">👻</p>
                     <p>Không tìm thấy kết quả phù hợp</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
