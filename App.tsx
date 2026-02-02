
import React, { useState, useEffect } from 'react';
import { Role, Order, Customer, Supplier, Purchase, SaleChannel } from './types';
import Dashboard from './components/Dashboard';
import OrderForm from './components/OrderForm';
import OrderHistory from './components/OrderHistory';
import DataManagement from './components/DataManagement';
import Statistics from './components/Statistics';
import { generateId } from './utils';

const App: React.FC = () => {
  const [role, setRole] = useState<Role>('OWNER');
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'NEW_ORDER' | 'HISTORY' | 'DATA' | 'STATS'>('DASHBOARD');
  
  // Storage State
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Persistence
  useEffect(() => {
    const stored = localStorage.getItem('app_data');
    if (stored) {
      const data = JSON.parse(stored);
      setOrders(data.orders || []);
      setCustomers(data.customers || []);
      setSuppliers(data.suppliers || []);
      setPurchases(data.purchases || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('app_data', JSON.stringify({ orders, customers, suppliers, purchases }));
  }, [orders, customers, suppliers, purchases]);

  const saveOrder = (order: Order) => {
    // 1. Save or Update Order
    if (orders.find(o => o.id === order.id)) {
      setOrders(orders.map(o => o.id === order.id ? order : o));
    } else {
      setOrders([order, ...orders]);
    }

    // 2. Auto-sync Customer Data
    if (order.customerName.trim()) {
      const existingCustomer = customers.find(
        c => c.name.toLowerCase() === order.customerName.trim().toLowerCase()
      );

      if (!existingCustomer) {
        // Create new customer if doesn't exist
        const newCustomer: Customer = {
          id: generateId(),
          name: order.customerName.trim(),
          phone: order.phone,
          address: order.address,
          note: order.note,
          channel: order.channel
        };
        setCustomers(prev => [...prev, newCustomer]);
      } else {
        // Update existing customer info if it has changed
        setCustomers(prev => prev.map(c => 
          c.id === existingCustomer.id 
            ? { 
                ...c, 
                phone: order.phone || c.phone, 
                address: order.address || c.address,
                channel: order.channel || c.channel
              } 
            : c
        ));
      }
    }

    setActiveTab('HISTORY');
    setEditingOrder(null);
  };

  const deleteOrder = (id: string) => {
    if (role !== 'OWNER') return;
    setOrders(orders.filter(o => o.id !== id));
  };

  const cloneOrder = (order: Order) => {
    const newOrder: Order = {
      ...order,
      id: generateId(),
      orderNumber: '',
      createdAt: new Date().toISOString(),
      status: 'DRAFT',
      createdBy: 'User' // Simplified
    };
    setEditingOrder(newOrder);
    setActiveTab('NEW_ORDER');
  };

  const editOrder = (order: Order) => {
    setEditingOrder(order);
    setActiveTab('NEW_ORDER');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col no-print shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-400">QuickOrder</h1>
          <p className="text-xs text-slate-400 mt-1">v2.0 Profit Monitor</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'DASHBOARD' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <span>🏠</span> Tổng quan
          </button>
          <button 
            onClick={() => { setEditingOrder(null); setActiveTab('NEW_ORDER'); }}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'NEW_ORDER' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <span>📝</span> Lên đơn mới
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'HISTORY' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <span>📜</span> Lịch sử đơn
          </button>
          <button 
            onClick={() => setActiveTab('DATA')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'DATA' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <span>👥</span> Khách & NCC
          </button>
          {role === 'OWNER' && (
            <button 
              onClick={() => setActiveTab('STATS')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'STATS' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <span>📊</span> Thống kê lãi
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider">Phân quyền</p>
            <div className="flex bg-slate-900 rounded-md p-1">
              <button 
                onClick={() => setRole('OWNER')}
                className={`flex-1 text-[10px] py-1 rounded ${role === 'OWNER' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
              >
                Chủ Shop
              </button>
              <button 
                onClick={() => setRole('STAFF')}
                className={`flex-1 text-[10px] py-1 rounded ${role === 'STAFF' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
              >
                Nhân viên
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50 relative p-4 md:p-8">
        {activeTab === 'DASHBOARD' && <Dashboard orders={orders} role={role} onNewOrder={() => setActiveTab('NEW_ORDER')} />}
        {activeTab === 'NEW_ORDER' && (
          <OrderForm 
            onSave={saveOrder} 
            initialOrder={editingOrder} 
            role={role}
            customers={customers}
          />
        )}
        {activeTab === 'HISTORY' && (
          <OrderHistory 
            orders={orders} 
            role={role} 
            onDelete={deleteOrder} 
            onEdit={editOrder} 
            onClone={cloneOrder} 
          />
        )}
        {activeTab === 'DATA' && (
          <DataManagement 
            role={role}
            customers={customers} setCustomers={setCustomers}
            suppliers={suppliers} setSuppliers={setSuppliers}
            purchases={purchases} setPurchases={setPurchases}
          />
        )}
        {activeTab === 'STATS' && role === 'OWNER' && (
          <Statistics orders={orders} purchases={purchases} />
        )}
      </main>
    </div>
  );
};

export default App;
