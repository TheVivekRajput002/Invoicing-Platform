import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search as SearchIcon, User, FileText, ShoppingCart, AlertCircle, DollarSign, Calendar, Phone, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('invoices'); // all, customers, invoices, products,unpaid
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0 });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchInitialData = async () => {
    setLoading(true);

    // Fetch only recent 20 customers
    const { data: customersData } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);  // ✅ Only top 20

    setCustomers(customersData || []);
    setFilteredCustomers(customersData || []);

    // Fetch only recent 40 invoices WITH customer data
    const { data: invoicesData } = await supabase
      .from('invoices')
      .select(`
      *,
      customer:customers(name, phone_number)
    `)
      .order('bill_date', { ascending: false })
      .limit(40);  // ✅ Only top 40

    setInvoices(invoicesData || []);
    setFilteredInvoices(invoicesData || []);

    // Fetch ALL invoice items in ONE query
    const { data: allItemsData } = await supabase
      .from('invoice_items')
      .select('*');

    // Extract unique products from all items at once
    const uniqueProducts = Array.from(
      new Map(allItemsData?.map(item => [item.product_name, item]) || []).values()
    );

    setProducts(uniqueProducts);
    setFilteredProducts(uniqueProducts);

    setLoading(false);
  };

  // Remove the invoice items loop from fetchInitialData completely
  // Only fetch when user clicks on a specific invoice

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


  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setSelectedInvoice(null);
    fetchCustomerInvoices(customer.id);
  };


  const getUnpaidInvoices = () => {
    return filteredInvoices.filter(inv => inv.mode_of_payment === 'unpaid');
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    // If search is empty, reload initial data (top 20/40)
    if (!query.trim()) {
      fetchInitialData();
      return;
    }

    const lowerQuery = query.toLowerCase();
    setLoading(true);

    try {
      // Search ALL customers from database
      const { data: searchedCustomers } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${query}%,phone_number.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(50);  // Limit search results to 50

      setFilteredCustomers(searchedCustomers || []);

      // Search ALL invoices from database
      const { data: searchedInvoices } = await supabase
        .from('invoices')
        .select(`
        *,
        customer:customers(name, phone_number)
      `)
        .or(`invoice_number.ilike.%${query}%,bill_date.ilike.%${query}%`)
        .order('bill_date', { ascending: false })
        .limit(100);  // Limit search results to 100

      setFilteredInvoices(searchedInvoices || []);

      // Search products from existing data (products are already loaded)
      const filteredProd = products.filter(p =>
        p.product_name.toLowerCase().includes(lowerQuery) ||
        p.hsn_code?.includes(query)
      );
      setFilteredProducts(filteredProd);

    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerInvoices = async (customerId) => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .order('bill_date', { ascending: false });

    if (!error) {
      setCustomerInvoices(data || []);

      // Calculate stats
      const total = data.reduce((sum, inv) => sum + inv.total_amount, 0);
      const paid = data.filter(inv => inv.mode_of_payment !== 'unpaid').reduce((sum, inv) => sum + inv.total_amount, 0);
      const unpaid = total - paid;
      setStats({ total, paid, unpaid });
    }
  };

  const fetchInvoiceItems = async (invoiceId) => {
    const { data, error } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId);

    if (!error) {
      setInvoiceItems(data || []);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Search & Analytics</h1>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={loading ? "Searching..." : "Search customers, invoices, products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Search Type Filters */}
          <div className="flex gap-2">
            {['invoices', 'customers', , 'products', 'unpaid'].map(type => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${searchType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Details Panel */}
          <div className="space-y-6 lg:order-2">
            {selectedCustomer && searchType === 'customers' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{selectedCustomer.phone_number}</p>
                  </div>
                </div>



                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold mb-3">Invoices ({customerInvoices.length})</h3>
                  <div className="space-y-2">
                    {customerInvoices.map(inv => (
                      <div
                        key={inv.id}
                        onClick={() => handleInvoiceClick(inv)}
                        className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{inv.invoice_number}</span>
                          <span className={`text-xs px-2 py-1 rounded ${(inv.mode_of_payment === 'cash' || inv.mode_of_payment === 'online') ? 'bg-green-100 text-green-800' :
                            inv.mode_of_payment === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {inv.mode_of_payment}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">₹{inv.total_amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedInvoice && (
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
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{selectedInvoice.bill_date}</p>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold">
                      {new Date(selectedInvoice.created_at).toLocaleString('en-IN', {
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold">₹{selectedInvoice.total_amount.toLocaleString()}</p>
                  </div>

                </div>

                {invoiceItems.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold mb-3">Items</h3>
                    <div className="space-y-3">
                      {invoiceItems.map(item => (
                        <div key={item.id} className="p-3 bg-gray-50 rounded">
                          <p className="font-medium">{item.product_name}</p>
                          <div className="mt-2 text-sm text-gray-600 space-y-1">
                            <p>Qty: {item.quantity} × ₹{item.rate} = ₹{item.total_product.toLocaleString()}</p>
                            <p>HSN: {item.hsn_code} | GST: {item.gst_percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!selectedCustomer && !selectedInvoice && (
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <AlertCircle className="mx-auto text-blue-600 mb-3" size={48} />
                <h3 className="font-semibold text-gray-900 mb-2">Select an Item</h3>
                <p className="text-gray-600 text-sm">Click on a customer or invoice to view details</p>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6 lg:order-1">
            {/* ✅ LOADING STATE - Shows only in results area */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Searching...</p>
              </div>
            ) : (
              <>
                {/* Customers */}
                {(searchType === 'customers') && (
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
                              </div>
                              {/* ✅ ADD EDIT BUTTON */}
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

                {/* Invoices */}
                {(searchType === 'invoices' || searchType === 'unpaid') && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FileText className="text-green-600" size={24} />
                      {searchType === 'unpaid' ? 'Unpaid Invoices' : 'Invoices'}
                      ({searchType === 'unpaid' ? getUnpaidInvoices().length : filteredInvoices.length})
                    </h2>
                    <div className="space-y-3">
                      {(searchType === 'unpaid' ? getUnpaidInvoices() : filteredInvoices).length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No invoices found</p>
                      ) : (
                        (searchType === 'unpaid' ? getUnpaidInvoices() : filteredInvoices).map(invoice => (
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
                                {/* ... rest of invoice details */}
                              </div>
                              {/* ✅ ADD EDIT BUTTON */}
                              <div className="ml-4 flex flex-col gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${invoice.mode_of_payment === 'cash' || invoice.mode_of_payment === 'online'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                  {invoice.mode_of_payment.toUpperCase()}
                                </span>
                                <button
                                  onClick={() => navigate(`/invoice/edit/${invoice.id}`)}
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

                {/* Products */}
                {(searchType === 'products') && (
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
                            className="p-4 border border-gray-200 rounded-lg"
                          >
                            <h3 className="font-semibold text-gray-900">{product.product_name}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span>HSN: {product.hsn_code}</span>
                              <span>GST: {product.gst_percentage}%</span>
                              <span>Rate: ₹{product.rate}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>



        </div>
      </div>
    </div>
  );
};

export default Search;