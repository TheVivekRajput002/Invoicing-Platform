import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [invoice, setInvoice] = useState({
    invoice_number: '',
    bill_date: '',
    mode_of_payment: 'unpaid',
    total_amount: 0
  });

  const [customer, setCustomer] = useState({
    id: '',
    name: '',
    phone_number: ''
  });

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchInvoiceData();
  }, [id]);

  const fetchInvoiceData = async () => {
    setLoading(true);

    // Fetch invoice details
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, customer:customers(*)')
      .eq('id', id)
      .single();

    if (invoiceError) {
      alert('Error loading invoice: ' + invoiceError.message);
      navigate('/search');
      return;
    }

    setInvoice({
      invoice_number: invoiceData.invoice_number,
      bill_date: invoiceData.bill_date,
      mode_of_payment: invoiceData.mode_of_payment,
      total_amount: invoiceData.total_amount
    });

    setCustomer(invoiceData.customer);

    // Fetch invoice items
    const { data: itemsData, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id)
      .order('serial_number', { ascending: true });

    if (!itemsError && itemsData) {
      const formattedProducts = itemsData.map((item, index) => ({
        id: item.id,
        serialNumber: index + 1,
        productName: item.product_name,
        hsnCode: item.hsn_code,
        quantity: item.quantity,
        rate: item.rate,
        gstPercentage: item.gst_percentage,
        totalAmount: item.total_product
      }));
      setProducts(formattedProducts);
    }

    setLoading(false);
  };

  const calculateProductTotal = (quantity, rate, gstPercentage) => {
    const baseAmount = quantity * rate;
    const gstAmount = (baseAmount * gstPercentage) / 100;
    return baseAmount + gstAmount;
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
      id: 'new_' + Date.now(),
      serialNumber: products.length + 1,
      productName: '',
      hsnCode: '',
      quantity: 0,
      rate: 0,
      gstPercentage: 18,
      totalAmount: 0,
      isNew: true
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (productId) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== productId));
    } else {
      alert('Invoice must have at least one product');
    }
  };

  const calculateGrandTotal = () => {
    return products.reduce((sum, product) => sum + product.totalAmount, 0);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const grandTotal = calculateGrandTotal();

      // 1. Update invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          bill_date: invoice.bill_date,
          mode_of_payment: invoice.mode_of_payment,
          total_amount: grandTotal
        })
        .eq('id', id);

      if (invoiceError) throw invoiceError;

      // 2. Delete all existing invoice items
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      if (deleteError) throw deleteError;

      // 3. Insert all products
      const itemsToInsert = products.map((product, index) => ({
        invoice_id: id,
        serial_number: index + 1,
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

      if (itemsError) throw itemsError;

      alert('Invoice updated successfully!');
      navigate('/search');

    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Error updating invoice: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Edit Invoice</h1>
          <p className="text-gray-600 mt-1">Invoice #{invoice.invoice_number}</p>
        </div>

        {/* Customer Info (Read-only) */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Customer Name</p>
              <p className="font-semibold text-gray-900">{customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone Number</p>
              <p className="font-semibold text-gray-900">{customer.phone_number}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * To edit customer details, go to customer edit page
          </p>
        </div>

        {/* Invoice Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Invoice Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date
              </label>
              <input
                type="date"
                value={invoice.bill_date}
                onChange={(e) => setInvoice({...invoice, bill_date: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Mode
              </label>
              <select
                value={invoice.mode_of_payment}
                onChange={(e) => setInvoice({...invoice, mode_of_payment: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="unpaid">Unpaid</option>
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Details</h2>

          {/* Desktop Table - Hidden on Mobile */}
          <div className="hidden md:block overflow-x-auto">
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

          {/* Mobile Cards - Hidden on Desktop */}
          <div className="md:hidden space-y-4">
            {products.map((product, index) => (
              <div key={product.id} className="border-2 border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                {/* Header with Serial Number and Delete */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Product #{index + 1}</h3>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                    disabled={products.length === 1}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Product Name - Full Width */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={product.productName}
                    onChange={(e) => handleProductChange(product.id, 'productName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>

                {/* HSN Code - Full Width */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    value={product.hsnCode}
                    onChange={(e) => handleProductChange(product.id, 'hsnCode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter HSN code"
                  />
                </div>

                {/* Quantity and Rate - Side by Side */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(product.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={product.rate}
                      onChange={(e) => handleProductChange(product.id, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* GST and Total - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST %
                    </label>
                    <input
                      type="number"
                      value={product.gstPercentage}
                      onChange={(e) => handleProductChange(product.id, 'gstPercentage', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="18"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total
                    </label>
                    <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-bold text-blue-600 text-lg">
                      ₹{product.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addProduct}
            className="mt-4 flex items-center px-4 py-2 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </button>
        </div>

        {/* Grand Total */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">Grand Total:</span>
            <span className="text-2xl font-bold text-blue-600">
              ₹{calculateGrandTotal().toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/billing/invoice/search')}
            className="flex items-center px-6 py-2 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> Back
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save className="mr-2 w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInvoice;