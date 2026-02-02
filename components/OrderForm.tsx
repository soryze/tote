
import React, { useState, useEffect } from 'react';
import { Order, OrderItem, SaleChannel, Role, Customer } from '../types';
import { generateId, isPaper, calculateItemStats, calculateOrderTotals, formatVND } from '../utils';
import PrintPreview from './PrintPreview';

interface Props {
  onSave: (order: Order) => void;
  initialOrder: Order | null;
  role: Role;
  customers: Customer[];
}

const OrderForm: React.FC<Props> = ({ onSave, initialOrder, role, customers }) => {
  const [order, setOrder] = useState<Order>(initialOrder || {
    id: generateId(),
    orderNumber: '',
    customerName: '',
    phone: '',
    address: '',
    note: '',
    channel: SaleChannel.ZALO,
    createdAt: new Date().toISOString(),
    items: [],
    shippingFee: 0,
    cashOnDelivery: 0,
    discountPercent: 0,
    createdBy: 'Admin',
    status: 'DRAFT'
  });

  const [showPrint, setShowPrint] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    // Validation
    const newWarnings: string[] = [];
    order.items.forEach((item, idx) => {
      if (item.isPaper && (!item.width || !item.length)) {
        newWarnings.push(`Dòng ${idx + 1}: Giấy thiếu quy cách hoặc chiều dài`);
      }
      if (item.sellPrice < item.buyPrice) {
        newWarnings.push(`Dòng ${idx + 1}: Giá bán thấp hơn giá nhập!`);
      }
    });
    setWarnings(newWarnings);
  }, [order.items]);

  const handleAddItem = () => {
    const newItem: OrderItem = {
      id: generateId(),
      name: '',
      width: 0,
      length: 0,
      qty: 1,
      unit: 'Cái',
      sellPrice: 0,
      buyPrice: 0,
      isPaper: false
    };
    setOrder({ ...order, items: [...order.items, newItem] });
  };

  const updateItem = (id: string, updates: Partial<OrderItem>) => {
    const updatedItems = order.items.map(item => {
      if (item.id === id) {
        const newItem = { ...item, ...updates };
        newItem.isPaper = isPaper(newItem.name);
        if (newItem.isPaper) {
          newItem.unit = 'Cuộn';
        }
        return newItem;
      }
      return item;
    });
    setOrder({ ...order, items: updatedItems });
  };

  const removeItem = (id: string) => {
    setOrder({ ...order, items: order.items.filter(i => i.id !== id) });
  };

  const copyForZalo = () => {
    const totals = calculateOrderTotals(order);
    let text = `📦 BÁO GIÁ: ${order.customerName}\n`;
    text += `📅 Ngày: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}\n`;
    text += `--------------------------\n`;
    order.items.forEach(item => {
      const { area, revenue } = calculateItemStats(item);
      if (item.isPaper) {
        text += `- ${item.name}: ${area.toFixed(2)}m² x ${formatVND(item.sellPrice)} = ${formatVND(revenue)}đ\n`;
      } else {
        text += `- ${item.name}: ${item.qty} ${item.unit} x ${formatVND(item.sellPrice)} = ${formatVND(revenue)}đ\n`;
      }
    });
    text += `--------------------------\n`;
    if (order.discountPercent > 0) text += `Chiết khấu: ${order.discountPercent}%\n`;
    text += `Tổng hàng: ${formatVND(totals.afterDiscount)}đ\n`;
    if (order.shippingFee > 0) text += `Phí ship: ${formatVND(order.shippingFee)}đ\n`;
    if (order.cashOnDelivery > 0) text += `Tiền xe: ${formatVND(order.cashOnDelivery)}đ\n`;
    text += `👉 TỔNG CỘNG: ${formatVND(totals.totalCustomerPays)}đ\n`;
    
    navigator.clipboard.writeText(text);
    alert('Đã copy báo giá Zalo!');
  };

  const totals = calculateOrderTotals(order);

  if (showPrint) {
    return <PrintPreview order={order} onBack={() => setShowPrint(false)} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold text-slate-800">
          {initialOrder ? 'Chỉnh sửa đơn hàng' : 'Lên đơn hàng mới'}
        </h2>
        <div className="flex gap-3">
          <button 
            onClick={copyForZalo}
            className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-100 transition flex items-center gap-2"
          >
            <span>💬</span> Zalo
          </button>
          <button 
            disabled={order.items.some(i => calculateItemStats(i).revenue === 0)}
            onClick={() => setShowPrint(true)}
            className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50 transition flex items-center gap-2"
          >
            <span>🖨️</span> In A4
          </button>
          <button 
            onClick={() => onSave(order)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-md transition"
          >
            Lưu đơn hàng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* Info Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2">1. Thông tin khách hàng</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Khách hàng / Xưởng</label>
                <input 
                  list="customers-list"
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={order.customerName}
                  onChange={e => setOrder({ ...order, customerName: e.target.value })}
                  placeholder="Tên khách hàng"
                />
                <datalist id="customers-list">
                  {customers.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Số điện thoại</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={order.phone}
                  onChange={e => setOrder({ ...order, phone: e.target.value })}
                  placeholder="0xxx xxx xxx"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Địa chỉ & Ghi chú (Chành xe)</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={order.address}
                  onChange={e => setOrder({ ...order, address: e.target.value })}
                  placeholder="Địa chỉ giao hàng / Ghi chú"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Kênh bán</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={order.channel}
                  onChange={e => setOrder({ ...order, channel: e.target.value as SaleChannel })}
                >
                  {Object.values(SaleChannel).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Số đơn (Tùy chọn)</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={order.orderNumber}
                  onChange={e => setOrder({ ...order, orderNumber: e.target.value })}
                  placeholder="VD: INV001"
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 border-b pb-2 mb-4">2. Danh sách hàng hóa</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-bold text-slate-500 uppercase border-b">
                  <tr>
                    <th className="pb-2 px-2 min-w-[150px]">Tên hàng</th>
                    <th className="pb-2 px-2 w-20 text-center">Q.cách</th>
                    <th className="pb-2 px-2 w-20 text-center">C.dài</th>
                    <th className="pb-2 px-2 w-16 text-center">SL</th>
                    <th className="pb-2 px-2 w-20 text-center">m²</th>
                    <th className="pb-2 px-2 min-w-[120px]">Giá bán</th>
                    {role === 'OWNER' && <th className="pb-2 px-2 min-w-[120px]">Giá nhập</th>}
                    <th className="pb-2 px-2 text-right">Thành tiền</th>
                    <th className="pb-2 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => {
                    const stats = calculateItemStats(item);
                    return (
                      <tr key={item.id}>
                        <td className="py-2 px-2">
                          <input 
                            type="text" 
                            className="w-full px-2 py-1 border rounded"
                            value={item.name}
                            onChange={e => updateItem(item.id, { name: e.target.value })}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input 
                            type="number" 
                            disabled={!item.isPaper}
                            className={`w-full px-2 py-1 border rounded text-center ${!item.isPaper ? 'bg-slate-50 opacity-50' : item.width === 0 ? 'border-red-500 bg-red-50' : ''}`}
                            value={item.width || ''}
                            onChange={e => updateItem(item.id, { width: parseFloat(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input 
                            type="number" 
                            disabled={!item.isPaper}
                            className={`w-full px-2 py-1 border rounded text-center ${!item.isPaper ? 'bg-slate-50 opacity-50' : item.length === 0 ? 'border-red-500 bg-red-50' : ''}`}
                            value={item.length || ''}
                            onChange={e => updateItem(item.id, { length: parseFloat(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input 
                            type="number" 
                            className="w-full px-2 py-1 border rounded text-center"
                            value={item.qty || ''}
                            onChange={e => updateItem(item.id, { qty: parseInt(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <div className={`text-center font-bold text-xs ${!item.isPaper ? 'text-slate-200' : 'text-slate-600'}`}>
                            {item.isPaper ? stats.area.toFixed(2) : '-'}
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <input 
                            type="number" 
                            className={`w-full px-2 py-1 border rounded ${item.sellPrice < item.buyPrice ? 'border-amber-500 bg-amber-50' : ''}`}
                            value={item.sellPrice || ''}
                            onChange={e => updateItem(item.id, { sellPrice: parseFloat(e.target.value) || 0 })}
                          />
                        </td>
                        {role === 'OWNER' && (
                          <td className="py-2 px-2">
                            <input 
                              type="number" 
                              className="w-full px-2 py-1 border rounded"
                              value={item.buyPrice || ''}
                              onChange={e => updateItem(item.id, { buyPrice: parseFloat(e.target.value) || 0 })}
                            />
                          </td>
                        )}
                        <td className="py-2 px-2 text-right font-bold text-slate-800">
                          {formatVND(stats.revenue)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">✕</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <button 
                onClick={handleAddItem}
                className="mt-4 text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline"
              >
                <span>➕</span> Thêm mặt hàng
              </button>
            </div>
          </div>
          
          {warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <p className="text-amber-800 font-bold mb-2 flex items-center gap-2">
                <span>⚠️</span> Cảnh báo dữ liệu:
              </p>
              <ul className="text-sm text-amber-700 space-y-1">
                {warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Totals Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2">3. Tổng kết thanh toán</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-slate-500">
                <span>Tổng phụ</span>
                <span className="font-bold text-slate-800">{formatVND(totals.subtotal)} đ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Chiết khấu (%)</span>
                <input 
                  type="number" 
                  className="w-20 px-2 py-1 border rounded text-right"
                  value={order.discountPercent || ''}
                  onChange={e => setOrder({ ...order, discountPercent: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Phí ship (Chi phí)</span>
                <input 
                  type="number" 
                  className="w-24 px-2 py-1 border rounded text-right"
                  value={order.shippingFee || ''}
                  onChange={e => setOrder({ ...order, shippingFee: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Tiền xe (Thu hộ)</span>
                <input 
                  type="number" 
                  className="w-24 px-2 py-1 border rounded text-right"
                  value={order.cashOnDelivery || ''}
                  onChange={e => setOrder({ ...order, cashOnDelivery: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="pt-3 border-t-2 border-slate-100 flex justify-between items-end">
                <span className="text-lg font-bold text-slate-800 uppercase">Khách trả</span>
                <span className="text-2xl font-black text-blue-600">{formatVND(totals.totalCustomerPays)} đ</span>
              </div>
            </div>
          </div>

          {role === 'OWNER' && (
            <div className="bg-emerald-900 text-white p-6 rounded-xl shadow-lg space-y-4">
               <h3 className="font-bold border-b border-emerald-800 pb-2">📊 Lợi nhuận dự tính</h3>
               <div className="space-y-3">
                  <div className="flex justify-between text-emerald-300">
                    <span>Tổng vốn</span>
                    <span className="font-bold">{formatVND(totals.totalCost)} đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lợi nhuận ròng</span>
                    <span className="text-xl font-black text-white">{formatVND(totals.profit)} đ</span>
                  </div>
                  <div className="flex justify-between text-emerald-300">
                    <span>Tỷ suất lãi</span>
                    <span className="font-bold">{totals.profitPercent.toFixed(1)}%</span>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
