import React from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Minus, Trash2, ShoppingCart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckoutForm } from './CheckoutForm';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isCheckingOut: boolean;
  setIsCheckingOut: (val: boolean) => void;
}

export function CartDrawer({ isOpen, onClose, isCheckingOut, setIsCheckingOut }: CartDrawerProps) {
  const { cart, updateCartQuantity, removeFromCart } = useStore();

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const estimatedTax = 0.00;
  const finalTotal = cartSubtotal + estimatedTax;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black cursor-pointer"
            onClick={() => {
              if (!isCheckingOut) onClose();
            }}
          />

          {/* Drawer container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-white flex flex-col shadow-xl"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5 text-[#16A34A]" />
                  <h2 className="text-base font-extrabold text-[#1E293B]">
                    {isCheckingOut ? 'Friction-Free Checkout' : 'Shopping Cart'}
                  </h2>
                </div>
                <button
                  disabled={isCheckingOut}
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5">
                {isCheckingOut ? (
                  <CheckoutForm
                    onCancel={() => setIsCheckingOut(false)}
                    onComplete={() => {
                      setIsCheckingOut(false);
                      onClose();
                    }}
                  />
                ) : cart.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center justify-center h-full">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mb-4 animate-bounce" />
                    <p className="text-gray-500 font-bold text-sm mb-1">Your cart is empty</p>
                    <p className="text-xs text-gray-400">Add some groceries from the catalog to start checkout.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between border-b border-gray-100 pb-4"
                      >
                        <div className="flex-1 pr-3">
                          <h4 className="text-xs font-extrabold text-[#1E293B] line-clamp-1">
                            {item.product.name}
                          </h4>
                          <span className="text-[11px] text-gray-500 font-bold">
                            ${item.product.price.toFixed(2)} each
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="bg-white text-gray-600 h-7 w-7 rounded flex items-center justify-center transition-all font-bold shadow-sm"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="font-extrabold text-xs px-2">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="bg-white text-gray-600 h-7 w-7 rounded flex items-center justify-center transition-all font-bold shadow-sm"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {!isCheckingOut && cart.length > 0 && (
                <div className="p-5 border-t border-gray-200 bg-gray-50 space-y-4">
                  <div className="space-y-2 text-xs font-bold text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-gray-900">${cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Taxes</span>
                      <span className="text-gray-900">${estimatedTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 text-sm">
                      <span className="text-[#1E293B] font-extrabold">Final Total</span>
                      <span className="text-[#16A34A] font-black">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCheckingOut(true)}
                    className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white py-3 rounded-xl font-bold text-xs tracking-wider transition-all shadow-sm"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
