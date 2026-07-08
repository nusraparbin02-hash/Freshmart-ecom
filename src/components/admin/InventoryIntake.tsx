import React, { useState, useEffect, useRef } from 'react';
import { useStore, Product } from '../../store/useStore';
import { Scan, Plus, Check, Save } from 'lucide-react';

export function InventoryIntake() {
  const { products, addStockBulk } = useStore();
  const [scannerInput, setScannerInput] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Manual Form State
  const [manualName, setManualName] = useState('');
  const [manualCategory, setManualCategory] = useState('Produce');
  const [manualPrice, setManualPrice] = useState('');
  const [manualStock, setManualStock] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [manualDescription, setManualDescription] = useState('');

  const triggerNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleScannerInputProcessing = (inputString: string) => {
    const trimmed = inputString.trim();
    if (!trimmed) return;

    const parts = trimmed.split(',').map(p => p.trim());

    // Format A: Name,Category,Price,Stock,Description (5 fields)
    if (parts.length === 5) {
      const [name, category, priceStr, stockStr, description] = parts;
      const price = parseFloat(priceStr);
      const stock = parseInt(stockStr, 10);

      if (isNaN(price) || isNaN(stock)) {
        triggerNotification('error', 'Scanner CSV format error: price must be decimal, stock must be integer.');
        return;
      }

      // Generate a mock barcode since none was scanned
      const mockBarcode = `880${Math.floor(100000000 + Math.random() * 900000000)}`;
      const newProduct: Product = {
        id: `prod-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: mockBarcode,
        name,
        category,
        price,
        stock,
        description
      };

      addStockBulk([newProduct]);
      triggerNotification('success', `Intake Success: Parsed "${name}" (Stock: +${stock}) with Barcode ${mockBarcode}`);
    } 
    // Format B: Barcode,Name,Category,Price,Stock,Description (6 fields)
    else if (parts.length === 6) {
      const [barcode, name, category, priceStr, stockStr, description] = parts;
      const price = parseFloat(priceStr);
      const stock = parseInt(stockStr, 10);

      if (isNaN(price) || isNaN(stock) || !/^\d{8,14}$/.test(barcode)) {
        triggerNotification('error', 'Scanner CSV format error: barcode must be digits, price decimal, stock integer.');
        return;
      }

      const newProduct: Product = {
        id: `prod-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode,
        name,
        category,
        price,
        stock,
        description
      };

      addStockBulk([newProduct]);
      triggerNotification('success', `Intake Success: Parsed "${name}" (Stock: +${stock})`);
    }
    // Format C: Single barcode input (Lookup or default catalog addition)
    else if (/^\d{8,14}$/.test(trimmed)) {
      const matched = products.find(p => p.barcode === trimmed);
      if (matched) {
        // Increment stock by 1 for immediate scan triggers
        const updatedProduct: Product = {
          ...matched,
          stock: 1 // addStockBulk merges and adds to current stock
        };
        addStockBulk([updatedProduct]);
        triggerNotification('success', `Scanned: Incrementing "${matched.name}" stock by +1.`);
      } else {
        // Populate manual barcode fields to make manual intake faster
        setManualBarcode(trimmed);
        triggerNotification('success', `New barcode ${trimmed} scanned. Fill manual form companion to save.`);
      }
    } else {
      triggerNotification('error', 'Unrecognized feed format. Use: Name,Category,Price,Stock,Description');
    }
  };

  const handleManualFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualName.trim()) return triggerNotification('error', 'Manual Form: Product Name is required.');
    if (!manualCategory.trim()) return triggerNotification('error', 'Manual Form: Category is required.');
    if (!/^\d{8,14}$/.test(manualBarcode.trim())) {
      return triggerNotification('error', 'Manual Form: Barcode must be a valid 8-14 digit SKU.');
    }

    const price = parseFloat(manualPrice);
    const stock = parseInt(manualStock, 10);

    if (isNaN(price) || price <= 0) return triggerNotification('error', 'Manual Form: Price must be a positive number.');
    if (isNaN(stock) || stock < 0) return triggerNotification('error', 'Manual Form: Stock count cannot be negative.');

    const newProduct: Product = {
      id: `prod-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: manualBarcode.trim(),
      name: manualName.trim(),
      category: manualCategory.trim(),
      price,
      stock,
      description: manualDescription.trim()
    };

    addStockBulk([newProduct]);
    triggerNotification('success', `Manually registered/updated catalog item: "${manualName}"`);
    
    // Reset Form
    setManualName('');
    setManualCategory('Produce');
    setManualPrice('');
    setManualStock('');
    setManualBarcode('');
    setManualDescription('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
      {/* Automated Barcode Scanner Listener */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
          <Scan className="h-5 w-5 text-[#16A34A]" />
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            Hardware Barcode Scanner Intake
          </h3>
        </div>

        {notification && (
          <div
            className={`p-3 text-xs font-bold rounded-xl border flex items-center justify-between transition-all ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <span>{notification.message}</span>
            <Check className="h-4 w-4" />
          </div>
        )}

        <div className="space-y-3">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Scanner Emulated Feed Focus Target
          </label>
          
          <div className="relative">
            <textarea
              rows={3}
              placeholder="Keep cursor focused here for barcode gun scans...&#10;Format: Name, Category, Price, Stock, Description"
              className="w-full bg-gray-50 border border-gray-200 px-3.5 py-3 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#16A34A] focus:bg-white transition-all resize-none"
              value={scannerInput}
              onChange={(e) => setScannerInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleScannerInputProcessing(scannerInput);
                  setScannerInput('');
                }
              }}
            />
          </div>

          <p className="text-[10px] text-gray-400 leading-relaxed">
            * <strong>Barcode scan:</strong> Simulates single increment.<br />
            * <strong>CSV block scan:</strong> Simulates rapid bulk scanner intakes. Splits on commas.
          </p>

          <button
            type="button"
            onClick={() => {
              handleScannerInputProcessing(scannerInput);
              setScannerInput('');
            }}
            className="w-full bg-gray-800 hover:bg-black text-white py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Process Scanner Stream
          </button>
        </div>
      </div>

      {/* Manual Form companion */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-4">
          <Plus className="h-5 w-5 text-[#16A34A]" />
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            Manual Form Companion
          </h3>
        </div>

        <form onSubmit={handleManualFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Product Name
              </label>
              <input
                type="text"
                placeholder="e.g. Fuji Apples"
                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-[#16A34A] outline-none"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Category
              </label>
              <select
                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-[#16A34A] outline-none font-bold"
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
              >
                <option value="Produce">Produce</option>
                <option value="Dairy">Dairy</option>
                <option value="Bakery">Bakery</option>
                <option value="Meat">Meat</option>
                <option value="Pantry">Pantry</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="2.99"
                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-[#16A34A] outline-none"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Stock Units
              </label>
              <input
                type="number"
                placeholder="50"
                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-[#16A34A] outline-none"
                value={manualStock}
                onChange={(e) => setManualStock(e.target.value)}
              />
            </div>
            <div className="space-y-1 col-span-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Barcode (SKU)
              </label>
              <input
                type="text"
                placeholder="SKU digits"
                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-[#16A34A] outline-none font-mono"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Short Description
            </label>
            <textarea
              rows={2}
              placeholder="Describe weight, unit details..."
              className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:ring-2 focus:ring-[#16A34A] outline-none resize-none"
              value={manualDescription}
              onChange={(e) => setManualDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <Save className="h-4 w-4" />
            <span>Register Manual Product</span>
          </button>
        </form>
      </div>
    </div>
  );
}
