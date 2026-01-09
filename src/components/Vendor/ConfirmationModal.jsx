// components/invoice/ConfirmationModal.jsx
import React, { useState } from 'react';
import { X, Package, RefreshCw, PlusCircle, AlertTriangle } from 'lucide-react';

export default function ConfirmationModal({
    products,
    validationResults,
    onConfirm,
    onCancel
}) {
    const [action, setAction] = useState('insert'); // 'insert', 'update', or 'mixed'

    /**
     * Calculate summary statistics
     */
    const summary = {
        newProducts: validationResults.filter(v => !v.isDuplicate).length,
        existingProducts: validationResults.filter(v => v.isDuplicate).length,
        totalValue: products.reduce((sum, p) => sum + (p.purchase_rate * (p.quantity || 1)), 0),
        totalQuantity: products.reduce((sum, p) => sum + (p.quantity || 0), 0)
    };

    /**
     * Handles confirmation with selected action
     */
    const handleConfirm = () => {
        onConfirm(action);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Confirm Product Operations</h2>
                    <button
                        onClick={onCancel}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                                <PlusCircle className="text-green-600 mr-2" size={20} />
                                <span className="text-sm font-medium text-green-800">New Products</span>
                            </div>
                            <p className="text-3xl font-bold text-green-700">
                                {summary.newProducts}
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                                <RefreshCw className="text-blue-600 mr-2" size={20} />
                                <span className="text-sm font-medium text-blue-800">Stock Updates</span>
                            </div>
                            <p className="text-3xl font-bold text-blue-700">
                                {summary.existingProducts}
                            </p>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                                <Package className="text-purple-600 mr-2" size={20} />
                                <span className="text-sm font-medium text-purple-800">Total Units</span>
                            </div>
                            <p className="text-3xl font-bold text-purple-700">
                                {summary.totalQuantity}
                            </p>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                                <span className="text-amber-600 mr-2 font-bold text-xl">₹</span>
                                <span className="text-sm font-medium text-amber-800">Total Value</span>
                            </div>
                            <p className="text-3xl font-bold text-amber-700">
                                ₹{summary.totalValue.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* Action Selection */}
                    {summary.existingProducts > 0 && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start mb-3">
                                <AlertTriangle className="text-yellow-600 mr-2 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="font-medium text-yellow-900 mb-2">
                                        {summary.existingProducts} product(s) already exist in inventory
                                    </p>
                                    <p className="text-sm text-yellow-800 mb-3">
                                        Choose how to handle existing products:
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 ml-7">
                                <label className="flex items-start cursor-pointer">
                                    <input
                                        type="radio"
                                        name="action"
                                        value="update"
                                        checked={action === 'update'}
                                        onChange={(e) => setAction(e.target.value)}
                                        className="mt-1 h-4 w-4 text-blue-600"
                                    />
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-900">Add to existing stock</p>
                                        <p className="text-sm text-gray-600">
                                            Increase stock quantity by invoice amount
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-start cursor-pointer">
                                    <input
                                        type="radio"
                                        name="action"
                                        value="replace"
                                        checked={action === 'replace'}
                                        onChange={(e) => setAction(e.target.value)}
                                        className="mt-1 h-4 w-4 text-blue-600"
                                    />
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-900">Replace stock quantity</p>
                                        <p className="text-sm text-gray-600">
                                            Set stock to exactly the invoice quantity
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-start cursor-pointer">
                                    <input
                                        type="radio"
                                        name="action"
                                        value="skip"
                                        checked={action === 'skip'}
                                        onChange={(e) => setAction(e.target.value)}
                                        className="mt-1 h-4 w-4 text-blue-600"
                                    />
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-900">Skip existing products</p>
                                        <p className="text-sm text-gray-600">
                                            Only insert new products, don't update existing ones
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Product List Preview */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-700">Products to Process</h3>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {products.map((product, index) => {
                                const validation = validationResults[index];
                                return (
                                    <div
                                        key={index}
                                        className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    {product.product_name}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                                    {product.hsn_code && (
                                                        <span>HSN: {product.hsn_code}</span>
                                                    )}
                                                    {product.brand && (
                                                        <span>Brand: {product.brand}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="font-semibold text-gray-900">
                                                    ₹{product.purchase_rate?.toFixed(2)}
                                                </p>
                                                {product.quantity && (
                                                    <p className="text-sm text-gray-600">
                                                        Qty: {product.quantity}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Show stock change preview */}
                                        {validation?.isDuplicate && validation?.existingProduct && action !== 'skip' && (
                                            <div className="mt-2 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                                {action === 'update' ? (
                                                    <>Stock: {validation.existingProduct.stock || 0} → {(validation.existingProduct.stock || 0) + (product.quantity || 0)}</>
                                                ) : (
                                                    <>Stock: {validation.existingProduct.stock || 0} → {product.quantity || 0}</>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center"
                    >
                        <Package className="mr-2" size={18} />
                        Confirm & Process
                    </button>
                </div>
            </div>
        </div>
    );
}