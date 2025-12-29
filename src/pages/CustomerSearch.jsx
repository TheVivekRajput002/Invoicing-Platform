import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search as SearchIcon, User, Phone, AlertCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerSearch = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerInvoices, setCustomerInvoices] = useState([]);
    const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0 });

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

        const { data: customersData } = await supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        setCustomers(customersData || []);
        setFilteredCustomers(customersData || []);
        setLoading(false);
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);

        if (!query.trim()) {
            fetchInitialData();
            return;
        }

        setLoading(true);

        try {
            const { data: searchedCustomers } = await supabase
                .from('customers')
                .select('*')
                .or(`name.ilike.%${query}%,phone_number.ilike.%${query}%`)
                .order('created_at', { ascending: false })
                .limit(50);

            setFilteredCustomers(searchedCustomers || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerClick = async (customer) => {
        setSelectedCustomer(customer);
        setLoading(true);

        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('customer_id', customer.id)
            .order('bill_date', { ascending: false });

        if (!error) {
            setCustomerInvoices(data || []);

            const total = data.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
            const paid = data.filter(inv => inv.mode_of_payment !== 'unpaid')
                .reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
            const unpaid = total - paid;
            setStats({ total, paid, unpaid });
        }

        setLoading(false);
    };

    return (
        <div className="bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Search</h1>

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or phone number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer List */}
                    <div className="lg:col-span-2">
                        {loading ? (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600 text-lg">Searching...</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <User className="text-blue-600" size={24} />
                                    Customers ({filteredCustomers.length})
                                </h2>
                                <div className="space-y-3">
                                    {filteredCustomers.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No customers found</p>
                                    ) : (
                                        filteredCustomers.map(customer => (
                                            <div
                                                key={customer.id}
                                                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div
                                                        onClick={() => handleCustomerClick(customer)}
                                                        className="flex-1 cursor-pointer"
                                                    >
                                                        <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                            <span className="flex items-center gap-1">
                                                                <Phone size={14} />
                                                                {customer.phone_number}
                                                            </span>
                                                        </div>
                                                        {customer.address && (
                                                            <p className="text-sm text-gray-500 mt-1">{customer.address}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/customer/edit/${customer.id}`)}
                                                        className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Customer Details Panel */}
                    <div className="space-y-6">
                        {selectedCustomer ? (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
                                <div className="space-y-3 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-600">Name</p>
                                        <p className="font-semibold">{selectedCustomer.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-semibold">{selectedCustomer.phone_number}</p>
                                    </div>
                                    {selectedCustomer.address && (
                                        <div>
                                            <p className="text-sm text-gray-600">Address</p>
                                            <p className="font-semibold">{selectedCustomer.address}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-600">Total</p>
                                        <p className="font-bold text-gray-900">₹{stats.total.toLocaleString()}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-green-600">Paid</p>
                                        <p className="font-bold text-green-600">₹{stats.paid.toLocaleString()}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-red-600">Unpaid</p>
                                        <p className="font-bold text-red-600">₹{stats.unpaid.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Invoices */}
                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <FileText size={18} />
                                        Invoices ({customerInvoices.length})
                                    </h3>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {customerInvoices.map(inv => (
                                            <div
                                                key={inv.id}
                                                onClick={() => navigate(`/billing/invoice/${inv.id}`)}
                                                className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-sm">{inv.invoice_number}</span>
                                                    <span className={`text-xs px-2 py-1 rounded ${inv.mode_of_payment === 'cash' || inv.mode_of_payment === 'online'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {inv.mode_of_payment}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-xs text-gray-500">{inv.bill_date}</span>
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        ₹{parseFloat(inv.total_amount).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-blue-50 rounded-lg p-6 text-center">
                                <AlertCircle className="mx-auto text-blue-600 mb-3" size={48} />
                                <h3 className="font-semibold text-gray-900 mb-2">Select a Customer</h3>
                                <p className="text-gray-600 text-sm">Click on a customer to view their details and invoices</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerSearch;