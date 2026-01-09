// components/invoice/ProductList.jsx
import React from 'react';
import ProductCard from './ProductCard';
import { Package } from 'lucide-react';

export default function ProductList({
    products,
    validationResults,
    selectedProducts,
    onToggleSelect,
    onProductUpdate
}) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Package className="mr-2" size={24} />
                Extracted Products ({products.length})
            </h2>

            <div className="space-y-4">
                {products.map((product, index) => (
                    <ProductCard
                        key={index}
                        product={product}
                        validation={validationResults[index] || {}}
                        isSelected={selectedProducts.has(index)}
                        onToggleSelect={() => onToggleSelect(index)}
                        onUpdate={(idx, updatedProduct) => onProductUpdate(idx, updatedProduct)}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
}