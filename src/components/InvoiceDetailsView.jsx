import React from 'react';
import { Building2 } from 'lucide-react';

const InvoiceDetailsView = ({ invoice, invoiceItems, customer }) => {
    if (!invoice) return null;

    // Calculate totals from invoice items
    const calculateSubtotal = () => {
        return invoiceItems.reduce((sum, item) => {
            const base = item.quantity * item.rate;
            return sum + base;
        }, 0);
    };

    const calculateTotalGST = () => {
        return invoiceItems.reduce((sum, item) => {
            const base = item.quantity * item.rate;
            const gst = (base * item.gst_percentage) / 100;
            return sum + gst;
        }, 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header Section - Company & Invoice Details */}
            <div className="border-b-4 border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Left - Company Details */}
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

                    {/* Right - Invoice Details */}
                    <div className="p-6 bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">TAX INVOICE</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-semibold text-gray-700">Invoice No:</span>
                                <span className="text-sm text-gray-900 font-mono">{invoice.invoice_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-semibold text-gray-700">Invoice Date:</span>
                                <span className="text-sm text-gray-900">{formatDate(invoice.bill_date)}</span>
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
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <div className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-900">
                            {customer?.phone_number || 'N/A'}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Customer Name
                        </label>
                        <div className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-900">
                            {customer?.name || 'N/A'}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Address
                        </label>
                        <div className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-900">
                            {customer?.address || 'N/A'}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Vehicle Number
                        </label>
                        <div className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-900">
                            {customer?.vehicle || 'N/A'}
                        </div>
                    </div>

                    {invoice.gstin && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                GSTIN
                            </label>
                            <div className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-900">
                                {invoice.gstin}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Products Table Section */}
            <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">ITEMS</h3>

                {/* Desktop Table View */}
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
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceItems.map((item, index) => (
                                <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-center">{index + 1}</td>
                                    <td className="px-4 py-3 text-sm">{item.product_name}</td>
                                    <td className="px-4 py-3 text-sm">{item.hsn_code}</td>
                                    <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                                    <td className="px-4 py-3 text-sm text-right">₹{parseFloat(item.rate).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm text-center">{item.gst_percentage}%</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-right">
                                        ₹{parseFloat(item.total_product).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden space-y-4">
                    {invoiceItems.map((item, index) => (
                        <div key={item.id} className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-base font-bold text-gray-800">Item #{index + 1}</h4>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                                    <div className="px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
                                        {item.product_name}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">HSN Code</label>
                                        <div className="px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
                                            {item.hsn_code}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                                        <div className="px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
                                            {item.quantity}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Rate (₹)</label>
                                        <div className="px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
                                            ₹{parseFloat(item.rate).toFixed(2)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">GST %</label>
                                        <div className="px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
                                            {item.gst_percentage}%
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t-2 border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-700">Amount:</span>
                                        <span className="text-lg font-bold text-blue-600">
                                            ₹{parseFloat(item.total_product).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Total Section */}
            <div className="p-6 bg-gray-50 border-t-2 border-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Payment Mode */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Mode</label>
                        <div className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                invoice.mode_of_payment === 'cash' || invoice.mode_of_payment === 'online'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {invoice.mode_of_payment.toUpperCase()}
                            </span>
                        </div>
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
                                ₹{parseFloat(invoice.total_amount).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailsView;