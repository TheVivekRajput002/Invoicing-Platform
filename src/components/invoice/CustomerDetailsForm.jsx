import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const CustomerDetailsForm = ({
    customerDetails,
    onCustomerChange,
    phoneError,
    searching,
    found,
    gstin,
    onGstinChange,
    inputRefs,
    onKeyDown
}) => {
    return (
        <div className="p-6 border-b-2 border-gray-300 bg-blue-50">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                    </label>
                    <div className="relative">
                        <input
                            ref={(el) => inputRefs.current['phoneNumber'] = el}
                            type="tel"
                            value={customerDetails.phoneNumber}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                onCustomerChange('phoneNumber', value);
                            }}
                            onKeyDown={(e) => onKeyDown(e, 'phoneNumber')}
                            className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                            }`}
                            placeholder="10-digit phone number"
                            maxLength="10"
                        />
                        {searching && (
                            <div className="absolute right-3 top-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                        {found && !searching && !phoneError && (
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

                    {found && !phoneError && (
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
                        ref={(el) => inputRefs.current['customerName'] = el}
                        type="text"
                        value={customerDetails.customerName}
                        onChange={(e) => onCustomerChange('customerName', e.target.value)}
                        onKeyDown={(e) => onKeyDown(e, 'customerName')}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Customer name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Address
                    </label>
                    <input
                        ref={(el) => inputRefs.current['customerAddress'] = el}
                        type="text"
                        value={customerDetails.customerAddress}
                        onChange={(e) => onCustomerChange('customerAddress', e.target.value)}
                        onKeyDown={(e) => onKeyDown(e, 'customerAddress')}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Customer address"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Vehicle / Mechanic
                    </label>
                    <input
                        ref={(el) => inputRefs.current['vehicle'] = el}
                        type="text"
                        value={customerDetails.vehicle}
                        onChange={(e) => onCustomerChange('vehicle', e.target.value)}
                        onKeyDown={(e) => onKeyDown(e, 'vehicle')}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Vehicle number"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        GSTIN
                    </label>
                    <input
                        ref={(el) => inputRefs.current['gstin'] = el}
                        type="text"
                        value={gstin}
                        onChange={(e) => onGstinChange(e.target.value)}
                        onKeyDown={(e) => onKeyDown(e, 'gstin')}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Customer GSTIN number"
                    />
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailsForm;