import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search as SearchIcon, ShoppingCart, AlertCircle, Tag, Hash } from 'lucide-react';

const ProductSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productStats, setProductStats] = useState({ totalSold: 0, revenue: 0, invoiceCount: 0 });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchInitialData = async () => {
        setLoading(true);

        // Fetch all invoice items to get unique products
        const { data: allItemsData } = await supabase
            .from('invoice_items')
            .select('*');

        // Extract unique products from all items
        const uniqueProducts = Array.from(
            new Map(allItemsData?.map(item => [item.product_name, item]) || []).values()
        );

        setProducts(uniqueProducts);
        setFilteredProducts(uniqueProducts);
        setLoading(false);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);

        if (!query.trim()) {
            setFilteredProducts(products);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = products.filter(p =>
            p.product_name.toLowerCase().includes(lowerQuery) ||
            p.hsn_code?.toLowerCase().includes(lowerQuery)
        );

        setFilteredProducts(filtered);
    };

    const handleProductClick = async (product) => {
        setSelectedProduct(product);
        setLoading(true);

        // Fetch all invoices that contain this product
        const { data: itemsData } = await supabase
            .from('invoice_items')
            .select('*, invoice:invoices(bill_date, mode_of_payment)')
            .eq('product_name', product.product_name);

        if (itemsData) {
            const totalSold = itemsData.reduce((sum, item) => sum + parseFloat(item.quantity), 0);
            const revenue = itemsData.reduce((sum, item) => sum + parseFloat(item.total_product), 0);
            const invoiceCount = new Set(itemsData.map(item => item.invoice_id)).size;

            setProductStats({ totalSold, revenue, invoiceCount });
        }

        setLoading(false);
    };

    return (
        <div className="bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Product Search</h1>

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by product name or HSN code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product List */}
                    <div className="lg:col-span-2">
                        {loading ? (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                                <p className="text-gray-600 text-lg">Loading...</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <ShoppingCart className="text-purple-600" size={24} />
                                    Products ({filteredProducts.length})
                                </h2>
                                <div className="space-y-3">
                                    {filteredProducts.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No products found</p>
                                    ) : (
                                        filteredProducts.map((product, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleProductClick(product)}
                                                className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all cursor-pointer"
                                            >
                                                <h3 className="font-semibold text-gray-900 mb-2">{product.product_name}</h3>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-600 flex items-center gap-1">
                                                            <Hash size={14} />
                                                            HSN: {product.hsn_code || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">GST: {product.gst_percentage}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600 flex items-center gap-1">
                                                            <Tag size={14} />
                                                            Rate: ₹{parseFloat(product.rate).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Qty: {product.quantity}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product Details Panel */}
                    <div className="space-y-6">
                        {selectedProduct ? (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold mb-4">Product Details</h2>
                                <div className="space-y-3 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-600">Product Name</p>
                                        <p className="font-semibold">{selectedProduct.product_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">HSN Code</p>
                                        <p className="font-semibold">{selectedProduct.hsn_code || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">GST Percentage</p>
                                        <p className="font-semibold">{selectedProduct.gst_percentage}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Base Rate</p>
                                        <p className="font-semibold">₹{parseFloat(selectedProduct.rate).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Statistics */}
                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="font-semibold mb-3">Sales Statistics</h3>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-purple-50 rounded-lg">
                                            <p className="text-sm text-gray-600">Total Quantity Sold</p>
                                            <p className="text-2xl font-bold text-purple-600">{productStats.totalSold}</p>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <p className="text-sm text-gray-600">Total Revenue</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                ₹{productStats.revenue.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-gray-600">Number of Invoices</p>
                                            <p className="text-2xl font-bold text-blue-600">{productStats.invoiceCount}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-purple-50 rounded-lg p-6 text-center">
                                <AlertCircle className="mx-auto text-purple-600 mb-3" size={48} />
                                <h3 className="font-semibold text-gray-900 mb-2">Select a Product</h3>
                                <p className="text-gray-600 text-sm">Click on a product to view details and statistics</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductSearch;