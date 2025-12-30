import React, { useState, useEffect } from 'react';
import { Plus, Package, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        product_name: '',
        vehicle_model: '',
        hsn_code: '',
        brand: '',
        base_rate: '',
        purchase_rate: '',
        gst_rate: '',
        discount: '0',
        current_stock: '0',
        minimum_stock: '0'
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [autoCalculate, setAutoCalculate] = useState(true);
    useEffect(() => {
        if (autoCalculate && formData.purchase_rate && formData.gst_rate) {
            const purchaseRate = parseFloat(formData.purchase_rate);
            const gstRate = parseFloat(formData.gst_rate);
            const discount = parseFloat(formData.discount) || 0;

            const finalRate = purchaseRate + (gstRate) - (discount);

            setFormData(prev => ({
                ...prev,
                base_rate: finalRate.toFixed(2)
            }));
        }
    }, [formData.purchase_rate, formData.gst_rate, formData.discount, autoCalculate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // If user manually changes base_rate, disable auto-calculation
        if (name === 'base_rate') {
            setAutoCalculate(false);
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };




    const validateForm = () => {
        const required = ['product_name', 'hsn_code', 'base_rate', 'purchase_rate', 'gst_rate'];
        for (let field of required) {
            if (!formData[field]) {
                setMessage({ type: 'error', text: `${field.replace('_', ' ')} is required` });
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {

            const { data, error } = await supabase
                .from('products')
                .insert([formData]);
            if (error) throw error;

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setMessage({ type: 'success', text: 'Product added successfully!' });
            alert("Product Added Succesfully ✅")

            // Reset form
            setFormData({
                product_name: '',
                vehicle_model: '',
                hsn_code: '',
                brand: '',
                base_rate: '',
                purchase_rate: '',
                gst_rate: '',
                discount: '0',
                current_stock: '0',
                minimum_stock: '0'
            });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to add product. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const profitMargin = formData.base_rate && formData.purchase_rate
        ? parseFloat(formData.base_rate) - parseFloat(formData.purchase_rate)
        : 0;

    const profitPercentage = formData.purchase_rate && profitMargin
        ? (profitMargin / parseFloat(formData.purchase_rate) * 100).toFixed(2)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Package className="text-purple-600" size={32} />
                        Add New Product
                    </h1>
                    <p className="text-gray-600 mt-2">Add products to your inventory</p>
                </div>

                {/* Message Alert */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle size={20} />
                        ) : (
                            <AlertCircle size={20} />
                        )}
                        <p>{message.text}</p>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="product_name"
                                value={formData.product_name}
                                onChange={handleChange}
                                placeholder="e.g., Brake Pad Set"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Brand */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Brand
                            </label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                placeholder="e.g., Bosch, TVS, etc."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Vehicle Model */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vehicle Model
                            </label>
                            <input
                                type="text"
                                name="vehicle_model"
                                value={formData.vehicle_model}
                                onChange={handleChange}
                                placeholder="e.g., Maruti Swift, Honda City"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* HSN Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                HSN Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="hsn_code"
                                value={formData.hsn_code}
                                onChange={handleChange}
                                placeholder="e.g., 8708"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* GST Rate */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                GST Rate (%) <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="gst_rate"
                                value={formData.gst_rate}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="">Select GST Rate</option>
                                <option value="0">0%</option>
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                            </select>
                        </div>

                        {/* Purchase Rate */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Purchase Rate (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="purchase_rate"
                                value={formData.purchase_rate}
                                onChange={handleChange}
                                placeholder="Cost price"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Base Rate */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Selling Rate (₹) <span className="text-red-500">*</span>
                                {autoCalculate && (
                                    <span className="ml-2 text-xs text-green-600">(Auto-calculated)</span>
                                )}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="base_rate"
                                value={formData.base_rate}
                                onChange={handleChange}
                                onFocus={() => setAutoCalculate(false)}
                                placeholder="Selling price"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        
                        </div>
              

                        {/* Discount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Discount (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                                placeholder="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Current Stock */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Stock
                            </label>
                            <input
                                type="number"
                                name="current_stock"
                                value={formData.current_stock}
                                onChange={handleChange}
                                placeholder="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Minimum Stock */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum Stock Alert
                            </label>
                            <input
                                type="number"
                                name="minimum_stock"
                                value={formData.minimum_stock}
                                onChange={handleChange}
                                placeholder="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Profit Margin Display */}
                    {profitMargin > 0 && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Profit Margin</p>
                            <p className="text-2xl font-bold text-blue-600">
                                ₹{profitMargin.toFixed(2)}
                                <span className="text-sm ml-2">({profitPercentage}%)</span>
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="mt-6">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus size={20} />
                                    Add Product
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;