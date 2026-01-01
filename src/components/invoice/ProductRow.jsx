import React from 'react';
import { Trash2 } from 'lucide-react';

const ProductRow = ({
    product,
    index,
    onProductChange,
    onRemove,
    gstIncluded,
    inputRefs,
    onKeyDown,
    showDropdown,
    searchResults,
    searching,
    onProductSelect,
    onDropdownToggle,
    canRemove
}) => {
    return (
        <tr className="border-b border-gray-300 hover:bg-gray-50">
            <td className="px-2 py-3 text-sm text-center max-md:px-1">{index + 1}</td>
            
            {/* Product Name */}
            <td className="px-2 py-3 max-md:px-1" style={{ position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                    <input
                        ref={(el) => inputRefs.current[`${product.id}-productName`] = el}
                        type="text"
                        value={product.productName}
                        onChange={(e) => onProductChange(product.id, 'productName', e.target.value)}
                        onKeyDown={(e) => onKeyDown(e, `${product.id}-productName`, product.id)}
                        onBlur={() => {
                            setTimeout(() => onDropdownToggle(product.id, false), 200);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Start typing product name..."
                    />

                    {/* Dropdown */}
                    {showDropdown && searchResults?.length > 0 && (
                        <div
                            className="absolute bg-white border-2 border-gray-300 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
                            style={{
                                width: '100%',
                                top: 'calc(100% + 4px)',
                                left: 0,
                                zIndex: 9999
                            }}
                        >
                            {searchResults.map((item) => (
                                <div
                                    key={item.id}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        onProductSelect(product.id, item);
                                    }}
                                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm text-gray-900">
                                                {item.product_name}
                                            </p>
                                            <div className="flex gap-3 mt-1">
                                                <span className="text-xs text-gray-600">
                                                    HSN: {item.hsn_code}
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    GST: {item.gst_rate}%
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-blue-600">
                                            ₹{item.base_rate}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Loading indicator */}
                    {searching && (
                        <div className="absolute right-3 top-3">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </div>
            </td>

            {/* HSN Code */}
            <td className="px-2 py-3 max-md:px-1">
                <input
                    ref={(el) => inputRefs.current[`${product.id}-hsnCode`] = el}
                    type="text"
                    value={product.hsnCode}
                    onChange={(e) => onProductChange(product.id, 'hsnCode', e.target.value)}
                    onKeyDown={(e) => onKeyDown(e, `${product.id}-hsnCode`, product.id)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="HSN"
                />
            </td>

            {/* Quantity */}
            <td className="px-2 py-3 max-md:px-1">
                <input
                    ref={(el) => inputRefs.current[`${product.id}-quantity`] = el}
                    type="number"
                    value={product.quantity}
                    onChange={(e) => onProductChange(product.id, 'quantity', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => onKeyDown(e, `${product.id}-quantity`, product.id)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm text-center"
                />
            </td>

            {/* Rate */}
            <td className="px-2 py-3 max-md:px-1">
                <input
                    ref={(el) => inputRefs.current[`${product.id}-rate`] = el}
                    type="number"
                    value={product.rate}
                    onChange={(e) => onProductChange(product.id, 'rate', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => onKeyDown(e, `${product.id}-rate`, product.id)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm text-right"
                />
            </td>

            {/* GST Percentage */}
            <td className="px-2 py-3 max-md:px-1">
                <input
                    ref={(el) => inputRefs.current[`${product.id}-gstPercentage`] = el}
                    type="number"
                    value={product.gstPercentage}
                    onChange={(e) => onProductChange(product.id, 'gstPercentage', parseFloat(e.target.value) || 0)}
                    onKeyDown={(e) => onKeyDown(e, `${product.id}-gstPercentage`, product.id)}
                    disabled={gstIncluded}
                    className={`w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm text-center ${
                        gstIncluded ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                    }`}
                />
            </td>

            {/* Total Amount */}
            <td className="px-2 py-3 text-sm font-semibold text-right max-md:px-1">
                ₹{product.totalAmount.toFixed(2)}
            </td>

            {/* Remove Button */}
            <td className="px-2 py-3 text-center max-md:px-1">
                <button
                    onClick={() => onRemove(product.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                    disabled={!canRemove}
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </td>
        </tr>
    );
};

export default ProductRow;