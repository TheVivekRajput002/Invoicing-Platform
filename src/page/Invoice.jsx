import React, { useState } from 'react';
import { Plus, Trash2, Save, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

const InvoiceGenerator = () => {


    const [step, setStep] = useState(1);
    const [paymentMode, setPaymentMode] = useState('unpaid'); // MOVED TO TOP LEVEL

    const [customerDetails, setCustomerDetails] = useState({
        customerName: '',
        customerAddress: '',
        phoneNumber: ''
    });

    const [products, setProducts] = useState([
        {
            id: 1,
            serialNumber: 1,
            productName: '',
            hsnCode: '',
            quantity: 0,
            rate: 0,
            gstPercentage: 18,
            totalAmount: 0
        }
    ]);

    const [saving, setSaving] = useState(false);

    const calculateProductTotal = (quantity, rate, gstPercentage) => {
        const baseAmount = quantity * rate;
        const gstAmount = (baseAmount * gstPercentage) / 100;
        return baseAmount + gstAmount;
    };

    const handleCustomerChange = (field, value) => {
        setCustomerDetails(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleProductChange = (id, field, value) => {
        setProducts(prev => prev.map(product => {
            if (product.id === id) {
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

    const calculateGrandTotal = () => {
        return products.reduce((sum, product) => sum + product.totalAmount, 0);
    };

    const saveInvoice = async () => {
        setSaving(true);

        try {
            let customerId;  // ✅ ADD THIS LINE - Declare the variable!

            // Check if customer exists
            const { data: existingCustomers, error: fetchError } = await supabase
                .from('customers')
                .select('id')
                .eq('phone_number', customerDetails.phoneNumber);

            if (fetchError) {
                throw new Error('Failed to check existing customer: ' + fetchError.message);
            }

            // Customer exists - use existing ID
            if (existingCustomers && existingCustomers.length > 0) {
                customerId = existingCustomers[0].id;
                console.log('Found existing customer:', customerId);
            } else {
                // Customer doesn't exist - create new one
                console.log('Creating new customer...');
                const { data: newCustomer, error: customerError } = await supabase
                    .from('customers')
                    .insert([
                        {
                            name: customerDetails.customerName,
                            phone_number: customerDetails.phoneNumber,
                            address: customerDetails.customerAddress
                        }
                    ])
                    .select()
                    .single();

                if (customerError) {
                    throw customerError;
                }

                customerId = newCustomer.id;
                console.log('Created new customer:', customerId);
            }

            // Validate customerId before using it
            if (!customerId) {
                throw new Error('Failed to get or create customer ID');
            }

            // Insert invoice
            const { data: invoiceData, error: invoiceError } = await supabase
                .from('invoices')
                .insert([
                    {
                        invoice_number: `INV-${Date.now()}`,
                        customer_id: customerId,
                        bill_date: new Date().toISOString().split('T')[0],
                        generated_by: 'system',
                        total_amount: calculateGrandTotal(),
                        mode_of_payment: paymentMode
                    }
                ])
                .select()
                .single();

            if (invoiceError) {
                throw invoiceError;
            }

            // Insert invoice items
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
            setStep(1);
            setCustomerDetails({
                customerName: '',
                customerAddress: '',
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

        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('Error saving invoice: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const validateStep1 = () => {
        return customerDetails.customerName &&
            customerDetails.phoneNumber;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Invoice Generator</h1>
                    <div className="flex items-center mt-4">
                        <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                                1
                            </div>
                            <span className="ml-2 font-medium">Customer Details</span>
                        </div>
                        <div className="flex-1 h-1 mx-4 bg-gray-300">
                            <div className={`h-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'} transition-all`} />
                        </div>
                        <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                                2
                            </div>
                            <span className="ml-2 font-medium">Products</span>
                        </div>
                    </div>
                </div>

                {step === 1 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    value={customerDetails.customerName}
                                    onChange={(e) => handleCustomerChange('customerName', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter customer name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Address
                                </label>
                                <input
                                    type="text"
                                    value={customerDetails.customerAddress}
                                    onChange={(e) => handleCustomerChange('customerAddress', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter customer address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={customerDetails.phoneNumber}
                                    onChange={(e) => handleCustomerChange('phoneNumber', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setStep(2)}
                                disabled={!validateStep1()}
                                className={`flex items-center px-6 py-2 rounded-lg font-medium ${validateStep1()
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Next <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Details</h2>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-700">S.No</th>
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-700">Product Name</th>
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-700">HSN Code</th>
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-700">Qty</th>
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-700">Rate</th>
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-700">GST %</th>
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-700">Total</th>
                                        <th className="px-2 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, index) => (
                                        <tr key={product.id} className="border-b">
                                            <td className="px-2 py-2">{index + 1}</td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    value={product.productName}
                                                    onChange={(e) => handleProductChange(product.id, 'productName', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                    placeholder="Product"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    value={product.hsnCode}
                                                    onChange={(e) => handleProductChange(product.id, 'hsnCode', e.target.value)}
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                    placeholder="HSN"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="number"
                                                    value={product.quantity}
                                                    onChange={(e) => handleProductChange(product.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="number"
                                                    value={product.rate}
                                                    onChange={(e) => handleProductChange(product.id, 'rate', parseFloat(e.target.value) || 0)}
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="number"
                                                    value={product.gstPercentage}
                                                    onChange={(e) => handleProductChange(product.id, 'gstPercentage', parseFloat(e.target.value) || 0)}
                                                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-2 py-2 font-medium">
                                                ₹{product.totalAmount.toFixed(2)}
                                            </td>
                                            <td className="px-2 py-2">
                                                <button
                                                    onClick={() => removeProduct(product.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    disabled={products.length === 1}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            onClick={addProduct}
                            className="mt-4 flex items-center px-4 py-2 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Product
                        </button>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Mode
                            </label>
                            <select
                                value={paymentMode}
                                onChange={(e) => setPaymentMode(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="unpaid">Unpaid</option>
                                <option value="cash">Cash</option>
                                <option value="online">Online</option>
                            </select>
                        </div>

                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-700">Grand Total:</span>
                                <span className="text-2xl font-bold text-blue-600">
                                    ₹{calculateGrandTotal().toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="flex items-center px-6 py-2 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <ArrowLeft className="mr-2 w-4 h-4" /> Back
                            </button>
                            <button
                                onClick={saveInvoice}
                                disabled={saving}
                                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                            >
                                <Save className="mr-2 w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Invoice'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceGenerator;