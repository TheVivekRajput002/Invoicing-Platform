import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Save, CheckCircle, Building2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '../components/InvoicePDF';

const InvoiceGenerator = () => {
    const [paymentMode, setPaymentMode] = useState('unpaid');
    const [gstin, setGstin] = useState('');
    const [searchingCustomer, setSearchingCustomer] = useState(false);
    const [customerFound, setCustomerFound] = useState(false);
    const [invoiceDate, setInvoiceDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [gstIncluded, setGstIncluded] = useState(false); // false = without GST, true = with GST
    const [invoiceSaved, setInvoiceSaved] = useState(false);
    const [savedInvoiceData, setSavedInvoiceData] = useState(null);
    // NEW: Product search states
    const [productSearchResults, setProductSearchResults] = useState({});
    const [showProductDropdown, setShowProductDropdown] = useState({});
    const [searchingProduct, setSearchingProduct] = useState({});
    const [autoSavedProducts, setAutoSavedProducts] = useState(new Set());
    // Add a new state to track which products are from database
    const [productsFromDB, setProductsFromDB] = useState(new Set());



    // Refs for keyboard navigation
    const inputRefs = useRef({});

    // Helper function to set refs
    const setInputRef = (key, element) => {
        if (element) {
            inputRefs.current[key] = element;
        }
    };

    const navigate = useNavigate();

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

    // Add this helper function at the top of your component (after imports, before the component)
    const getISTDate = (daysOffset = 0) => {
        const now = new Date();
        // Convert to IST (UTC+5:30)
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(now.getTime() + istOffset);

        if (daysOffset !== 0) {
            istTime.setDate(istTime.getDate() + daysOffset);
        }

        return istTime.toISOString().split('T')[0];
    };

    useEffect(() => {
        setInvoiceDate(getISTDate(0)); // Today in IST
        setDueDate(getISTDate(30));     // 30 days from today in IST
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

    // Reset invoice saved state when user starts creating new invoice
    useEffect(() => {
        if (invoiceSaved && (
            customerDetails.phoneNumber ||
            customerDetails.customerName ||
            products.some(p => p.productName || p.quantity || p.rate)
        )) {
            setInvoiceSaved(false);
            setSavedInvoiceData(null);
        }
    }, [customerDetails, products]);

    const searchCustomerByPhone = async (phoneNumber) => {
        if (!phoneNumber || phoneNumber.length !== 10) {
            setCustomerFound(false);
            return;
        }

        setSearchingCustomer(true);
        setCustomerFound(false);

        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('phone_number', phoneNumber)
                .order('created_at', { ascending: false }) // Get most recent first
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('Search error:', error);
                setCustomerFound(false);
                return;
            }

            if (data) {
                setCustomerDetails({
                    customerName: data.name || '',
                    customerAddress: data.address || '',
                    vehicle: data.vehicle || '',
                    phoneNumber: data.phone_number
                });
                setCustomerFound(true);
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

    // Fetch products for autocomplete
    const searchProductsFromDB = async (searchQuery, productId) => {
        if (!searchQuery || searchQuery.length < 2) {
            setProductSearchResults(prev => ({ ...prev, [productId]: [] }));
            return;
        }

        setSearchingProduct(prev => ({ ...prev, [productId]: true }));

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .or(`product_name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
                .limit(10);

            if (error) throw error;

            setProductSearchResults(prev => ({
                ...prev,
                [productId]: data || []
            }));
        } catch (error) {
            console.error('Error searching products:', error);
            setProductSearchResults(prev => ({ ...prev, [productId]: [] }));
        } finally {
            setSearchingProduct(prev => ({ ...prev, [productId]: false }));
        }
    };

    // Debounced product search
    useEffect(() => {
        const timers = {};

        products.forEach(product => {
            if (product.productName && product.productName.length >= 2) {
                timers[product.id] = setTimeout(() => {
                    searchProductsFromDB(product.productName, product.id);
                }, 300);
            }
        });

        return () => {
            Object.values(timers).forEach(timer => clearTimeout(timer));
        };
    }, [products.map(p => p.productName).join(',')]);

    // Add this useEffect after your existing useEffects
    // REPLACE the existing useEffect (around line 235) with this:
    useEffect(() => {
        const checkAndSaveNewProducts = async () => {
            for (const product of products) {
                const isComplete = product.productName && product.hsnCode && product.rate;
                const isFromDB = productsFromDB.has(product.id);
                const alreadySaved = autoSavedProducts.has(product.productName + product.hsnCode);

                if (isComplete && !isFromDB && !alreadySaved) {
                    await autoSaveNewProduct(product);
                }
            }
        };

        const timer = setTimeout(() => {
            checkAndSaveNewProducts();
        }, 1000);

        return () => clearTimeout(timer);
    }, [products]); // SIMPLIFIED - only watch products

    // Modify handleProductSelect
    const handleProductSelect = (productId, selectedProduct) => {
        setProducts(prev => prev.map(product => {
            if (product.id === productId) {
                const updated = {
                    ...product,
                    productName: selectedProduct.product_name,
                    hsnCode: selectedProduct.hsn_code,
                    rate: selectedProduct.base_rate,
                    gstPercentage: selectedProduct.gst_rate || 18
                };

                updated.totalAmount = calculateProductTotal(
                    updated.quantity,
                    updated.rate,
                    updated.gstPercentage,
                    gstIncluded
                );

                return updated;
            }
            return product;
        }));

        // Mark this product as from database (so we don't auto-save it)
        setProductsFromDB(prev => new Set([...prev, productId]));
        setShowProductDropdown(prev => ({ ...prev, [productId]: false }));

        setTimeout(() => {
            inputRefs.current[`${productId}-productName`]?.focus();
        }, 0);
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

                // Show dropdown for product name search
                if (field === 'productName') {
                    setShowProductDropdown(prev => ({
                        ...prev,
                        [id]: value.length >= 2
                    }));
                }

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
        if (gstIncluded) {
            return 0; // When GST is included in rate, don't show separate GST
        }
        return products.reduce((sum, product) => {
            const base = product.quantity * product.rate;
            const gst = (base * product.gstPercentage) / 100;
            return sum + gst;
        }, 0);
    };

    const calculateGrandTotal = () => {
        return products.reduce((sum, product) => sum + product.totalAmount, 0);
    };

    const autoSaveNewProduct = async (product) => {
        if (!product.productName || !product.hsnCode || !product.rate) {
            return;
        }

        // Create unique key for this product
        const productKey = product.productName + product.hsnCode;

        // Check if already saved
        if (autoSavedProducts.has(productKey)) {
            return;
        }

        try {
            // Check if product already exists in database
            const { data: existing, error: searchError } = await supabase
                .from('products')
                .select('id')
                .eq('product_name', product.productName)
                .eq('hsn_code', product.hsnCode)
                .maybeSingle();

            if (searchError) throw searchError;

            if (existing) {
                console.log('Product already exists in DB:', product.productName);
                return;
            }

            // Insert new product
            const { data: newProduct, error: insertError } = await supabase
                .from('products')
                .insert([{
                    product_name: product.productName,
                    hsn_code: product.hsnCode,
                    base_rate: product.rate,
                    purchase_rate: product.rate * 0.8,
                    gst_rate: product.gstPercentage,
                    current_stock: 0,
                    minimum_stock: 5,
                    brand: '', // You can add brand field if needed
                    vehicle_model: '' // You can add vehicle field if needed
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            console.log('✅ New product auto-saved to inventory:', product.productName);

            // Mark as saved
            setAutoSavedProducts(prev => new Set([...prev, productKey]));

            // Optional: Show success message
            // alert(`New product "${product.productName}" added to inventory!`);

        } catch (error) {
            console.error('Error auto-saving product:', error);
        }
    };

    // Deduct stock for sold products
    const deductStockForProducts = async (productsToDeduct) => {
        try {
            for (const product of productsToDeduct) {
                // Only deduct if product exists in database (has valid product name, hsn, rate)
                if (!product.productName || !product.hsnCode || !product.rate) {
                    continue;
                }

                // Find the product in database by name and HSN code
                const { data: existingProduct, error: fetchError } = await supabase
                    .from('products')
                    .select('id, current_stock')
                    .eq('product_name', product.productName)
                    .eq('hsn_code', product.hsnCode)
                    .maybeSingle();

                if (fetchError) {
                    console.error('Error fetching product for stock deduction:', fetchError);
                    continue;
                }

                if (existingProduct) {
                    // Calculate new stock (prevent negative stock)
                    const newStock = Math.max(0, existingProduct.current_stock - product.quantity);

                    // Update stock in database
                    const { error: updateError } = await supabase
                        .from('products')
                        .update({ current_stock: newStock })
                        .eq('id', existingProduct.id);

                    if (updateError) {
                        console.error('Error updating stock for product:', product.productName, updateError);
                    } else {
                        console.log(`Stock updated for ${product.productName}: ${existingProduct.current_stock} → ${newStock}`);
                    }
                }
            }
        } catch (error) {
            console.error('Error in stock deduction process:', error);
        }
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

            await deductStockForProducts(products);

            // Store saved data for PDF generation
            setSavedInvoiceData({
                invoice: invoiceData,
                customer: {
                    name: customerDetails.customerName,
                    phone_number: customerDetails.phoneNumber,
                    address: customerDetails.customerAddress,
                    vehicle: customerDetails.vehicle
                },
                products: products
            });
            setInvoiceSaved(true);

            alert('Invoice saved successfully! You can now download the PDF.');

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
        // For number inputs (quantity, rate, gstPercentage), allow up/down to increase/decrease
        const isNumberField = currentKey.includes('quantity') ||
            currentKey.includes('rate') ||
            currentKey.includes('gstPercentage');

        if (isNumberField && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            e.preventDefault();
            const input = inputRefs.current[currentKey];
            const currentValue = parseFloat(input.value) || 0;
            const step = currentKey.includes('gstPercentage') ? 1 : (currentKey.includes('quantity') ? 1 : 10);

            if (e.key === 'ArrowUp') {
                input.value = currentValue + step;
            } else {
                input.value = Math.max(0, currentValue - step);
            }

            // Trigger onChange event
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
            return;
        }

        // Navigation with Enter, Left, Right arrows
        // Navigation with Enter, Left, Right arrows
        if (e.key === 'Enter' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();

            const keys = Object.keys(inputRefs.current);
            const currentIndex = keys.indexOf(currentKey);

            let nextIndex;
            if (e.key === 'Enter' || e.key === 'ArrowRight') {
                nextIndex = currentIndex + 1;

                // Skip GST percentage field if it's disabled
                if (nextIndex < keys.length) {
                    const nextKey = keys[nextIndex];
                    if (nextKey.includes('gstPercentage') && gstIncluded) {
                        nextIndex = currentIndex + 2; // Skip to the next field after GST
                    }
                }
            } else if (e.key === 'ArrowLeft') {
                nextIndex = currentIndex - 1;

                // Skip GST percentage field if it's disabled
                if (nextIndex >= 0) {
                    const prevKey = keys[nextIndex];
                    if (prevKey.includes('gstPercentage') && gstIncluded) {
                        nextIndex = currentIndex - 2; // Skip back one more field
                    }
                }
            }

            // Focus next/previous field if it exists
            if (nextIndex >= 0 && nextIndex < keys.length) {
                const nextKey = keys[nextIndex];
                inputRefs.current[nextKey]?.focus();
            } else if (e.key === 'Enter' && nextIndex >= keys.length) {
                // If we're at the end and user presses Enter, add new product
                addProduct();
                setTimeout(() => {
                    const newProductKey = Object.keys(inputRefs.current).find(key =>
                        key.includes(`-productName`) &&
                        !keys.includes(key)
                    );
                    if (newProductKey) {
                        inputRefs.current[newProductKey]?.focus();
                    }
                }, 100);
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

    // Add keyboard shortcut: Ctrl+Enter or Cmd+Enter to add new product row
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                addProduct();
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [products]);

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/billing')}
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

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">


                    {/* Header Section - Company & Invoice Details */}
                    <div className="border-y-4 border-gray-800">
                        <h2 className="text-xl font-bold text-gray-800 my-6 text-center">TAX INVOICE</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                            {/* Left - Company Details */}
                            <div className="p-6 border-r-2 border-t-2  border-gray-300 ml-1">
                                <div className="flex items-start gap-4">
                                    <div className="w-18 h-18 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Building2 size={34} className="text-gray-800" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-800">Shiv Shakti Automobile</h1>
                                        <p className="text-sm text-gray-600 mt-1">Near new Bus Stand, Vidisha, M.P.</p>
                                        <p className="text-sm text-gray-600">Mobile No. - 9993646020</p>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <input
                                        ref={(el) => setInputRef('phoneNumber', el)}

                                        type="tel"
                                        value={customerDetails.phoneNumber}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            handleCustomerChange('phoneNumber', value);
                                        }}
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
                                    Vehicle / Mechanic
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
                    <div className="p-6 max-md:py-3 max-md:px-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">ITEMS</h3>

                        <div>
                            <div className="border-2 border-gray-300 rounded-lg" style={{ overflow: 'visible' }}>
                                <table className="w-full" style={{ overflow: 'visible' }}>
                                    <thead>
                                        <tr className="bg-gray-800 text-white">
                                            <th className="px-3 py-3 text-left text-sm font-semibold w-10">S.No</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold min-w-[200px] max-md:min-w-[150px]">Product Name</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold w-32">HSN</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold w-24">Qty</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold w-32 max-md:w-30">
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
                                            <th className="px-4 py-3 text-center text-sm font-semibold w-12"></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {products.map((product, index) => (
                                            <tr key={product.id} className="border-b border-gray-300 hover:bg-gray-50">
                                                <td className="px-2 py-3 text-sm text-center max-md:px-1">{index + 1}</td>
                                                <td className="px-2 py-3 max-md:px-1" style={{ position: 'relative' }}>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            ref={(el) => setInputRef(`${product.id}-productName`, el)}
                                                            type="text"
                                                            value={product.productName}
                                                            onChange={(e) => handleProductChange(product.id, 'productName', e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(e, `${product.id}-productName`, product.id)}
                                                            onBlur={() => {
                                                                setTimeout(() => {
                                                                    setShowProductDropdown(prev => ({ ...prev, [product.id]: false }));
                                                                }, 200);
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                                            placeholder="Start typing product name..."
                                                        />

                                                        {/* Dropdown - FIXED positioning */}
                                                        {showProductDropdown[product.id] && productSearchResults[product.id]?.length > 0 && (
                                                            <div
                                                                className="absolute bg-white border-2 border-gray-300 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
                                                                style={{
                                                                    width: '100%',
                                                                    top: 'calc(100% + 4px)',  // Position just below the input
                                                                    left: 0,
                                                                    zIndex: 9999
                                                                }}
                                                            >
                                                                {productSearchResults[product.id].map((item) => (
                                                                    <div
                                                                        key={item.id}
                                                                        onMouseDown={(e) => {
                                                                            e.preventDefault();  // Prevents input blur
                                                                            handleProductSelect(product.id, item);
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
                                                        {searchingProduct[product.id] && (
                                                            <div className="absolute right-3 top-3">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-3 max-md:px-1">
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
                                                <td className="px-2 py-3 max-md:px-1">
                                                    <input
                                                        ref={(el) => setInputRef(`${product.id}-quantity`, el)}
                                                        type="number"
                                                        value={product.quantity}
                                                        onChange={(e) => handleProductChange(product.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                        onKeyDown={(e) => handleKeyDown(e, `${product.id}-quantity`, product.id)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm text-center"
                                                    />
                                                </td>
                                                <td className="px-2 py-3 max-md:px-1">
                                                    <input
                                                        ref={(el) => setInputRef(`${product.id}-rate`, el)}
                                                        type="number"
                                                        value={product.rate}
                                                        onChange={(e) => handleProductChange(product.id, 'rate', parseFloat(e.target.value) || 0)}
                                                        onKeyDown={(e) => handleKeyDown(e, `${product.id}-rate`, product.id)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm text-right"
                                                    />
                                                </td>
                                                <td className="px-2 py-3 max-md:px-1">
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
                                                <td className="px-2 py-3 text-sm font-semibold text-right max-md:px-1">
                                                    ₹{product.totalAmount.toFixed(2)}
                                                </td>
                                                <td className="px-2 py-3 text-center max-md:px-1">
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
                        <div className=" space-y-6 flex flex-col items-end">

                            {/* Totals */}
                            <div className="space-y-2 w-[50%]">
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
                            {/* Payment Mode */}
                            <div className=' w-[60%]'>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Mode</label>
                                <select
                                    value={paymentMode}
                                    onChange={(e) => setPaymentMode(e.target.value)}
                                    className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 font-medium transition-colors ${paymentMode === 'unpaid'
                                        ? 'border-red-300 bg-red-50 text-red-700 focus:ring-red-500'
                                        : paymentMode === 'cash'
                                            ? 'border-green-300 bg-green-50 text-green-700 focus:ring-green-500'
                                            : 'border-blue-300 bg-blue-50 text-blue-700 focus:ring-blue-500'
                                        }`}
                                >
                                    <option value="unpaid">Unpaid</option>
                                    <option value="cash">Cash</option>
                                    <option value="online">Online</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 bg-white border-t-2 border-gray-300">
                        <div className="flex justify-end">
                            <div className="flex gap-3">
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

                                {invoiceSaved && savedInvoiceData && (
                                    <PDFDownloadLink
                                        document={
                                            <InvoicePDF
                                                invoice={savedInvoiceData.invoice}
                                                customer={savedInvoiceData.customer}
                                                products={savedInvoiceData.products}
                                            />
                                        }
                                        fileName={`Invoice-${savedInvoiceData.invoice.invoice_number}.pdf`}
                                        className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg shadow-lg"
                                    >
                                        {({ loading }) =>
                                            loading ? (
                                                <span className="flex items-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Generating PDF...
                                                </span>
                                            ) : (
                                                <span className="flex items-center">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Download PDF
                                                </span>
                                            )
                                        }
                                    </PDFDownloadLink>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceGenerator;