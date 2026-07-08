import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Search, X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Produce', 'Dairy', 'Bakery', 'Meat', 'Pantry'];

// Levenshtein edit distance logic for typo tolerance in fuzzy search
function getEditDistance(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function CatalogDesk() {
  const { products, cart, addToCart, updateCartQuantity } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((p) => {
        const nameClean = p.name.toLowerCase();
        const descClean = p.description.toLowerCase();

        // Exact substring matches
        if (nameClean.includes(query) || descClean.includes(query) || p.barcode.includes(query)) {
          return true;
        }

        // Fuzzy edit-distance checking on single words
        const queryWords = query.split(/\s+/);
        const nameWords = nameClean.split(/\s+/);

        return queryWords.every((qw) => {
          if (qw.length < 3) return nameWords.some((nw) => nw.startsWith(qw));
          return nameWords.some((nw) => {
            if (nw.includes(qw) || qw.includes(nw)) return true;
            return getEditDistance(qw, nw) <= 2; // Maximum 2 typo allowance
          });
        });
      });
    }

    return result;
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Category Filter and Search Container */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        {/* Horizontal Capsules scroll */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-2 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#16A34A] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Typo-tolerant Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search catalog (e.g. appls)..."
            className="w-full bg-gray-50 border border-gray-200 pl-10 pr-10 py-2 rounded-xl text-xs focus:ring-2 focus:ring-[#16A34A] focus:bg-white outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-bold text-base mb-1">No items found matching your filters</p>
          <p className="text-xs text-gray-400">Try adjusting your search terms or changing categories.</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => {
              const cartItem = cart.find((item) => item.product.id === product.id);
              const cartQty = cartItem ? cartItem.quantity : 0;

              return (
                <motion.div
                  layout
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-gray-300 transition-all h-[360px]"
                >
                  <div className="space-y-2">
                    <span className="inline-block bg-gray-100 text-gray-600 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="text-sm font-extrabold text-gray-900 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{product.description}</p>
                  </div>

                  <div className="mt-auto pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-gray-900">${product.price.toFixed(2)}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          product.stock === 0
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : product.stock < 10
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-green-50 text-green-700 border border-green-200'
                        }`}
                      >
                        {product.stock === 0 ? 'Out of stock' : `${product.stock} units left`}
                      </span>
                    </div>

                    {cartQty > 0 ? (
                      <div className="flex items-center justify-between bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => updateCartQuantity(product.id, cartQty - 1)}
                          className="bg-white text-gray-600 hover:text-[#16A34A] h-8 w-8 rounded-lg flex items-center justify-center shadow-sm transition-all font-bold"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-extrabold text-xs">{cartQty}</span>
                        <button
                          onClick={() => updateCartQuantity(product.id, cartQty + 1)}
                          className="bg-white text-gray-600 hover:text-[#16A34A] h-8 w-8 rounded-lg flex items-center justify-center shadow-sm transition-all font-bold"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={product.stock === 0}
                        onClick={() => addToCart(product.id)}
                        className="w-full bg-[#16A34A] hover:bg-[#15803D] disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
