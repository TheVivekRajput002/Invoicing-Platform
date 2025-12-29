import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Building2, Edit2, Save, X, Plus, Trash2, ArrowLeft } from 'lucide-react';

const InvoiceViewEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [invoice, setInvoice] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [products, setProducts] = useState([]);

    // Store original data for cancel functionality
    const [originalData, setOriginalData] = useState({
        invoice: null,
        products: []
    });

    useEffect(() => {
        fetchInvoiceData();
    }, [id]);

    const fetchInvoiceData = async () => {
        setLoading(true);

        try {
            // Fetch invoice with customer details
            const { data: invoiceData, error: invoiceError } = await supabase
                .from('invoices')
                .select('*, customer:customers(*)')
                .eq('id', id)
                .single();

            if (invoiceError) throw invoiceError;

            setInvoice(invoiceData);
            setCustomer(invoiceData.customer);

            // Fetch invoice items
            const { data: itemsData, error: itemsError } = await supabase
                .from('invoice_items')
                .select('*')
                .eq('invoice_id', id)
                .order('serial_number', { ascending: true });

            if (itemsError) throw itemsError;

            const formattedProducts = itemsData.map((item, index) => ({
                id: item.id,
                serialNumber: index + 1,
                productName: item.product_name,
                hsnCode: item.hsn_code,
                quantity: item.quantity,
                rate: item.rate,
                gstPercentage: item.gst_percentage,
                totalAmount: item.total_product
            }));

            setProducts(formattedProducts);

            // Store original data for cancel
            setOriginalData({
                invoice: { ...invoiceData },
                products: JSON.parse(JSON.stringify(formattedProducts))
            });

        } catch (error) {
            console.error('Error loading invoice:', error);
            alert('Error loading invoice: ' + error.message);
            navigate('/billing/invoice/search');
        } finally {
            setLoading(false);
        }
    };

    const calculateProductTotal = (quantity, rate, gstPercentage) => {
        const baseAmount = quantity * rate;
        const gstAmount = (baseAmount * gstPercentage) / 100;
        return baseAmount + gstAmount;
    };

    const handleProductChange = (productId, field, value) => {
        setProducts(prev => prev.map(product => {
            if (product.id === productId) {
                const updated = { ...product, [field]: value };

                if (['quantity', 'rate', 'gstPercentage'].includes(field)) {
                    updated.totalAmount = calculateProductTotal(
                        field === 'quantity' ? value : updated.quantity,
                        field === 'rate' ? value : updated.rate,
                        field === 'gstPercentage' ? value : updated.gstPercentage
                    );
                }

                return updated;
            }
            return product;
        }));
    };

    const addProduct = () => {
        const newProduct = {
            id: 'new_' + Date.now(),
            serialNumber: products.length + 1,
            productName: '',
            hsnCode: '',
            quantity: 0,
            rate: 0,
            gstPercentage: 18,
            totalAmount: 0,
            isNew: true
        };
        setProducts([...products, newProduct]);
    };

    const removeProduct = (productId) => {
        if (products.length > 1) {
            setProducts(products.filter(p => p.id !== productId));
        } else {
            alert('Invoice must have at least one product');
        }
    };

    const calculateSubtotal = () => {
        return products.reduce((sum, product) => {
            const base = product.quantity * product.rate;
            return sum + base;
        }, 0);
    };

    const calculateTotalGST = () => {
        return products.reduce((sum, product) => {
            const base = product.quantity * product.rate;
            const gst = (base * product.gstPercentage) / 100;
            return sum + gst;
        }, 0);
    };

    const calculateGrandTotal = () => {
        return products.reduce((sum, product) => sum + product.totalAmount, 0);
    };

    const handleSave = async () => {
        setSaving(true);

        try {
            const grandTotal = calculateGrandTotal();

            // Update invoice
            const { error: invoiceError } = await supabase
                .from('invoices')
                .update({
                    bill_date: invoice.bill_date,
                    mode_of_payment: invoice.mode_of_payment,
                    total_amount: grandTotal
                })
                .eq('id', id);

            if (invoiceError) throw invoiceError;

            // Delete all existing invoice items
            const { error: deleteError } = await supabase
                .from('invoice_items')
                .delete()
                .eq('invoice_id', id);

            if (deleteError) throw deleteError;

            // Insert updated products
            const itemsToInsert = products.map((product, index) => ({
                invoice_id: id,
                serial_number: index + 1,
                product_name: product.productName,
                hsn_code: product.hsnCode,
                quantity: product.quantity,
                rate: product.rate,
                gst_percentage: product.gstPercentage,
                total_product: product.totalAmount
            }));

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            alert('Invoice updated successfully!');
            setIsEditMode(false);
            fetchInvoiceData(); // Refresh data

        } catch (error) {
            console.error('Error updating invoice:', error);
            alert('Error updating invoice: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // Restore original data
        setInvoice({ ...originalData.invoice });
        setProducts(JSON.parse(JSON.stringify(originalData.products)));
        setIsEditMode(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading invoice...</p>
                </div>
            </div>
        );
    }

    if (!invoice) return null;

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Action Buttons Bar */}
                <div className="mb-4 flex justify-between items-center">
                    <button
                        onClick={() => navigate('/billing/invoice/search')}
                        className="flex items-center px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 shadow"
                    >
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back to Search
                    </button>

                    {!isEditMode ? (
                        <button
                            onClick={() => setIsEditMode(true)}
                            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
                        >
                            <Edit2 className="mr-2 w-4 h-4" /> Edit Invoice
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                className="flex items-center px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <X className="mr-2 w-4 h-4" /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <Save className="mr-2 w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Invoice Layout */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header Section */}
                    <div className="border-b-4 border-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                            {/* Company Details */}
                            <div className="p-6 border-r-2 border-gray-300">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Building2 size={32} className="text-gray-800" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-800">Shiv Shakti Automobile</h1>
                                        <p className="text-sm text-gray-600 mt-1">Vidisha, New Bus Stand</p>
                                        <p className="text-sm text-gray-600">Madhya Pradesh, India</p>
                                    </div>
                                </div>
                            </div>

                            {/* Invoice Details */}
                            <div className="p-6 bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">TAX INVOICE</h2>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-semibold text-gray-700">Invoice No:</span>
                                        <span className="text-sm text-gray-900 font-mono">{invoice.invoice_number}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-700">Invoice Date:</span>
                                        {isEditMode ? (
                                            <input
                                                type="date"
                                                value={invoice.bill_date}
                                                onChange={(e) => setInvoice({ ...invoice, bill_date: e.target.value })}
                                                className="text-sm px-2 py-1 border border-gray-300 rounded"
                                            />
                                        ) : (
                                            <span className="text-sm text-gray-900">{formatDate(invoice.bill_date)}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-semibold text-gray-700">Created At:</span>
                                        <span className="text-sm text-gray-900">
                                            {new Date(invoice.created_at).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Details Section */}
                    <div className="p-6 border-b-2 border-gray-300 bg-blue-50">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">BILL TO</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                                <div className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-900">
                                    {customer?.phone_number || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Customer Name</label>
                                <div className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-900">
                                    {customer?.name || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                                <div className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-900">
                                    {customer?.address || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Number</label>
                                <div className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-900">
                                    {customer?.vehicle || 'N/A'}
                                </div>
                            </div>
                            {invoice.gstin && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">GSTIN</label>
                                    <div className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-900">
                                        {invoice.gstin}
                                    </div>
                                </div>
                            )}
                        </div>
                        {!isEditMode && (
                            <p className="text-xs text-gray-500 mt-3">
                                * Customer details cannot be edited from here
                            </p>
                        )}
                    </div>

                    {/* Products Section */}
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">ITEMS</h3>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto border-2 border-gray-300 rounded-lg">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-800 text-white">
                                        <th className="px-4 py-3 text-left text-sm font-semibold w-16">S.No</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold min-w-[200px]">Product Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold w-32">HSN</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold w-24">Qty</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold w-32">Rate</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold w-24">GST %</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold w-32">Amount</th>
                                        {isEditMode && <th className="px-4 py-3 text-center text-sm font-semibold w-20">Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, index) => (
                                        <tr key={product.id} className="border-b border-gray-300 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-center">{index + 1}</td>
                                            <td className="px-4 py-3">
                                                {isEditMode ? (
                                                    <input
                                                        type="text"
                                                        value={product.productName}
                                                        onChange={(e) => handleProductChange(product.id, 'productName', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                ) : (
                                                    <span className="text-sm">{product.productName}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isEditMode ? (
                                                    <input
                                                        type="text"
                                                        value={product.hsnCode}
                                                        onChange={(e) => handleProductChange(product.id, 'hsnCode', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                ) : (
                                                    <span className="text-sm">{product.hsnCode}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isEditMode ? (
                                                    <input
                                                        type="number"
                                                        value={product.quantity}
                                                        onChange={(e) => handleProductChange(product.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm text-center"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-center block">{product.quantity}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isEditMode ? (
                                                    <input
                                                        type="number"
                                                        value={product.rate}
                                                        onChange={(e) => handleProductChange(product.id, 'rate', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm text-right"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-right block">₹{parseFloat(product.rate).toFixed(2)}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isEditMode ? (
                                                    <input
                                                        type="number"
                                                        value={product.gstPercentage}
                                                        onChange={(e) => handleProductChange(product.id, 'gstPercentage', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm text-center"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-center block">{product.gstPercentage}%</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-right">
                                                ₹{parseFloat(product.totalAmount).toFixed(2)}
                                            </td>
                                            {isEditMode && (
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => removeProduct(product.id)}
                                                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                                                        disabled={products.length === 1}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4">
                            {products.map((product, index) => (
                                <div key={product.id} className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-base font-bold text-gray-800">Item #{index + 1}</h4>
                                        {isEditMode && (
                                            <button
                                                onClick={() => removeProduct(product.id)}
                                                className="text-red-600 hover:text-red-800 p-2"
                                                disabled={products.length === 1}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={product.productName}
                                                    onChange={(e) => handleProductChange(product.id, 'productName', e.target.value)}
                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <div className="px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
                                                    {product.productName}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">HSN Code</label>
                                                {isEditMode ? (
                                                    <input
                                                        type="text"
                                                        value={product.hsnCode}
                                                        onChange={(e) => handleProductChange(product.id, 'hsnCode', e.target.value)}
                                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <div className="px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
                                                        {product.hsnCode}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                                                {isEditMode ? (
                                                    <input
                                                        type="number"
                                                        value={product.quantity}
                                                        onChange={(e) => handleProductChange(product.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <div className="px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
                                                        {product.quantity}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Rate (₹)</label>
                                                {isEditMode ? (
                                                    <input
                                                        type="number"
                                                        value={product.rate}
                                                        onChange={(e) => handleProductChange(product.id, 'rate', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <div className="px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
                                                        ₹{parseFloat(product.rate).toFixed(2)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">GST %</label>
                                                {isEditMode ? (
                                                    <input
                                                        type="number"
                                                        value={product.gstPercentage}
                                                        onChange={(e) => handleProductChange(product.id, 'gstPercentage', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <div className="px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
                                                        {product.gstPercentage}%
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t-2 border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-gray-700">Amount:</span>
                                                <span className="text-lg font-bold text-blue-600">
                                                    ₹{parseFloat(product.totalAmount).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {isEditMode && (
                            <button
                                onClick={addProduct}
                                className="mt-4 flex items-center px-4 py-2 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
                            >
                                <Plus className="w-5 h-5 mr-2" /> Add Item
                            </button>
                        )}
                    </div>

                    {/* Total Section */}
                    <div className="p-6 bg-gray-50 border-t-2 border-gray-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Payment Mode */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Mode</label>
                                {isEditMode ? (
                                    <select
                                        value={invoice.mode_of_payment}
                                        onChange={(e) => setInvoice({ ...invoice, mode_of_payment: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                                    >
                                        <option value="unpaid">Unpaid</option>
                                        <option value="cash">Cash</option>
                                        <option value="online">Online</option>
                                    </select>
                                ) : (
                                    <div className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg">
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                            invoice.mode_of_payment === 'cash' || invoice.mode_of_payment === 'online'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {invoice.mode_of_payment.toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                                    <span className="text-sm font-semibold text-gray-700">Subtotal:</span>
                                    <span className="text-base font-semibold text-gray-900">
                                        ₹{calculateSubtotal().toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                                    <span className="text-sm font-semibold text-gray-700">Total GST:</span>
                                    <span className="text-base font-semibold text-gray-900">
                                        ₹{calculateTotalGST().toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-3 bg-gray-800 text-white px-4 rounded-lg">
                                    <span className="text-lg font-bold">GRAND TOTAL:</span>
                                    <span className="text-2xl font-bold">
                                        ₹{calculateGrandTotal().toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceViewEdit;