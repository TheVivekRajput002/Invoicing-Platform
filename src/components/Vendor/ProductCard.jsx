// components/invoice/ProductCard.jsx
import React, { useState } from 'react';
import { Check, Edit2, AlertTriangle, Package, DollarSign, Hash, Tag } from 'lucide-react';
import Badge from '../Vendor/ui/Badge';

export default function ProductCard({
    product,
    validation,
    isSelected,
    onToggleSelect,
    onUpdate,
    index
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedProduct, setEditedProduct] = useState(product);

    /**
     * Determines card status based on validation results
     */
    const getStatusConfig = () => {
        if (!validation.isValid) {
            return {
                color: 'red',
                icon: AlertTriangle,
                label: 'Invalid - Missing required fields'
            };
        }
        if (validation.isDuplicate) {
            return {
                color: 'yellow',
                icon: Package,
                label: 'Exists - Will update stock'
            };
        }
        if (validation.priceChange) {
            return {
                color: 'blue',
                icon: DollarSign,
                label: 'Price changed from previous'
            };
        }
        return {
            color: 'green',
            icon: Check,
            label: 'Valid - Ready to insert'
        };
    };

    const status = getStatusConfig();
    const StatusIcon = status.icon;

    /**
     * Handles field updates in edit mode
     */
    const handleFieldChange = (field, value) => {
        setEditedProduct(prev => ({ ...prev, [field]: value }));
    };

    /**
     * Saves edited product
     */
    const handleSave = () => {
        onUpdate(index, editedProduct);
        setIsEditing(false);
    };

    /**
     * Cancels editing and reverts changes
     */
    const handleCancel = () => {
        setEditedProduct(product);
        setIsEditing(false);
    };

    return (
        <div
            className={`bg-white rounded-lg shadow-md p-5 transition-all ${
                isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
            } ${!validation.isValid ? 'opacity-75' : ''}`}
        >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                    {/* Selection Checkbox */}
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onToggleSelect}
                        disabled={!validation.isValid}
                        className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800">
                            {product.product_name}
                        </h3>
                        
                        {/* Status Badge */}
                        <div className="mt-2">
                            <Badge color={status.color}>
                                <StatusIcon size={14} className="mr-1" />
                                {status.label}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Edit Button */}
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                    <Edit2 size={18} />
                </button>
            </div>

            {/* Product Details */}
            {isEditing ? (
                // Edit Mode
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-500">Product Name</label>
                        <input
                            type="text"
                            value={editedProduct.product_name}
                            onChange={(e) => handleFieldChange('product_name', e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500">HSN Code</label>
                            <input
                                type="text"
                                value={editedProduct.hsn_code || ''}
                                onChange={(e) => handleFieldChange('hsn_code', e.target.value)}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Brand</label>
                            <input
                                type="text"
                                value={editedProduct.brand || ''}
                                onChange={(e) => handleFieldChange('brand', e.target.value)}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500">Purchase Rate</label>
                            <input
                                type="number"
                                step="0.01"
                                value={editedProduct.purchase_rate || ''}
                                onChange={(e) => handleFieldChange('purchase_rate', parseFloat(e.target.value))}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Quantity</label>
                            <input
                                type="number"
                                value={editedProduct.quantity || ''}
                                onChange={(e) => handleFieldChange('quantity', parseInt(e.target.value))}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Save/Cancel Buttons */}
                    <div className="flex space-x-2 pt-2">
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                // View Mode
                <div className="space-y-2 text-sm">
                    {product.hsn_code && (
                        <div className="flex items-center text-gray-600">
                            <Hash size={16} className="mr-2 text-gray-400" />
                            <span className="text-xs text-gray-500 mr-2">HSN:</span>
                            <span className="font-mono">{product.hsn_code}</span>
                        </div>
                    )}

                    {product.brand && (
                        <div className="flex items-center text-gray-600">
                            <Tag size={16} className="mr-2 text-gray-400" />
                            <span className="text-xs text-gray-500 mr-2">Brand:</span>
                            <span>{product.brand}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center text-gray-700">
                            <DollarSign size={16} className="mr-1 text-gray-400" />
                            <span className="font-semibold text-lg">
                                ₹{product.purchase_rate?.toFixed(2) || 'N/A'}
                            </span>
                        </div>

                        {product.quantity && (
                            <div className="flex items-center text-gray-600">
                                <Package size={16} className="mr-1 text-gray-400" />
                                <span>Qty: {product.quantity}</span>
                            </div>
                        )}
                    </div>

                    {/* Stock Update Info for Existing Products */}
                    {validation.isDuplicate && validation.existingProduct && (
                        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs text-blue-800 font-medium mb-1">
                                Stock Update Preview:
                            </p>
                            <p className="text-sm text-blue-900">
                                {validation.existingProduct.stock || 0} → {' '}
                                {(validation.existingProduct.stock || 0) + (product.quantity || 0)} units
                                <span className="text-green-600 font-semibold">
                                    {' '}(+{product.quantity || 0})
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Validation Errors */}
                    {!validation.isValid && validation.errors && (
                        <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                            <p className="text-xs text-red-800 font-medium mb-1">Issues:</p>
                            <ul className="text-xs text-red-700 space-y-1">
                                {validation.errors.map((error, i) => (
                                    <li key={i}>• {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}