import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tag, AlertTriangle, ArrowLeft, Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ProductDetails = () => {
    const { productId } = useParams(); // Get product ID from URL
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProduct, setEditedProduct] = useState(null);
    const [stockInput, setStockInput] = useState('');
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockOperation, setStockOperation] = useState('add'); // 'add' or 'remove'

    useEffect(() => {
        fetchProductDetails();
    }, [productId]);

    useEffect(() => {
        if (product) {
            setEditedProduct({ ...product });
        }
    }, [product]);

    const handleStockUpdate = async () => {
        const amount = parseInt(stockInput);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        let newStock;
        if (stockOperation === 'add') {
            newStock = product.current_stock + amount;
        } else {
            newStock = Math.max(0, product.current_stock - amount);
        }

        try {
            const { error } = await supabase
                .from('products')
                .update({ current_stock: newStock })
                .eq('id', productId);

            if (error) throw error;

            setProduct(prev => ({ ...prev, current_stock: newStock }));
            setStockInput('');
            setShowStockModal(false);
            alert(`Stock ${stockOperation === 'add' ? 'added' : 'removed'} successfully!`);
        } catch (error) {
            console.error('Error updating stock:', error);
            alert('Failed to update stock');
        }
    };

    const saveProductChanges = async () => {
        try {
            const { error } = await supabase
                .from('products')
                .update({
                    product_name: editedProduct.product_name,
                    brand: editedProduct.brand,
                    vehicle_model: editedProduct.vehicle_model,
                    hsn_code: editedProduct.hsn_code,
                    gst_rate: editedProduct.gst_rate,
                    purchase_rate: editedProduct.purchase_rate,
                    base_rate: editedProduct.base_rate,
                    discount: editedProduct.discount,
                    minimum_stock: editedProduct.minimum_stock
                })
                .eq('id', productId);

            if (error) throw error;

            setProduct(editedProduct);
            setIsEditing(false);
            alert('Product updated successfully!');
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product');
        }
    };

    const handleEditChange = (field, value) => {
        setEditedProduct(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const cancelEdit = () => {
        setEditedProduct({ ...product });
        setIsEditing(false);
    };

    const deleteProduct = async () => {
        if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) throw error;

            alert('Product deleted successfully!');
            navigate('/product/search');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    const fetchProductDetails = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
            alert('Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Product not found</p>
                    <button
                        onClick={() => navigate('/product-search')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/product/search')}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Products</span>
                </button>

                {/* Product Details Card */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Tag className="text-purple-600" size={28} />
                            Product Details
                        </h2>

                        {/* Edit/Save/Cancel/Delete Buttons */}
                        {!isEditing ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Product
                                </button>
                                <button
                                    onClick={deleteProduct}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={saveProductChanges}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Product Name */}
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Product Name</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedProduct.product_name}
                                    onChange={(e) => handleEditChange('product_name', e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg text-xl font-semibold focus:ring-2 focus:ring-purple-500"
                                />
                            ) : (
                                <p className="font-semibold text-2xl text-gray-900">{product.product_name}</p>
                            )}
                        </div>

                        {/* Brand & SKU */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Brand</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedProduct.brand || ''}
                                        onChange={(e) => handleEditChange('brand', e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg font-semibold focus:ring-2 focus:ring-purple-500"
                                    />
                                ) : (
                                    <p className="font-semibold text-lg">{product.brand || 'N/A'}</p>
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">SKU</p>
                                <p className="font-semibold text-lg">{product.id}</p>
                            </div>
                        </div>

                        {/* Vehicle Model */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Vehicle Model</p>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedProduct.vehicle_model || ''}
                                    onChange={(e) => handleEditChange('vehicle_model', e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg font-semibold focus:ring-2 focus:ring-purple-500"
                                />
                            ) : (
                                <p className="font-semibold text-lg">{product.vehicle_model || 'N/A'}</p>
                            )}
                        </div>

                        {/* HSN & GST */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">HSN Code</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editedProduct.hsn_code}
                                        onChange={(e) => handleEditChange('hsn_code', e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg font-semibold focus:ring-2 focus:ring-purple-500"
                                    />
                                ) : (
                                    <p className="font-semibold text-lg">{product.hsn_code}</p>
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">GST Rate</p>
                                {isEditing ? (
                                    <select
                                        value={editedProduct.gst_rate}
                                        onChange={(e) => handleEditChange('gst_rate', parseFloat(e.target.value))}
                                        className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg font-semibold focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="0">0%</option>
                                        <option value="5">5%</option>
                                        <option value="12">12%</option>
                                        <option value="18">18%</option>
                                        <option value="28">28%</option>
                                    </select>
                                ) : (
                                    <p className="font-semibold text-lg">{product.gst_rate}%</p>
                                )}
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="border-t-2 border-gray-200 pt-6">
                            <h3 className="font-bold text-xl mb-4 text-gray-900">Pricing Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Purchase Rate:</span>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={editedProduct.purchase_rate}
                                            onChange={(e) => handleEditChange('purchase_rate', parseFloat(e.target.value))}
                                            className="w-32 px-3 py-1 border-2 border-purple-300 rounded-lg font-bold text-right focus:ring-2 focus:ring-purple-500"
                                        />
                                    ) : (
                                        <span className="font-bold text-lg">₹{product.purchase_rate.toLocaleString()}</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">GST Amount:</span>
                                    <span className="font-bold text-lg text-blue-600">₹{product.gst_rate.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Selling Rate:</span>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={editedProduct.base_rate}
                                            onChange={(e) => handleEditChange('base_rate', parseFloat(e.target.value))}
                                            className="w-32 px-3 py-1 border-2 border-purple-300 rounded-lg font-bold text-right focus:ring-2 focus:ring-purple-500"
                                        />
                                    ) : (
                                        <span className="font-bold text-lg">₹{product.base_rate.toLocaleString()}</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-700 font-medium">Discount:</span>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={editedProduct.discount}
                                            onChange={(e) => handleEditChange('discount', parseFloat(e.target.value))}
                                            className="w-24 px-3 py-1 border-2 border-purple-300 rounded-lg font-bold text-right focus:ring-2 focus:ring-purple-500"
                                        />
                                    ) : (
                                        <span className="font-bold text-lg">{product.discount}%</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                                    <span className="text-gray-700 font-medium">Profit Margin:</span>
                                    <span className="font-bold text-2xl text-green-600">
                                        ₹{(isEditing ? editedProduct.base_rate - editedProduct.purchase_rate : product.base_rate - product.purchase_rate).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stock Section */}
                        <div className="border-t-2 border-gray-200 pt-6">
                            <h3 className="font-bold text-xl mb-4 text-gray-900">Stock Management</h3>
                            <div className="space-y-4">
                                {/* Current Stock */}
                                <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                                    <p className="text-sm text-gray-600 mb-3">Current Stock</p>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-4xl font-bold text-blue-600">{product.current_stock}</p>
                                    </div>

                                    {/* Stock Update Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setStockOperation('add');
                                                setShowStockModal(true);
                                            }}
                                            className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-bold flex items-center justify-center gap-2"
                                        >
                                            <Plus size={20} />
                                            Add Stock
                                        </button>
                                        <button
                                            onClick={() => {
                                                setStockOperation('remove');
                                                setShowStockModal(true);
                                            }}
                                            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                            </svg>
                                            Remove Stock
                                        </button>
                                    </div>
                                </div>

                                {/* Minimum Stock */}
                                <div className="p-6 bg-orange-50 rounded-lg border-2 border-orange-200">
                                    <p className="text-sm text-gray-600 mb-2">Minimum Stock Level</p>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={editedProduct.minimum_stock}
                                            onChange={(e) => handleEditChange('minimum_stock', parseInt(e.target.value))}
                                            className="w-32 px-4 py-2 border-2 border-purple-300 rounded-lg text-4xl font-bold text-orange-600 focus:ring-2 focus:ring-purple-500"
                                        />
                                    ) : (
                                        <p className="text-4xl font-bold text-orange-600">{product.minimum_stock}</p>
                                    )}
                                </div>

                                {/* Low Stock Alert */}
                                {product.current_stock <= product.minimum_stock && (
                                    <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200 flex items-center gap-3">
                                        <AlertTriangle className="text-red-600" size={24} />
                                        <p className="font-semibold text-red-600">Low stock alert! Please reorder soon.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stock Update Modal */}
            {showStockModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900">
                            {stockOperation === 'add' ? 'Add Stock' : 'Remove Stock'}
                        </h3>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter Quantity
                            </label>
                            <input
                                type="number"
                                value={stockInput}
                                onChange={(e) => setStockInput(e.target.value)}
                                placeholder="Enter amount..."
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                autoFocus
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleStockUpdate();
                                    }
                                }}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleStockUpdate}
                                className={`flex-1 px-4 py-3 text-white rounded-lg font-bold transition-colors ${stockOperation === 'add'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {stockOperation === 'add' ? 'Add' : 'Remove'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowStockModal(false);
                                    setStockInput('');
                                }}
                                className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-bold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;