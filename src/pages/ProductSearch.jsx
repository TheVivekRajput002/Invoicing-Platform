import React, { useState, useEffect } from 'react';
import { Search, Package, Filter, X, TrendingUp, AlertTriangle, Tag } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';


const ProductSearch = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const navigate = useNavigate();


    // Filter states
    const [filters, setFilters] = useState({
        searchQuery: '',
        brand: '',
        vehicle: '',
        hsn: '',
        minStock: '',
        maxStock: ''
    });

    // Get unique values for filter dropdowns
    const [filterOptions, setFilterOptions] = useState({
        brands: [],
        vehicles: [],
        hsnCodes: []
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, products]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('product_name');

            if (error) throw error;
            setProducts(data);
            console.log('Fetched products:', data);

            // Extract unique values for filters
            const brands = [...new Set(data.map(p => p.brand).filter(Boolean))];
            const vehicles = [...new Set(data.map(p => p.vehicle_model).filter(Boolean))];
            const hsnCodes = [...new Set(data.map(p => p.hsn_code).filter(Boolean))];

            setFilterOptions({ brands, vehicles, hsnCodes });
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...products];

        // Search query filter (searches across multiple fields)
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.product_name.toLowerCase().includes(query) ||
                p.brand?.toLowerCase().includes(query) ||
                p.vehicle_model?.toLowerCase().includes(query)
            );
        }

        // Brand filter
        if (filters.brand) {
            filtered = filtered.filter(p => p.brand === filters.brand);
        }

        // Vehicle filter
        if (filters.vehicle) {
            filtered = filtered.filter(p => p.vehicle_model === filters.vehicle);
        }

        // HSN filter
        if (filters.hsn) {
            filtered = filtered.filter(p => p.hsn_code === filters.hsn);
        }

        // Stock range filter
        if (filters.minStock) {
            filtered = filtered.filter(p => p.current_stock >= parseInt(filters.minStock));
        }
        if (filters.maxStock) {
            filtered = filtered.filter(p => p.current_stock <= parseInt(filters.maxStock));
        }

        setFilteredProducts(filtered);
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            searchQuery: '',
            brand: '',
            vehicle: '',
            hsn: '',
            minStock: '',
            maxStock: ''
        });
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== '');

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

            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Package className="text-purple-600" size={32} />
                        Product Search & Inventory
                    </h1>
                </div>

                {/* Search and Filters Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    {/* Main Search Bar */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, product ID, brand, or vehicle..."
                            value={filters.searchQuery}
                            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Advanced Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Brand Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                            <select
                                value={filters.brand}
                                onChange={(e) => handleFilterChange('brand', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Brands</option>
                                {filterOptions.brands.map(brand => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                            </select>
                        </div>

                        {/* Vehicle Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                            <select
                                value={filters.vehicle}
                                onChange={(e) => handleFilterChange('vehicle', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Vehicles</option>
                                {filterOptions.vehicles.map(vehicle => (
                                    <option key={vehicle} value={vehicle}>{vehicle}</option>
                                ))}
                            </select>
                        </div>

                        {/* HSN Code Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
                            <input
                                type="text"
                                placeholder="Enter HSN code"
                                value={filters.hsn}
                                onChange={(e) => handleFilterChange('hsn', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Clear Filters Button */}
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                disabled={!hasActiveFilters}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <X size={18} />
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Stock Range Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
                            <input
                                type="number"
                                placeholder="Minimum stock"
                                value={filters.minStock}
                                onChange={(e) => handleFilterChange('minStock', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Stock</label>
                            <input
                                type="number"
                                placeholder="Maximum stock"
                                value={filters.maxStock}
                                onChange={(e) => handleFilterChange('maxStock', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Filter className="text-purple-600" size={24} />
                                    Products ({filteredProducts.length})
                                </h2>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading products...</p>
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="mx-auto text-gray-400 mb-3" size={48} />
                                    <p className="text-gray-500">No products found</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                    {filteredProducts.map((product) => {
                                        const isLowStock = product.current_stock <= product.minimum_stock;
                                        const profitMargin = product.base_rate - product.purchase_rate;

                                        return (
                                            <div
                                                key={product.id}
                                                onClick={() => setSelectedProduct(product)}
                                                className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedProduct?.id === product.id
                                                    ? 'border-purple-500 bg-purple-50 shadow-md'
                                                    : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                                                    } ${isLowStock ? 'border-l-4 border-l-orange-500' : ''}`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900">{product.product_name}</h3>
                                                        <p className="text-sm text-gray-500">SKU: {product.id}</p>
                                                    </div>
                                                    {isLowStock && (
                                                        <AlertTriangle className="text-orange-500" size={20} />
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <p className="text-gray-600">Brand: <span className="font-medium">{product.brand || 'N/A'}</span></p>
                                                        <p className="text-gray-600">Vehicle: <span className="font-medium">{product.vehicle_model || 'N/A'}</span></p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">HSN: <span className="font-medium">{product.hsn_code}</span></p>
                                                        <p className="text-gray-600">GST: <span className="font-medium">{product.gst_rate}%</span></p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                                                    <div className="flex items-center gap-4">
                                                        <p className="text-sm">
                                                            <span className="text-gray-600">Stock:</span>
                                                            <span className={`ml-1 font-semibold ${isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
                                                                {product.current_stock}
                                                            </span>
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-gray-600">Price:</span>
                                                            <span className="ml-1 font-semibold text-purple-600">₹{product.base_rate.toLocaleString()}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Details Panel */}
                    <div>
                        {selectedProduct ? (
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Tag className="text-purple-600" size={24} />
                                    Product Details
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Product Name</p>
                                        <p className="font-semibold text-lg">{selectedProduct.product_name}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">

                                        <div>
                                            <p className="text-sm text-gray-600">Brand</p>
                                            <p className="font-medium">{selectedProduct.brand || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Vehicle Model</p>
                                        <p className="font-medium">{selectedProduct.vehicle_model || 'N/A'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">HSN Code</p>
                                            <p className="font-medium">{selectedProduct.hsn_code}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">GST Rate</p>
                                            <p className="font-medium">{selectedProduct.gst_rate}%</p>
                                        </div>
                                    </div>

                                    {/* Pricing Section */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <h3 className="font-semibold mb-3">Pricing</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Purchase Rate:</span>
                                                <span className="font-medium">₹{selectedProduct.purchase_rate.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Selling Rate:</span>
                                                <span className="font-medium">₹{selectedProduct.base_rate.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Discount:</span>
                                                <span className="font-medium">{selectedProduct.discount}%</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t border-gray-200">
                                                <span className="text-gray-600">Profit Margin:</span>
                                                <span className="font-bold text-green-600">
                                                    ₹{(selectedProduct.base_rate - selectedProduct.purchase_rate).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stock Section */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <h3 className="font-semibold mb-3">Stock Status</h3>
                                        <div className="space-y-3">
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Current Stock</p>
                                                <p className="text-2xl font-bold text-blue-600">{selectedProduct.current_stock}</p>
                                            </div>
                                            <div className="p-3 bg-orange-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Minimum Stock</p>
                                                <p className="text-2xl font-bold text-orange-600">{selectedProduct.minimum_stock}</p>
                                            </div>
                                            {selectedProduct.current_stock <= selectedProduct.minimum_stock && (
                                                <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2">
                                                    <AlertTriangle className="text-red-600" size={20} />
                                                    <p className="text-sm font-medium text-red-600">Low stock alert!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-purple-50 rounded-lg p-8 text-center sticky top-6">
                                <Package className="mx-auto text-purple-600 mb-3" size={48} />
                                <h3 className="font-semibold text-gray-900 mb-2">Select a Product</h3>
                                <p className="text-gray-600 text-sm">Click on a product to view detailed information</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductSearch;