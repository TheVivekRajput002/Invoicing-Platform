import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search as SearchIcon, FileText, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvoiceSearch = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [filterType, setFilterType] = useState('all'); // all, unpaid, paid

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, filterType]);

    const fetchInitialData = async () => {
        setLoading(true);

        const { data: invoicesData } = await supabase
            .from('invoices')
            .select(`
        *,
        customer:customers(name, phone_number)
      `)
            .order('bill_date', { ascending: false })
            .limit(40);

        setInvoices(invoicesData || []);
        applyFilter(invoicesData || []);
        setLoading(false);
    };

    const applyFilter = (invoicesList) => {
        let filtered = invoicesList;

        if (filterType === 'unpaid') {
            filtered = invoicesList.filter(inv => inv.mode_of_payment === 'unpaid');
        } else if (filterType === 'paid') {
            filtered = invoicesList.filter(inv => inv.mode_of_payment === 'cash' || inv.mode_of_payment === 'online');
        }

        setFilteredInvoices(filtered);
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);

        if (!query.trim()) {
            applyFilter(invoices);
            return;
        }

        setLoading(true);

        try {
            const { data: searchedInvoices } = await supabase
                .from('invoices')
                .select(`
          *,
          customer:customers(name, phone_number)
        `)
                .or(`invoice_number.ilike.%${query}%,bill_date.ilike.%${query}%`)
                .order('bill_date', { ascending: false })
                .limit(100);

            applyFilter(searchedInvoices || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvoiceClick = async (invoice) => {
        setSelectedInvoice(invoice);
        setLoading(true);

        const { data } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', invoice.id);

        setInvoiceItems(data || []);
        setLoading(false);
    };

    const handleFilterChange = (type) => {
        setFilterType(type);
        applyFilter(invoices);
    };

    return (
        <div className="bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Invoice Search</h1>

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="relative mb-4">
                        <SearchIcon className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by invoice number or date..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'unpaid', label: 'Unpaid' },
                            { id: 'paid', label: 'Paid' }
                        ].map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => handleFilterChange(filter.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterType === filter.id
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Invoice List */}
                    <div className="lg:col-span-2">
                        {loading ? (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
                                <p className="text-gray-600 text-lg">Searching...</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="text-green-600" size={24} />
                                    Invoices ({filteredInvoices.length})
                                </h2>
                                <div className="space-y-3">
                                    {filteredInvoices.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No invoices found</p>
                                    ) : (
                                        filteredInvoices.map(invoice => (
                                            <div
                                                key={invoice.id}
                                                className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div
                                                        onClick={() => handleInvoiceClick(invoice)}
                                                        className="flex-1 cursor-pointer"
                                                    >
                                                        <h3 className="font-semibold text-gray-900">{invoice.invoice_number}</h3>
                                                        <div className="mt-2 space-y-1">
                                                            <p className="text-sm text-gray-600">
                                                                Customer: {invoice.customer?.name || 'N/A'}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar size={14} />
                                                                    {invoice.bill_date}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <DollarSign size={14} />
                                                                    ₹{parseFloat(invoice.total_amount).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 flex flex-col gap-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${invoice.mode_of_payment === 'cash' || invoice.mode_of_payment === 'online'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {invoice.mode_of_payment.toUpperCase()}
                                                        </span>
                                                        <button
                                                            onClick={() => navigate(`/billing/invoice/edit/${invoice.id}`)}
                                                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Invoice Details Panel */}
                    <div className="space-y-6">
                        {selectedInvoice ? (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
                                <div className="space-y-3 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-600">Invoice Number</p>
                                        <p className="font-semibold">{selectedInvoice.invoice_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Customer Name</p>
                                        <p className="font-semibold">{selectedInvoice.customer?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-semibold">{selectedInvoice.customer?.phone_number || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Date</p>
                                        <p className="font-semibold">{selectedInvoice.bill_date}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Time</p>
                                        <p className="font-semibold">
                                            {new Date(selectedInvoice.created_at).toLocaleString('en-IN', {
                                                timeStyle: 'short'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Payment Mode</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${selectedInvoice.mode_of_payment === 'cash' || selectedInvoice.mode_of_payment === 'online'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {selectedInvoice.mode_of_payment.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Amount</p>
                                        <p className="font-bold text-lg text-green-600">
                                            ₹{parseFloat(selectedInvoice.total_amount).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Invoice Items */}
                                {invoiceItems.length > 0 && (
                                    <div className="border-t border-gray-200 pt-4">
                                        <h3 className="font-semibold mb-3">Items ({invoiceItems.length})</h3>
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {invoiceItems.map(item => (
                                                <div key={item.id} className="p-3 bg-gray-50 rounded">
                                                    <p className="font-medium">{item.product_name}</p>
                                                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                                                        <p>Qty: {item.quantity} × ₹{parseFloat(item.rate).toLocaleString()} = ₹{parseFloat(item.total_product).toLocaleString()}</p>
                                                        <p>HSN: {item.hsn_code} | GST: {item.gst_percentage}%</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-green-50 rounded-lg p-6 text-center">
                                <AlertCircle className="mx-auto text-green-600 mb-3" size={48} />
                                <h3 className="font-semibold text-gray-900 mb-2">Select an Invoice</h3>
                                <p className="text-gray-600 text-sm">Click on an invoice to view details and items</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceSearch;