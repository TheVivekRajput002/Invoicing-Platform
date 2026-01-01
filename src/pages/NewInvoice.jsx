import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// Import custom hooks
import { useCustomerSearch } from '../hooks/useCustomerSearch';
import { useInvoiceCalculations } from '../hooks/useInvoiceCalculations';
import { useProductAutoSave } from '../hooks/useProductAutoSave';

// Import components
import InvoiceHeader from '../components/invoice/InvoiceHeader';
import CustomerDetailsForm from '../components/invoice/CustomerDetailsForm';
import ProductsTable from '../components/invoice/ProductsTable';
import InvoiceSummary from '../components/invoice/InvoiceSummary';

// pdf send
import { uploadInvoicePDF } from '../utils/uploadInvoicePDF';
import { sendInvoiceToWhatsApp } from '../utils/sendWhatsApp';
import InvoicePDF from '../components/InvoicePDF'; // Your existing PDF component

const InvoiceGenerator = () => {
    const navigate = useNavigate();
    const inputRefs = useRef({});

    // Date states
    const [invoiceDate, setInvoiceDate] = useState('');
    const [gstIncluded, setGstIncluded] = useState(false);
    const [paymentMode, setPaymentMode] = useState('unpaid');
    const [gstin, setGstin] = useState('');
    const [saving, setSaving] = useState(false);
    const [invoiceSaved, setInvoiceSaved] = useState(false);
    const [savedInvoiceData, setSavedInvoiceData] = useState(null);

    // Customer states
    const [customerDetails, setCustomerDetails] = useState({
        customerName: '',
        customerAddress: '',
        vehicle: '',
        phoneNumber: ''
    });
    const [phoneError, setPhoneError] = useState('');

    // Product states
    const [products, setProducts] = useState([{
        id: 1,
        serialNumber: 1,
        productName: '',
        hsnCode: '',
        quantity: 0,
        rate: 0,
        gstPercentage: 0,
        totalAmount: 0
    }]);
    const [productsFromDB, setProductsFromDB] = useState(new Set());
    const [productSearchResults, setProductSearchResults] = useState({});
    const [showProductDropdown, setShowProductDropdown] = useState({});
    const [searchingProduct, setSearchingProduct] = useState({});

    // Custom hooks
    const { searching: searchingCustomer, found: customerFound, customerData } = useCustomerSearch(customerDetails.phoneNumber);
    const { calculateProductTotal, subtotal, totalGST, grandTotal } = useInvoiceCalculations(products, gstIncluded);
    useProductAutoSave(products, productsFromDB);

    // Helper function for IST date
    const getISTDate = (daysOffset = 0) => {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(now.getTime() + istOffset);
        if (daysOffset !== 0) {
            istTime.setDate(istTime.getDate() + daysOffset);
        }
        return istTime.toISOString().split('T')[0];
    };

    // Initialize date
    useEffect(() => {
        setInvoiceDate(getISTDate(0));
    }, []);

    // Auto-fill customer details when found
    useEffect(() => {
        if (customerData) {
            setCustomerDetails({
                customerName: customerData.name || '',
                customerAddress: customerData.address || '',
                vehicle: customerData.vehicle || '',
                phoneNumber: customerData.phone_number
            });
        }
    }, [customerData]);

    // Recalculate totals when GST toggle changes
    // Recalculate totals when GST toggle changes
    useEffect(() => {
        setProducts(prev => prev.map(product => ({
            ...product,
            gstPercentage: gstIncluded ? 0 : product.gstPercentage, // Set GST to 0 when "With GST" is enabled
            totalAmount: calculateProductTotal(
                product.quantity,
                product.rate,
                gstIncluded ? 0 : product.gstPercentage
            )
        })));
    }, [gstIncluded]);

    // Product search
    useEffect(() => {
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

                setProductSearchResults(prev => ({ ...prev, [productId]: data || [] }));
            } catch (error) {
                console.error('Error searching products:', error);
                setProductSearchResults(prev => ({ ...prev, [productId]: [] }));
            } finally {
                setSearchingProduct(prev => ({ ...prev, [productId]: false }));
            }
        };

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
    }, [products]);

    // Customer change handler
    const handleCustomerChange = (field, value) => {
        setCustomerDetails(prev => ({ ...prev, [field]: value }));

        if (field === 'phoneNumber') {
            if (value.length > 0 && value.length < 10) {
                setPhoneError('Phone number must be 10 digits');
            } else if (value.length > 10) {
                setPhoneError('Phone number cannot exceed 10 digits');
            } else {
                setPhoneError('');
            }
        }
    };

    // Product change handler
    const handleProductChange = (id, field, value) => {
        setProducts(prev => prev.map(product => {
            if (product.id === id) {
                const updated = { ...product, [field]: value };

                if (field === 'productName') {
                    setShowProductDropdown(prev => ({ ...prev, [id]: value.length >= 2 }));
                }

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

    // Product select from dropdown
    const handleProductSelect = (productId, selectedProduct) => {
        setProducts(prev => prev.map(product => {
            if (product.id === productId) {
                const updated = {
                    ...product,
                    productName: selectedProduct.product_name,
                    hsnCode: selectedProduct.hsn_code,
                    rate: selectedProduct.base_rate,
                    gstPercentage: selectedProduct.gst_rate || 0
                };

                updated.totalAmount = calculateProductTotal(
                    updated.quantity,
                    updated.rate,
                    updated.gstPercentage
                );

                return updated;
            }
            return product;
        }));

        setProductsFromDB(prev => new Set([...prev, productId]));
        setShowProductDropdown(prev => ({ ...prev, [productId]: false }));
    };

    const addProduct = () => {
        const newProduct = {
            id: Date.now(),
            serialNumber: products.length + 1,
            productName: '',
            hsnCode: '',
            quantity: 0,
            rate: 0,
            gstPercentage: 0,
            totalAmount: 0
        };
        setProducts([...products, newProduct]);
    };

    const removeProduct = (id) => {
        if (products.length > 1) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    // Deduct stock
    const deductStockForProducts = async (productsToDeduct) => {
        try {
            for (const product of productsToDeduct) {
                if (!product.productName || !product.hsnCode || !product.rate) continue;

                const { data: existingProduct, error: fetchError } = await supabase
                    .from('products')
                    .select('id, current_stock')
                    .eq('product_name', product.productName)
                    .eq('hsn_code', product.hsnCode)
                    .maybeSingle();

                if (fetchError || !existingProduct) continue;

                const newStock = Math.max(0, existingProduct.current_stock - product.quantity);

                await supabase
                    .from('products')
                    .update({ current_stock: newStock })
                    .eq('id', existingProduct.id);
            }
        } catch (error) {
            console.error('Error in stock deduction:', error);
        }
    };

    const saveInvoice = async () => {
        setSaving(true);

        try {
            let customerId;

            const { data: existingCustomers } = await supabase
                .from('customers')
                .select('id')
                .eq('phone_number', customerDetails.phoneNumber);

            if (existingCustomers && existingCustomers.length > 0) {
                customerId = existingCustomers[0].id;
            } else {
                const { data: newCustomer } = await supabase
                    .from('customers')
                    .insert([{
                        name: customerDetails.customerName,
                        phone_number: customerDetails.phoneNumber,
                        address: customerDetails.customerAddress,
                        vehicle: customerDetails.vehicle
                    }])
                    .select()
                    .single();

                customerId = newCustomer.id;
            }

            const { data: invoiceData } = await supabase
                .from('invoices')
                .insert([{
                    invoice_number: `INV-${Date.now()}`,
                    customer_id: customerId,
                    bill_date: invoiceDate,
                    generated_by: 'system',
                    total_amount: grandTotal,
                    mode_of_payment: paymentMode,
                    gstin: gstin
                }])
                .select()
                .single();

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

            await supabase.from('invoice_items').insert(itemsToInsert);
            await deductStockForProducts(products);

            // 🆕 Generate PDF component
            const pdfComponent = (
                <InvoicePDF
                    invoice={invoiceData}
                    customer={{
                        name: customerDetails.customerName,
                        phone_number: customerDetails.phoneNumber,
                        address: customerDetails.customerAddress,
                        vehicle: customerDetails.vehicle
                    }}
                    products={products}
                />
            );

            // 🆕 Upload PDF and get URL
            const pdfUrl = await uploadInvoicePDF(pdfComponent, invoiceData.invoice_number);

            // 🆕 Send to WhatsApp
            sendInvoiceToWhatsApp(
                customerDetails.phoneNumber,
                pdfUrl,
                invoiceData.invoice_number,
                grandTotal.toFixed(2)
            );

            setSavedInvoiceData({
                invoice: invoiceData,
                customer: {
                    name: customerDetails.customerName,
                    phone_number: customerDetails.phoneNumber,
                    address: customerDetails.customerAddress,
                    vehicle: customerDetails.vehicle
                },
                products: products,
                pdfUrl: pdfUrl // 🆕 Store PDF URL
            });

            setInvoiceSaved(true);
            alert('Invoice saved successfully! Opening WhatsApp...');

            // Reset form
            setCustomerDetails({ customerName: '', customerAddress: '', vehicle: '', phoneNumber: '' });
            setProducts([{ id: 1, serialNumber: 1, productName: '', hsnCode: '', quantity: 0, rate: 0, gstPercentage:0, totalAmount: 0 }]);
            setPaymentMode('unpaid');
            setGstin('');
        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('Error saving invoice: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // Keyboard navigation
    const handleKeyDown = (e, currentKey, productId = null) => {
        const isNumberField = currentKey.includes('quantity') || currentKey.includes('rate') || currentKey.includes('gstPercentage');

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

            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
            return;
        }

        if (e.key === 'Enter' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const keys = Object.keys(inputRefs.current);
            const currentIndex = keys.indexOf(currentKey);

            let nextIndex = e.key === 'ArrowLeft' ? currentIndex - 1 : currentIndex + 1;

            if (nextIndex >= 0 && nextIndex < keys.length) {
                inputRefs.current[keys[nextIndex]]?.focus();
            } else if (e.key === 'Enter' && nextIndex >= keys.length) {
                addProduct();
            }
        }
    };

    const canSave = customerDetails.customerName && customerDetails.phoneNumber && !phoneError && customerDetails.phoneNumber.length === 10;

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate('/billing')} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">Back</span>
                </button>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <InvoiceHeader invoiceDate={invoiceDate} onInvoiceDateChange={setInvoiceDate} />

                    <CustomerDetailsForm
                        customerDetails={customerDetails}
                        onCustomerChange={handleCustomerChange}
                        phoneError={phoneError}
                        searching={searchingCustomer}
                        found={customerFound}
                        gstin={gstin}
                        onGstinChange={setGstin}
                        inputRefs={inputRefs}
                        onKeyDown={handleKeyDown}
                    />

                    <ProductsTable
                        products={products}
                        gstIncluded={gstIncluded}
                        onGstToggle={() => setGstIncluded(!gstIncluded)}
                        onProductChange={handleProductChange}
                        onAddProduct={addProduct}
                        onRemoveProduct={removeProduct}
                        onProductSelect={handleProductSelect}
                        inputRefs={inputRefs}
                        onKeyDown={handleKeyDown}
                        productSearchResults={productSearchResults}
                        showProductDropdown={showProductDropdown}
                        searchingProduct={searchingProduct}
                        onDropdownToggle={(id, show) => setShowProductDropdown(prev => ({ ...prev, [id]: show }))}
                    />

                    <InvoiceSummary
                        subtotal={subtotal}
                        totalGST={totalGST}
                        grandTotal={grandTotal}
                        paymentMode={paymentMode}
                        onPaymentModeChange={setPaymentMode}
                        onSaveInvoice={saveInvoice}
                        saving={saving}
                        canSave={canSave}
                        invoiceSaved={invoiceSaved}
                        savedInvoiceData={savedInvoiceData}
                    />
                </div>
            </div>
        </div>
    );
};

export default InvoiceGenerator;