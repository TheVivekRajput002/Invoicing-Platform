import React, { useState, useEffect } from 'react';
import { Plus, Package, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        product_name: '',
        vehicle_model: '',
        hsn_code: '',
        brand: '',
        purchase_rate: '',
        current_stock: '0',
        minimum_stock: '0'
    });

    const [brandSuggestions, setBrandSuggestions] = useState([]);
    const [vehicleSuggestions, setVehicleSuggestions] = useState([]);
    const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
    const [showVehicleSuggestions, setShowVehicleSuggestions] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('brand, vehicle_model');

            if (error) throw error;

            // Get unique brands and vehicles
            const brands = [...new Set(data.map(p => p.brand).filter(Boolean))];
            const vehicles = [...new Set(data.map(p => p.vehicle_model).filter(Boolean))];

            setBrandSuggestions(brands);
            setVehicleSuggestions(vehicles);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Show suggestions for brand
        if (name === 'brand') {
            setShowBrandSuggestions(value.length > 0);
        }

        // Show suggestions for vehicle
        if (name === 'vehicle_model') {
            setShowVehicleSuggestions(value.length > 0);
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const selectBrandSuggestion = (brand) => {
        setFormData(prev => ({ ...prev, brand }));
        setShowBrandSuggestions(false);
    };

    const selectVehicleSuggestion = (vehicle) => {
        setFormData(prev => ({ ...prev, vehicle_model: vehicle }));
        setShowVehicleSuggestions(false);
    };

    const validateForm = () => {
        const required = ['product_name', 'hsn_code', 'purchase_rate'];
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
                purchase_rate: '',
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

            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                <span className="font-medium">Back</span>
            </button>

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
                        {/* Brand */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Brand
                            </label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                onFocus={() => setShowBrandSuggestions(formData.brand.length > 0)}
                                onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 200)}
                                placeholder="e.g., Bosch, TVS, etc."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                autoComplete="off"
                            />
                            {/* Suggestions Dropdown */}
                            {showBrandSuggestions && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {brandSuggestions
                                        .filter(brand => brand.toLowerCase().includes(formData.brand.toLowerCase()))
                                        .map((brand, index) => (
                                            <div
                                                key={index}
                                                onClick={() => selectBrandSuggestion(brand)}
                                                className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm"
                                            >
                                                {brand}
                                            </div>
                                        ))}
                                    {brandSuggestions.filter(brand =>
                                        brand.toLowerCase().includes(formData.brand.toLowerCase())
                                    ).length === 0 && (
                                            <div className="px-4 py-2 text-sm text-gray-500">
                                                No suggestions found
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>

                        {/* Vehicle Model */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vehicle Model
                            </label>
                            <input
                                type="text"
                                name="vehicle_model"
                                value={formData.vehicle_model}
                                onChange={handleChange}
                                onFocus={() => setShowVehicleSuggestions(formData.vehicle_model.length > 0)}
                                onBlur={() => setTimeout(() => setShowVehicleSuggestions(false), 200)}
                                placeholder="e.g., Maruti Swift, Honda City"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                autoComplete="off"
                            />
                            {/* Suggestions Dropdown */}
                            {showVehicleSuggestions && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {vehicleSuggestions
                                        .filter(vehicle => vehicle.toLowerCase().includes(formData.vehicle_model.toLowerCase()))
                                        .map((vehicle, index) => (
                                            <div
                                                key={index}
                                                onClick={() => selectVehicleSuggestion(vehicle)}
                                                className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm"
                                            >
                                                {vehicle}
                                            </div>
                                        ))}
                                    {vehicleSuggestions.filter(vehicle =>
                                        vehicle.toLowerCase().includes(formData.vehicle_model.toLowerCase())
                                    ).length === 0 && (
                                            <div className="px-4 py-2 text-sm text-gray-500">
                                                No suggestions found
                                            </div>
                                        )}
                                </div>
                            )}
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