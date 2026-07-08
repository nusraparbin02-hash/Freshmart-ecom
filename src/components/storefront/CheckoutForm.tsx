import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { QrCode, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

interface CheckoutFormProps {
  onCancel: () => void;
  onComplete: () => void;
}

const PICKUP_WINDOWS = [
  '9am-12pm morning',
  '12pm-4pm afternoon',
  '4pm-7pm evening',
  '7pm-11pm night'
] as const;

export function CheckoutForm({ onCancel, onComplete }: CheckoutFormProps) {
  const { cart, submitOrder } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pickupWindow, setPickupWindow] = useState<typeof PICKUP_WINDOWS[number] | ''>('');
  const [paymentRoute, setPaymentRoute] = useState<'online' | 'pickup' | ''>('');
  
  // Transaction validation fields
  const [transactionId, setTransactionId] = useState('');
  const [qrStage, setQrStage] = useState<'none' | 'loading' | 'generated' | 'completed'>('none');
  const [errorMsg, setErrorMsg] = useState('');

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) return setErrorMsg('Name is required.');
    if (!/^\+?[0-9\s-]{10,14}$/.test(phone.trim())) {
      return setErrorMsg('Provide a valid phone number (10-14 digits).');
    }
    if (!address.trim()) return setErrorMsg('Delivery/pickup address is required.');
    if (!pickupWindow) return setErrorMsg('Select a pickup window.');
    if (!paymentRoute) return setErrorMsg('Select a payment route.');

    if (paymentRoute === 'online') {
      setQrStage('loading');
      setTimeout(() => {
        setQrStage('generated');
      }, 1000);
    } else {
      // Pay on Pickup route
      submitOrder({
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        pickupWindow: pickupWindow as any,
        paymentRoute: 'pickup'
      });
      setQrStage('completed');
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  const handleMockPaymentSuccess = () => {
    if (!transactionId.trim()) {
      return setErrorMsg('Please enter the Transaction ID / Ref to confirm payment.');
    }

    submitOrder({
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      pickupWindow: pickupWindow as any,
      paymentRoute: 'online'
    });
    setQrStage('completed');
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  if (qrStage === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-[#16A34A]"
        >
          <CheckCircle2 className="h-16 w-16 mb-4 mx-auto" />
        </motion.div>
        <h3 className="text-sm font-extrabold text-[#1E293B] mb-2">Order Confirmed!</h3>
        <p className="text-xs text-gray-500 leading-relaxed px-4">
          Your order has been serialized and sent to our packing queues. Thank you for choosing Fresh Mart!
        </p>
      </div>
    );
  }

  if (qrStage === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-t-[#16A34A] border-gray-200 rounded-full animate-spin" />
        <p className="text-xs text-gray-500 font-semibold">Generating Dynamic Payment QR Token Container...</p>
      </div>
    );
  }

  if (qrStage === 'generated') {
    return (
      <div className="flex flex-col items-center py-4 space-y-4 text-center">
        <h3 className="text-xs font-extrabold text-[#1E293B]">Scan to Pay Instantly</h3>
        <p className="text-[10px] text-gray-400">Scan this QR code using your mobile device banking app to complete payment.</p>
        
        {/* Dynamic Mock QR Code Block */}
        <div className="border border-gray-200 p-4 rounded-2xl bg-white shadow-sm flex flex-col items-center w-full">
          <div className="w-36 h-36 bg-gray-50 border border-gray-100 flex items-center justify-center relative rounded-xl mb-3">
            <QrCode className="h-24 w-24 text-gray-800" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
              <div className="bg-[#16A34A] text-white text-[8px] font-extrabold px-1 rounded">FM</div>
            </div>
          </div>
          <span className="text-xs font-bold text-[#1E293B] mb-4">Amount Due: ${cartSubtotal.toFixed(2)}</span>
          
          <div className="w-full space-y-1.5 text-left">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">
              Transaction ID / Ref Confirmation
            </label>
            <input
              type="text"
              placeholder="e.g. TXN88796541"
              className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#16A34A] transition-all"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg w-full text-left">
            {errorMsg}
          </div>
        )}

        <div className="w-full flex space-x-3 pt-3">
          <button
            onClick={() => setQrStage('none')}
            className="flex-1 border border-gray-200 text-gray-600 font-bold py-2 px-4 rounded-xl text-xs hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleMockPaymentSuccess}
            className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-2 px-4 rounded-xl text-xs transition-all"
          >
            Verify Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmission} className="space-y-5 text-left">
      <h3 className="text-xs font-extrabold text-[#1E293B] uppercase tracking-wider border-b border-gray-100 pb-2">
        Enter Booking Information
      </h3>
      
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
        <input
          type="text"
          placeholder="e.g. John Doe"
          className="w-full bg-white border border-gray-200 px-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-[#16A34A] outline-none transition-all"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Phone Number</label>
        <input
          type="tel"
          placeholder="e.g. 555-019-2834"
          className="w-full bg-white border border-gray-200 px-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-[#16A34A] outline-none transition-all"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Physical Address</label>
        <textarea
          rows={2}
          placeholder="Enter delivery/pickup address"
          className="w-full bg-white border border-gray-200 px-3 py-2.5 rounded-xl text-xs focus:ring-2 focus:ring-[#16A34A] outline-none transition-all resize-none"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {/* Pickup Windows */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">
          Logistics Pickup Time Window
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PICKUP_WINDOWS.map((window) => (
            <button
              key={window}
              type="button"
              onClick={() => setPickupWindow(window)}
              className={`py-2 px-3 border rounded-xl text-[10px] font-bold transition-all text-left flex items-center space-x-1.5 ${
                pickupWindow === window
                  ? 'border-[#16A34A] bg-green-50 text-[#16A34A]'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{window}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Options */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Payment Gateway</label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setPaymentRoute('pickup')}
            className={`py-2.5 px-3 border rounded-xl flex flex-col items-center justify-center space-y-1.5 transition-all ${
              paymentRoute === 'pickup'
                ? 'border-[#16A34A] bg-green-50 text-[#16A34A]'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 className="h-4.5 w-4.5" />
            <span className="text-[10px] font-bold">Pay on Pickup</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentRoute('online')}
            className={`py-2.5 px-3 border rounded-xl flex flex-col items-center justify-center space-y-1.5 transition-all ${
              paymentRoute === 'online'
                ? 'border-[#16A34A] bg-green-50 text-[#16A34A]'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <QrCode className="h-4.5 w-4.5" />
            <span className="text-[10px] font-bold">Online QR Code</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-3 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-xs hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm"
        >
          Submit Order
        </button>
      </div>
    </form>
  );
}
