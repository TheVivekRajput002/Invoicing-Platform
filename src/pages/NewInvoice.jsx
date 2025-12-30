import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Save, CheckCircle, Building2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const InvoiceGenerator = () => {
    const [paymentMode, setPaymentMode] = useState('unpaid');
    const [gstin, setGstin] = useState('');
    const [searchingCustomer, setSearchingCustomer] = useState(false);
    const [customerFound, setCustomerFound] = useState(false);
    const [invoiceDate, setInvoiceDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [gstIncluded, setGstIncluded] = useState(false); // false = without GST, true = with GST

    // Refs for keyboard navigation
    const inputRefs = useRef({});

    // Helper function to set refs
    const setInputRef = (key, element) => {
        if (element) {
            inputRefs.current[key] = element;
        }
    };

    const [customerDetails, setCustomerDetails] = useState({
        customerName: '',
        customerAddress: '',
        vehicle: '',
        phoneNumber: ''
    });

    const [products, setProducts] = useState([
        {
            id: 1,
            serialNumber: 1,
            productName: '',
            hsnCode: '',
            quantity: '',
            rate: '',
            gstPercentage: '',
            totalAmount: 0
        }
    ]);

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Set default dates
        const today = new Date();
        const due = new Date(today);
        due.setDate(today.getDate() + 30);

        setInvoiceDate(today.toISOString().split('T')[0]);
        setDueDate(due.toISOString().split('T')[0]);
    }, []);

    // Auto-search customer by phone number
    useEffect(() => {
        const timer = setTimeout(() => {
            if (customerDetails.phoneNumber && customerDetails.phoneNumber.length >= 10) {
                searchCustomerByPhone(customerDetails.phoneNumber);
            } else {
                setCustomerFound(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [customerDetails.phoneNumber]);

    // Recalculate all product totals when GST toggle changes
    useEffect(() => {
        setProducts(prev => prev.map(product => ({
            ...product,
            totalAmount: calculateProductTotal(
                product.quantity,
                product.rate,
                product.gstPercentage,
                gstIncluded
            )
        })));
    }, [gstIncluded]);

    const searchCustomerByPhone = async (phoneNumber) => {
        setSearchingCustomer(true);
        setCustomerFound(false);

        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('phone_number', phoneNumber)
                .maybeSingle();

            if (!error && data) {
                setCustomerDetails({
                    customerName: data.name || '',
                    customerAddress: data.address || '',
                    vehicle: data.vehicle || '',
                    phoneNumber: data.phone_number
                });
                setCustomerFound(true);
            } else {
                setCustomerFound(false);
            }
        } catch (error) {
            console.error('Error searching customer:', error);
            setCustomerFound(false);
        } finally {
            setSearchingCustomer(false);
        }
    };

    const calculateProductTotal = (quantity, rate, gstPercentage, isGstIncluded) => {
        if (isGstIncluded) {
            // GST is included in the rate, so total is just quantity * rate
            return quantity * rate;
        } else {
            // GST needs to be added on top of the rate
            const baseAmount = quantity * rate;
            const gstAmount = (baseAmount * gstPercentage) / 100;
            return baseAmount + gstAmount;
        }
    };

    const handleCustomerChange = (field, value) => {
        setCustomerDetails(prev => ({
            ...prev,
            [field]: value
        }));

        if (field === 'phoneNumber') {
            if (value.length > 0 && value.length < 10) {
                setPhoneError('Phone number must be 10 digits');
            } else if (value.length > 10) {
                setPhoneError('Phone number cannot exceed 10 digits');
            } else {
                setPhoneError('');
            }
        }

        if (field !== 'phoneNumber' && customerFound) {
            setCustomerFound(false);
        }
    };

    const handleProductChange = (id, field, value) => {
        setProducts(prev => prev.map(product => {
            if (product.id === id) {
                const updated = { ...product, [field]: value };

                if (['quantity', 'rate', 'gstPercentage'].includes(field)) {
                    updated.totalAmount = calculateProductTotal(
                        field === 'quantity' ? value : updated.quantity,
                        field === 'rate' ? value : updated.rate,
                        field === 'gstPercentage' ? value : updated.gstPercentage,
                        gstIncluded
                    );
                }

                return updated;
            }
            return product;
        }));
    };

    const addProduct = () => {
        const newProduct = {
            id: Date.now(),
            serialNumber: products.length + 1,
            productName: '',
            hsnCode: '',
            quantity: 0,
            rate: 0,
            gstPercentage: 18,
            totalAmount: 0
        };
        setProducts([...products, newProduct]);
    };

    const removeProduct = (id) => {
        if (products.length > 1) {
            setProducts(products.filter(p => p.id !== id));
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

    const saveInvoice = async () => {
        setSaving(true);

        try {
            let customerId;

            const { data: existingCustomers, error: fetchError } = await supabase
                .from('customers')
                .select('id')
                .eq('phone_number', customerDetails.phoneNumber);

            if (fetchError) {
                throw new Error('Failed to check existing customer: ' + fetchError.message);
            }

            if (existingCustomers && existingCustomers.length > 0) {
                customerId = existingCustomers[0].id;
            } else {
                const { data: newCustomer, error: customerError } = await supabase
                    .from('customers')
                    .insert([
                        {
                            name: customerDetails.customerName,
                            phone_number: customerDetails.phoneNumber,
                            address: customerDetails.customerAddress,
                            vehicle: customerDetails.vehicle
                        }
                    ])
                    .select()
                    .single();

                if (customerError) {
                    throw customerError;
                }

                customerId = newCustomer.id;
            }

            if (!customerId) {
                throw new Error('Failed to get or create customer ID');
            }

            const { data: invoiceData, error: invoiceError } = await supabase
                .from('invoices')
                .insert([
                    {
                        invoice_number: `INV-${Date.now()}`,
                        customer_id: customerId,
                        bill_date: invoiceDate,
                        generated_by: 'system',
                        total_amount: calculateGrandTotal(),
                        mode_of_payment: paymentMode,
                        gstin: gstin
                    }
                ])
                .select()
                .single();

            if (invoiceError) {
                throw invoiceError;
            }

            const itemsToInsert = products.map(product => ({
                invoice_id: invoiceData.id,
                serial_number: product.serialNumber,
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

            if (itemsError) {
                throw itemsError;
            }

            alert('Invoice saved successfully!');

            // Reset form
            setCustomerDetails({
                customerName: '',
                customerAddress: '',
                vehicle: '',
                phoneNumber: ''
            });
            setProducts([{
                id: 1,
                serialNumber: 1,
                productName: '',
                hsnCode: '',
                quantity: 0,
                rate: 0,
                gstPercentage: 18,
                totalAmount: 0
            }]);
            setPaymentMode('unpaid');
            setGstin('');
            setCustomerFound(false);

        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('Error saving invoice: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e, currentKey, productId = null) => {
        if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();

            const keys = Object.keys(inputRefs.current);
            const currentIndex = keys.indexOf(currentKey);

            let nextIndex;
            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                nextIndex = currentIndex + 1;
            } else if (e.key === 'ArrowUp') {
                nextIndex = currentIndex - 1;
            }

            // Focus next/previous field if it exists
            if (nextIndex >= 0 && nextIndex < keys.length) {
                const nextKey = keys[nextIndex];
                inputRefs.current[nextKey]?.focus();
            }
        }

        // Tab through product fields horizontally with Arrow Right/Left
        if (productId && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
            e.preventDefault();

            const productFields = ['productName', 'hsnCode', 'quantity', 'rate', 'gstPercentage'];
            const currentField = currentKey.split('-')[1];
            const currentFieldIndex = productFields.indexOf(currentField);

            let nextFieldIndex;
            if (e.key === 'ArrowRight') {
                nextFieldIndex = Math.min(currentFieldIndex + 1, productFields.length - 1);
            } else {
                nextFieldIndex = Math.max(currentFieldIndex - 1, 0);
            }

            const nextKey = `${productId}-${productFields[nextFieldIndex]}`;
            inputRefs.current[nextKey]?.focus();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header Section - Company & Invoice Details */}
                    <div className="border-y-4 border-gray-800">
                        <h2 className="text-xl font-bold text-gray-800 my-6 text-center">TAX INVOICE</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                            {/* Left - Company Details */}
                            <div className="p-6 border-r-2 border-t-2  border-gray-300">
                                <div className="flex items-start gap-4">
                                    <div className="w-18 h-18 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Building2 size={34} className="text-gray-800" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-800">Shiv Shakti Automobile</h1>
                                        <p className="text-sm text-gray-600 mt-1">Near Bus Stand</p>
                                        <p className="text-sm text-gray-600">Vidisha, M.P.</p>
                                        <p className="text-sm text-gray-600 mt-1">GST: 23AYKPR3166N1ZV</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right - Invoice Details */}
                            <div className="p-6 bg-gray-50 border-t-2  border-gray-300">
                                <div className="space-y-2 mt-6">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-semibold text-gray-700">Invoice Date:</span>
                                        <input
                                            type="date"
                                            value={invoiceDate}
                                            onChange={(e) => setInvoiceDate(e.target.value)}
                                            className="text-sm px-2 py-1 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="flex justify-between mt-3">
                                        <span className="text-sm font-semibold text-gray-700 ">Invoice No:</span>
                                        <span className="text-sm text-gray-900 font-mono">INV-{Date.now()}</span>
                                    </div>
                                    {/* Due Date  */}
                                    {/* <div className="flex justify-between">
                                        <span className="text-sm font-semibold text-gray-700">Due Date:</span>
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="text-sm px-2 py-1 border border-gray-300 rounded"
                                        />
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Details Section */}
                    <div className="p-6 border-b-2 border-gray-300 bg-blue-50">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">BILL</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <input
                                        ref={(el) => setInputRef('phoneNumber', el)}
                                        type="tel"
                                        value={customerDetails.phoneNumber}
                                        onChange={(e) => handleCustomerChange('phoneNumber', e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, 'phoneNumber')}
                                        className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${phoneError
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300'
                                            }`}
                                        placeholder="10-digit phone number"
                                        maxLength="10"
                                    />
                                    {searchingCustomer && (
                                        <div className="absolute right-3 top-3">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                        </div>
                                    )}
                                    {customerFound && !searchingCustomer && !phoneError && (
                                        <div className="absolute right-3 top-3">
                                            <CheckCircle className="text-green-600" size={20} />
                                        </div>
                                    )}
                                </div>

                                {phoneError && (
                                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {phoneError}
                                    </p>
                                )}

                                {customerFound && !phoneError && (
                                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                                        <CheckCircle size={14} />
                                        Customer found! Details auto-filled.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Customer Name *
                                </label>
                                <input
                                    ref={(el) => setInputRef('customerName', el)}
                                    type="text"
                                    value={customerDetails.customerName}
                                    onChange={(e) => handleCustomerChange('customerName', e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, 'customerName')}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Customer name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Address
                                </label>
                                <input
                                    ref={(el) => setInputRef('customerAddress', el)}
                                    type="text"
                                    value={customerDetails.customerAddress}
                                    onChange={(e) => handleCustomerChange('customerAddress', e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, 'customerAddress')}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Customer address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Vehicle
                                </label>
                                <input
                                    ref={(el) => setInputRef('vehicle', el)}
                                    type="text"
                                    value={customerDetails.vehicle}
                                    onChange={(e) => handleCustomerChange('vehicle', e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, 'vehicle')}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Vehicle number"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    GSTIN
                                </label>
                                <input
                                    ref={(el) => setInputRef('gstin', el)}
                                    type="text"
                                    value={gstin}
                                    onChange={(e) => setGstin(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, 'gstin')}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Customer GSTIN number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Products Table Section */}
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">ITEMS</h3>

                        {/* Desktop Table View */}
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto border-2 border-gray-300 rounded-lg">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-800 text-white">
                                        <th className="px-4 py-3 text-left text-sm font-semibold w-16">S.No</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold min-w-[200px]">Product Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold w-32">HSN</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold w-24">Qty</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold w-32">
                                            <div className="flex flex-col items-end gap-1">
                                                <span>Rate</span>
                                                <button
                                                    onClick={() => setGstIncluded(!gstIncluded)}
                                                    className={`text-xs px-2 py-1 rounded transition-colors ${gstIncluded
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-gray-600 text-white'
                                                        }`}
                                                >
                                                    {gstIncluded ? 'With GST' : 'Without GST'}
                                                </button>
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold w-24">GST %</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold w-32">Amount</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold w-20">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, index) => (
                                        <tr key={product.id} className="border-b border-gray-300 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-center">{index + 1}</td>
                                            <td className="px-4 py-3">
                                                <input
                                                    ref={(el) => setInputRef(`${product.id}-productName`, el)}
                                                    type="text"
                                                    value={product.productName}
                                                    onChange={(e) => handleProductChange(product.id, 'productName', e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, `${product.id}-productName`, product.id)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="Product name"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    ref={(el) => setInputRef(`${product.id}-hsnCode`, el)}
                                                    type="text"
                                                    value={product.hsnCode}
                                                    onChange={(e) => handleProductChange(product.id, 'hsnCode', e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, `${product.id}-hsnCode`, product.id)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="HSN"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    ref={(el) => setInputRef(`${product.id}-quantity`, el)}
                                                    type="number"
                                                    value={product.quantity}
                                                    onChange={(e) => handleProductChange(product.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                    onKeyDown={(e) => handleKeyDown(e, `${product.id}-quantity`, product.id)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm text-center"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    ref={(el) => setInputRef(`${product.id}-rate`, el)}
                                                    type="number"
                                                    value={product.rate}
                                                    onChange={(e) => handleProductChange(product.id, 'rate', parseFloat(e.target.value) || 0)}
                                                    onKeyDown={(e) => handleKeyDown(e, `${product.id}-rate`, product.id)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm text-right"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    ref={(el) => setInputRef(`${product.id}-gstPercentage`, el)}
                                                    type="number"
                                                    value={product.gstPercentage}
                                                    onChange={(e) => handleProductChange(product.id, 'gstPercentage', parseFloat(e.target.value) || 0)}
                                                    onKeyDown={(e) => handleKeyDown(e, `${product.id}-gstPercentage`, product.id)}
                                                    disabled={gstIncluded}
                                                    className={`w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm text-center ${gstIncluded ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                                                        }`}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-right">
                                                ₹{product.totalAmount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => removeProduct(product.id)}
                                                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                                                    disabled={products.length === 1}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="md:hidden space-y-4">
                            {/* GST Toggle for Mobile */}
                            <div className="flex items-center justify-between p-4 bg-gray-800 text-white rounded-lg">
                                <span className="font-semibold">Rate includes GST:</span>
                                <button
                                    onClick={() => setGstIncluded(!gstIncluded)}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${gstIncluded
                                        ? 'bg-green-500'
                                        : 'bg-gray-600'
                                        }`}
                                >
                                    {gstIncluded ? 'Yes (With GST)' : 'No (Without GST)'}
                                </button>
                            </div>

                            {products.map((product, index) => (
                                <div key={product.id} className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-base font-bold text-gray-800">Item #{index + 1}</h4>
                                        <button
                                            onClick={() => removeProduct(product.id)}
                                            className="text-red-600 hover:text-red-800 p-2"
                                            disabled={products.length === 1}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                                            <input
                                                type="text"
                                                value={product.productName}
                                                onChange={(e) => handleProductChange(product.id, 'productName', e.target.value)}
                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="Product name"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">HSN Code</label>
                                                <input
                                                    type="text"
                                                    value={product.hsnCode}
                                                    onChange={(e) => handleProductChange(product.id, 'hsnCode', e.target.value)}
                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="HSN"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                                                <input
                                                    type="number"
                                                    value={product.quantity}
                                                    onChange={(e) => handleProductChange(product.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Rate (₹) {gstIncluded && <span className="text-xs text-green-600">(incl. GST)</span>}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={product.rate}
                                                    onChange={(e) => handleProductChange(product.id, 'rate', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">GST %</label>
                                                <input
                                                    type="number"
                                                    value={product.gstPercentage}
                                                    onChange={(e) => handleProductChange(product.id, 'gstPercentage', parseFloat(e.target.value) || 0)}
                                                    disabled={gstIncluded}
                                                    className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${gstIncluded ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t-2 border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-gray-700">Amount:</span>
                                                <span className="text-lg font-bold text-blue-600">₹{product.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addProduct}
                            className="mt-4 flex items-center px-4 py-2 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
                        >
                            <Plus className="w-5 h-5 mr-2" /> Add Item
                        </button>
                    </div>

                    {/* Total Section */}
                    <div className="p-6 bg-gray-50 border-t-2 border-gray-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Payment Mode */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Mode</label>
                                <select
                                    value={paymentMode}
                                    onChange={(e) => setPaymentMode(e.target.value)}
                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                                >
                                    <option value="unpaid">Unpaid</option>
                                    <option value="cash">Cash</option>
                                    <option value="online">Online</option>
                                </select>
                            </div>

                            {/* Totals */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                                    <span className="text-sm font-semibold text-gray-700">Subtotal:</span>
                                    <span className="text-base font-semibold text-gray-900">₹{calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                                    <span className="text-sm font-semibold text-gray-700">Total GST:</span>
                                    <span className="text-base font-semibold text-gray-900">₹{calculateTotalGST().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 bg-gray-800 text-white px-4 rounded-lg">
                                    <span className="text-lg font-bold">GRAND TOTAL:</span>
                                    <span className="text-2xl font-bold">₹{calculateGrandTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 bg-white border-t-2 border-gray-300">
                        <div className="flex justify-end">
                            <button
                                onClick={saveInvoice}
                                disabled={
                                    saving ||
                                    !customerDetails.customerName ||
                                    !customerDetails.phoneNumber ||
                                    phoneError ||
                                    customerDetails.phoneNumber.length !== 10
                                }
                                className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg shadow-lg"
                            >
                                <Save className="mr-2 w-5 h-5" />
                                {saving ? 'Saving Invoice...' : 'Save Invoice'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceGenerator;