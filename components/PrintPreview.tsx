
import React from 'react';
import { Order } from '../types';
import { isPaper, calculateItemStats, calculateOrderTotals, formatVND } from '../utils';

interface Props {
  order: Order;
  onBack: () => void;
}

const PrintPreview: React.FC<Props> = ({ order, onBack }) => {
  const totals = calculateOrderTotals(order);
  const hasPaper = order.items.some(i => isPaper(i.name));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-800 p-8 flex flex-col items-center gap-6 overflow-auto">
      <div className="w-full max-w-[210mm] flex justify-between no-print">
        <button onClick={onBack} className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600"> Quay lại</button>
        <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg"> In Báo giá (A4)</button>
      </div>

      <div className="print-area bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[20mm]">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase">Bảng Báo Giá</h1>
            <p className="text-slate-500">Mã đơn: {order.orderNumber || '---'}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">CỬA HÀNG VẬT TƯ IN ẤN</h2>
            <p className="text-sm">Địa chỉ: 123 Đường In Ấn, TP.HCM</p>
            <p className="text-sm">SĐT: 0909 xxx xxx</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-4 mb-8 border border-slate-200 p-4 rounded">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Khách hàng</p>
            <p className="font-bold text-lg">{order.customerName}</p>
            <p className="text-sm">SĐT: {order.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase">Ngày lập</p>
            <p className="font-bold">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
            <p className="text-sm">Địa chỉ: {order.address}</p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-xs uppercase font-bold">
              <th className="px-3 py-2 text-left border border-slate-900">Mô tả hàng hóa</th>
              {hasPaper && (
                <>
                  <th className="px-3 py-2 text-center border border-slate-900">Quy cách</th>
                  <th className="px-3 py-2 text-center border border-slate-900">Dài</th>
                </>
              )}
              <th className="px-3 py-2 text-center border border-slate-900">SL</th>
              <th className="px-3 py-2 text-center border border-slate-900">ĐVT</th>
              {hasPaper && <th className="px-3 py-2 text-center border border-slate-900">m²</th>}
              <th className="px-3 py-2 text-right border border-slate-900">Đơn giá</th>
              <th className="px-3 py-2 text-right border border-slate-900">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => {
              const stats = calculateItemStats(item);
              return (
                <tr key={item.id} className="text-sm">
                  <td className="px-3 py-2 border border-slate-200">{item.name}</td>
                  {hasPaper && (
                    <>
                      <td className="px-3 py-2 border border-slate-200 text-center">{item.isPaper ? item.width : '-'}</td>
                      <td className="px-3 py-2 border border-slate-200 text-center">{item.isPaper ? item.length : '-'}</td>
                    </>
                  )}
                  <td className="px-3 py-2 border border-slate-200 text-center">{item.qty}</td>
                  <td className="px-3 py-2 border border-slate-200 text-center">{item.unit}</td>
                  {hasPaper && (
                    <td className="px-3 py-2 border border-slate-200 text-center font-bold">
                      {item.isPaper ? stats.area.toFixed(2) : '-'}
                    </td>
                  )}
                  <td className="px-3 py-2 border border-slate-200 text-right">{formatVND(item.sellPrice)}</td>
                  <td className="px-3 py-2 border border-slate-200 text-right font-bold">{formatVND(stats.revenue)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-1/2 space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Tổng cộng hàng:</span>
              <span>{formatVND(totals.subtotal)} đ</span>
            </div>
            {order.discountPercent > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Chiết khấu ({order.discountPercent}%):</span>
                <span>- {formatVND(totals.subtotal - totals.afterDiscount)} đ</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Phí vận chuyển:</span>
              <span>{formatVND(order.shippingFee)} đ</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tiền xe / Thu hộ:</span>
              <span>{formatVND(order.cashOnDelivery)} đ</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t-2 pt-2 border-slate-900">
              <span className="uppercase">Tổng khách trả:</span>
              <span className="text-xl text-blue-600">{formatVND(totals.totalCustomerPays)} đ</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 grid grid-cols-2 text-center">
          <div>
            <p className="font-bold">KHÁCH HÀNG</p>
            <p className="text-xs text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
          </div>
          <div>
            <p className="font-bold">NGƯỜI LẬP ĐƠN</p>
            <p className="text-xs text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;
