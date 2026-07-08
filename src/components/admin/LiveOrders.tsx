import React from 'react';
import { useStore, Order } from '../../store/useStore';
import { Clock, Phone, MapPin, User, Check, PackageOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LiveOrders() {
  const { orders, updateOrderStatus } = useStore();

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
  };

  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Packed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm font-sans space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-2">
          <PackageOpen className="h-5 w-5 text-[#16A34A]" />
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            Fulfillment Queue Monitor
          </h3>
        </div>
        <span className="text-[10px] text-gray-400 font-bold uppercase">
          Real-Time Delivery Schedules
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Check className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p className="font-bold text-xs uppercase">Fulfillment queue is clear</p>
          <p className="text-[10px] text-gray-400 mt-1">New storefront orders will show up here instantly.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <motion.div
                layout
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="border border-gray-200 rounded-xl p-4 space-y-3 hover:border-gray-300 transition-all bg-white"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-gray-400 font-bold">#{order.id}</span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <span className="text-sm font-black text-gray-900">
                    Value: ${order.subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-1.5">
                    <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="font-extrabold text-gray-800 line-clamp-1">{order.customerName}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="font-mono">{order.customerPhone}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 col-span-1 sm:col-span-3">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="line-clamp-1 text-gray-700">{order.customerAddress}</span>
                  </div>
                </div>

                {/* Logistics */}
                <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>Slot: {order.pickupWindow}</span>
                  </span>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                    Payment: {order.paymentRoute === 'online' ? 'QR Code Verified' : 'Pay on Pickup'}
                  </span>
                </div>

                {/* Line Items */}
                <div className="space-y-1 pl-2 border-l-2 border-gray-200 py-1">
                  <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Ordered Groceries
                  </span>
                  {order.items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-[11px] text-gray-700">
                      <span>
                        <strong className="text-gray-900 font-extrabold">{item.quantity}x</strong>{' '}
                        {item.product.name}
                      </span>
                      <span className="text-gray-400 font-mono">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Status Dropdown Picker */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-[11px]">
                  <label className="font-bold text-gray-500 uppercase tracking-wider">
                    Pipeline Fulfillment Status:
                  </label>
                  <select
                    className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-700 focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] outline-none"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Packed">Packed</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
