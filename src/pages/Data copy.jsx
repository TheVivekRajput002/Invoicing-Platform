import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Calendar, DollarSign, Users, FileText, TrendingUp, Package, Filter } from 'lucide-react';

const Data = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidRevenue: 0,
    unpaidRevenue: 0,
    totalInvoices: 0,
    uniqueCustomers: 0,
    topProducts: [],
    topCustomers: [],
    paymentBreakdown: { cash: 0, online: 0, unpaid: 0 }
  });

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalytics();
    }
  }, [startDate, endDate]);

  const fetchAnalytics = async () => {
    setLoading(true);

    try {
      // Fetch invoices in date range
      const { data: invoices, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(id, name, phone_number)
        `)
        .gte('bill_date', startDate)
        .lte('bill_date', endDate)
        .order('bill_date', { ascending: false });

      if (invoiceError) throw invoiceError;

      // Fetch invoice items for product statistics
      const invoiceIds = invoices.map(inv => inv.id);
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .in('invoice_id', invoiceIds);

      if (itemsError) throw itemsError;

      // Calculate statistics
      calculateStats(invoices, items);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (invoices, items) => {
    // Total revenue and payment breakdown
    let totalRevenue = 0;
    let paidRevenue = 0;
    let unpaidRevenue = 0;
    let cashCount = 0;
    let onlineCount = 0;
    let unpaidCount = 0;

    invoices.forEach(inv => {
      const amount = parseFloat(inv.total_amount);
      totalRevenue += amount;

      if (inv.mode_of_payment === 'cash') {
        paidRevenue += amount;
        cashCount += amount;
      } else if (inv.mode_of_payment === 'online') {
        paidRevenue += amount;
        onlineCount += amount;
      } else if (inv.mode_of_payment === 'unpaid') {
        unpaidRevenue += amount;
        unpaidCount += amount;
      }
    });

    // Unique customers
    const uniqueCustomerIds = new Set(invoices.map(inv => inv.customer_id));
    const uniqueCustomers = uniqueCustomerIds.size;

    // Top products by revenue
    const productStats = {};
    items.forEach(item => {
      const productName = item.product_name;
      if (!productStats[productName]) {
        productStats[productName] = {
          name: productName,
          quantity: 0,
          revenue: 0
        };
      }
      productStats[productName].quantity += parseFloat(item.quantity);
      productStats[productName].revenue += parseFloat(item.total_product);
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Top customers by revenue
    const customerStats = {};
    invoices.forEach(inv => {
      const customerId = inv.customer_id;
      const customerName = inv.customer?.name || 'Unknown';
      
      if (!customerStats[customerId]) {
        customerStats[customerId] = {
          name: customerName,
          invoiceCount: 0,
          totalSpent: 0
        };
      }
      customerStats[customerId].invoiceCount += 1;
      customerStats[customerId].totalSpent += parseFloat(inv.total_amount);
    });

    const topCustomers = Object.values(customerStats)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    setStats({
      totalRevenue,
      paidRevenue,
      unpaidRevenue,
      totalInvoices: invoices.length,
      uniqueCustomers,
      topProducts,
      topCustomers,
      paymentBreakdown: {
        cash: cashCount,
        online: onlineCount,
        unpaid: unpaidCount
      }
    });
  };

  const handleQuickFilter = (days) => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(pastDate.toISOString().split('T')[0]);
  };

  return (
    <div className="bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Sales Analytics</h1>

        {/* Date Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Date Range Filter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickFilter(7)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleQuickFilter(30)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => handleQuickFilter(90)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Last 90 Days
            </button>
            <button
              onClick={() => handleQuickFilter(365)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Last Year
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Total Revenue */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign size={32} />
                  <TrendingUp size={20} className="opacity-70" />
                </div>
                <p className="text-sm opacity-90 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>

              {/* Paid Revenue */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign size={32} />
                  <span className="text-xs opacity-90">PAID</span>
                </div>
                <p className="text-sm opacity-90 mb-1">Paid Revenue</p>
                <p className="text-3xl font-bold">₹{stats.paidRevenue.toLocaleString()}</p>
              </div>

              {/* Unpaid Revenue */}
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign size={32} />
                  <span className="text-xs opacity-90">PENDING</span>
                </div>
                <p className="text-sm opacity-90 mb-1">Unpaid Revenue</p>
                <p className="text-3xl font-bold">₹{stats.unpaidRevenue.toLocaleString()}</p>
              </div>

              {/* Unique Customers */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Users size={32} />
                  <FileText size={20} className="opacity-70" />
                </div>
                <p className="text-sm opacity-90 mb-1">Customers Attended</p>
                <p className="text-3xl font-bold">{stats.uniqueCustomers}</p>
                <p className="text-xs opacity-80 mt-1">{stats.totalInvoices} invoices</p>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="text-blue-600" size={24} />
                Payment Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Cash Payments</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{stats.paymentBreakdown.cash.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Online Payments</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{stats.paymentBreakdown.online.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-600 mb-1">Unpaid</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ₹{stats.paymentBreakdown.unpaid.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Products and Customers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Package className="text-purple-600" size={24} />
                  Top 5 Products by Revenue
                </h2>
                <div className="space-y-3">
                  {stats.topProducts.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No products sold in this period</p>
                  ) : (
                    stats.topProducts.map((product, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <span className="text-lg font-bold text-purple-600">
                            ₹{product.revenue.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Quantity Sold: {product.quantity.toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top Customers */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="text-blue-600" size={24} />
                  Top 5 Customers by Revenue
                </h2>
                <div className="space-y-3">
                  {stats.topCustomers.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No customers in this period</p>
                  ) : (
                    stats.topCustomers.map((customer, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                          <span className="text-lg font-bold text-blue-600">
                            ₹{customer.totalSpent.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {customer.invoiceCount} {customer.invoiceCount === 1 ? 'invoice' : 'invoices'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Data;