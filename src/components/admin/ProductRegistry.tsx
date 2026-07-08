import React from 'react';
import { useStore, Product } from '../../store/useStore';
import { Edit3 } from 'lucide-react';

export function ProductRegistry() {
  const { products, updateProductInline } = useStore();

  const handlePriceChange = (id: string, val: string) => {
    updateProductInline(id, 'price', val);
  };

  const handleStockChange = (id: string, val: string) => {
    updateProductInline(id, 'stock', val);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm font-sans space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-2">
          <Edit3 className="h-5 w-5 text-[#16A34A]" />
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            Product Registry Spreadsheet
          </h3>
        </div>
        <span className="text-[10px] text-gray-400 font-bold uppercase">
          Zero-Click Inline Editing Active
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-xs text-left">
          <thead>
            <tr className="text-gray-400 font-bold uppercase tracking-wider border-b border-gray-200 text-[10px]">
              <th className="py-2.5 px-3">Barcode (SKU)</th>
              <th className="py-2.5 px-3">Product Name</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-center">Unit Price ($)</th>
              <th className="py-2.5 px-3 text-center">Stock Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => {
              const isLowStock = product.stock < 10;
              return (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  {/* Barcode */}
                  <td className="py-2 px-3 font-mono text-gray-500 font-semibold">{product.barcode}</td>
                  
                  {/* Product Name */}
                  <td className="py-2 px-3 font-bold text-gray-800">{product.name}</td>
                  
                  {/* Category Pill */}
                  <td className="py-2 px-3">
                    <span className="bg-gray-100 text-gray-600 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                      {product.category}
                    </span>
                  </td>

                  {/* Inline Price Input */}
                  <td className="py-2 px-3 text-center">
                    <input
                      type="number"
                      step="0.01"
                      className="w-18 bg-white border border-gray-200 hover:border-gray-400 focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] px-2 py-1 rounded text-xs font-bold text-center outline-none transition-all"
                      value={product.price}
                      onChange={(e) => handlePriceChange(product.id, e.target.value)}
                    />
                  </td>

                  {/* Inline Stock Input with low-stock warnings */}
                  <td className="py-2 px-3 text-center">
                    <input
                      type="number"
                      className={`w-16 px-2 py-1 rounded text-xs font-bold text-center border outline-none transition-all ${
                        isLowStock
                          ? 'bg-red-50 border-red-200 text-red-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 animate-pulse'
                          : 'bg-white border-gray-200 hover:border-gray-400 focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] text-gray-800'
                      }`}
                      value={product.stock}
                      onChange={(e) => handleStockChange(product.id, e.target.value)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
