
import React, { useState } from 'react';
import { Customer, Supplier, Purchase, Role, SaleChannel } from '../types';
import { generateId, formatVND } from '../utils';

interface Props {
  role: Role;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  purchases: Purchase[];
  setPurchases: React.Dispatch<React.SetStateAction<Purchase[]>>;
}

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition text-2xl">&times;</button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  </div>
);

const DataManagement: React.FC<Props> = ({ role, customers, setCustomers, suppliers, setSuppliers, purchases, setPurchases }) => {
  const [tab, setTab] = useState<'CUSTOMERS' | 'SUPPLIERS' | 'PURCHASES'>('CUSTOMERS');
  
  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<any>(null);

  // Form states (Temporary)
  const [formData, setFormData] = useState<any>({});

  const openAddModal = () => {
    setEditItem(null);
    setFormData(tab === 'CUSTOMERS' ? { channel: SaleChannel.ZALO } : tab === 'SUPPLIERS' ? {} : { date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
    if (tab === 'CUSTOMERS') setCustomers(customers.filter(c => c.id !== id));
    if (tab === 'SUPPLIERS') setSuppliers(suppliers.filter(s => s.id !== id));
    if (tab === 'PURCHASES') setPurchases(purchases.filter(p => p.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'CUSTOMERS') {
      const data = formData as Customer;
      if (editItem) {
        setCustomers(customers.map(c => c.id === editItem.id ? { ...data } : c));
      } else {
        setCustomers([...customers, { ...data, id: generateId() }]);
      }
    } else if (tab === 'SUPPLIERS') {
      const data = formData as Supplier;
      if (editItem) {
        setSuppliers(suppliers.map(s => s.id === editItem.id ? { ...data } : s));
      } else {
        setSuppliers([...suppliers, { ...data, id: generateId() }]);
      }
    } else if (tab === 'PURCHASES') {
      const data = formData as Purchase;
      const total = (data.qty || 0) * (data.buyPrice || 0);
      if (editItem) {
        setPurchases(purchases.map(p => p.id === editItem.id ? { ...data, total } : p));
      } else {
        setPurchases([...purchases, { ...data, id: generateId(), total }]);
      }
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-slate-200 pb-px">
        <button onClick={() => setTab('CUSTOMERS')} className={`px-4 py-2 font-bold transition ${tab === 'CUSTOMERS' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Khách hàng</button>
        <button onClick={() => setTab('SUPPLIERS')} className={`px-4 py-2 font-bold transition ${tab === 'SUPPLIERS' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Nhà cung cấp</button>
        <button onClick={() => setTab('PURCHASES')} className={`px-4 py-2 font-bold transition ${tab === 'PURCHASES' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Nhập hàng</button>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">
          {tab === 'CUSTOMERS' && 'Danh sách khách hàng'}
          {tab === 'SUPPLIERS' && 'Đối tác cung ứng'}
          {tab === 'PURCHASES' && 'Lịch sử nhập kho'}
        </h3>
        {(tab === 'CUSTOMERS' || role === 'OWNER') && (
          <button 
            onClick={openAddModal} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition"
          >
            {tab === 'CUSTOMERS' ? '+ Thêm khách' : tab === 'SUPPLIERS' ? '+ Thêm NCC' : '+ Phiếu nhập mới'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {tab === 'CUSTOMERS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Tên / SĐT</th>
                  <th className="px-6 py-4">Địa chỉ</th>
                  <th className="px-6 py-4">Kênh</th>
                  <th className="px-6 py-4">Ghi chú</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-800">{c.name}<br/><span className="text-xs font-normal text-slate-400">{c.phone || 'N/A'}</span></td>
                    <td className="px-6 py-4 text-slate-600">{c.address || '-'}</td>
                    <td className="px-6 py-4"><span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">{c.channel}</span></td>
                    <td className="px-6 py-4 text-slate-400 italic text-xs">{c.note || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(c)} className="p-1.5 text-slate-400 hover:text-blue-600 transition">✏️</button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && <tr><td colSpan={5} className="p-16 text-center text-slate-400 italic">Chưa có dữ liệu khách hàng</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'SUPPLIERS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Nhà cung cấp</th>
                  <th className="px-6 py-4">Ngành hàng</th>
                  <th className="px-6 py-4">SĐT / Địa chỉ</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {suppliers.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                    <td className="px-6 py-4 font-medium text-blue-600">{s.category || 'Vật tư chung'}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{s.phone} - {s.address}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {role === 'OWNER' && (
                          <>
                            <button onClick={() => openEditModal(s)} className="p-1.5 text-slate-400 hover:text-blue-600 transition">✏️</button>
                            <button onClick={() => handleDelete(s.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition">🗑️</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && <tr><td colSpan={4} className="p-16 text-center text-slate-400 italic">Chưa có dữ liệu nhà cung cấp</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'PURCHASES' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Ngày / NCC</th>
                  <th className="px-6 py-4">Sản phẩm</th>
                  <th className="px-6 py-4">SL</th>
                  <th className="px-6 py-4 text-right">Đơn giá</th>
                  <th className="px-6 py-4 text-right">Tổng tiền</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {purchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800">{new Date(p.date).toLocaleDateString('vi-VN')}</span>
                      <br/>
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">{p.supplierId}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{p.productName}</td>
                    <td className="px-6 py-4 text-slate-600">{p.qty}</td>
                    <td className="px-6 py-4 text-right text-slate-500">{formatVND(p.buyPrice)} đ</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">{formatVND(p.total)} đ</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {role === 'OWNER' && (
                          <>
                            <button onClick={() => openEditModal(p)} className="p-1.5 text-slate-400 hover:text-blue-600 transition">✏️</button>
                            <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition">🗑️</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {purchases.length === 0 && <tr><td colSpan={6} className="p-16 text-center text-slate-400 italic">Chưa có lịch sử nhập hàng</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showModal && (
        <Modal 
          title={editItem ? 'Cập nhật thông tin' : 'Thêm mới bản ghi'} 
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSave} className="space-y-4">
            {tab === 'CUSTOMERS' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên khách hàng</label>
                  <input required className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số điện thoại</label>
                  <input className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Địa chỉ</label>
                  <input className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kênh bán</label>
                  <select className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.channel} onChange={e => setFormData({...formData, channel: e.target.value as SaleChannel})}>
                    {Object.values(SaleChannel).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </>
            )}

            {tab === 'SUPPLIERS' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên nhà cung cấp</label>
                  <input required className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngành hàng</label>
                  <input className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="VD: Giấy, Mực, PET..." value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số điện thoại / Liên hệ</label>
                  <input className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Địa chỉ kho</label>
                  <input className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </>
            )}

            {tab === 'PURCHASES' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ngày nhập</label>
                  <input type="date" required className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.date ? formData.date.split('T')[0] : ''} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nhà cung cấp</label>
                  <select required className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.supplierId || ''} onChange={e => setFormData({...formData, supplierId: e.target.value})}>
                    <option value="">-- Chọn NCC --</option>
                    {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sản phẩm</label>
                  <input required className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.productName || ''} onChange={e => setFormData({...formData, productName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số lượng</label>
                    <input type="number" required className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.qty || ''} onChange={e => setFormData({...formData, qty: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Đơn giá nhập</label>
                    <input type="number" required className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.buyPrice || ''} onChange={e => setFormData({...formData, buyPrice: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center border border-slate-100">
                   <span className="text-xs font-bold text-slate-500 uppercase">Thành tiền:</span>
                   <span className="font-bold text-blue-600">{formatVND((formData.qty || 0) * (formData.buyPrice || 0))} đ</span>
                </div>
              </>
            )}

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg font-bold text-slate-500 hover:bg-slate-50 transition">Hủy</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-md">Lưu dữ liệu</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DataManagement;
