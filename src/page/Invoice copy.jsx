import React from 'react'
import { useState, useEffect } from 'react'
import Input from '../components/Input';
import { Plus, Trash2, Save, ArrowLeft, ArrowRight } from 'lucide-react';


const Invoice = () => {

    const InvoiceGenerator = () => {
        const [step, setStep] = useState(1);
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

        // Handle customer detail changes
        const handleCustomerChange = (field, value) => {
            setCustomerDetails(prev => ({
                ...prev,
                [field]: value
            }));
        };

        // Handle product field changes
        const handleProductChange = (id, field, value) => {
            setProducts(prev => prev.map(product => {
                if (product.id === id) {
                    const updated = { ...product, [field]: value };

                    // Auto-calculate total when quantity, rate, or GST changes
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

        // Remove product row
        const removeProduct = (id) => {
            if (products.length > 1) {
                setProducts(products.filter(p => p.id !== id));
            }
        };

        // Calculate grand total
        const calculateGrandTotal = () => {
            return products.reduce((sum, product) => sum + product.totalAmount, 0);
        };

        // Save to Supabase (you'll need to implement this)
        const saveInvoice = async () => {
            setSaving(true);

            // IMPORTANT: Replace this with actual Supabase implementation
            // Example implementation:
            /*
            import { supabase } from './supabaseClient';
            
            try {
              // 1. Insert invoice
              const { data: invoiceData, error: invoiceError } = await supabase
                .from('invoices')
                .insert([
                  {
                    invoice_number: `INV-${Date.now()}`,
                    customer_name: customerDetails.customerName,
                    customer_gst: customerDetails.gstNumber,
                    customer_phone: customerDetails.phoneNumber,
                    total_amount: calculateGrandTotal()
                  }
                ])
                .select();
        
              if (invoiceError) throw invoiceError;
        
              // 2. Insert invoice items
              const invoiceId = invoiceData[0].id;
              const itemsToInsert = products.map(product => ({
                invoice_id: invoiceId,
                serial_number: product.serialNumber,
                product_name: product.productName,
                hsn_code: product.hsnCode,
                quantity: product.quantity,
                rate: product.rate,
                gst_percentage: product.gstPercentage,
                total_amount: product.totalAmount
              }));
        
              const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(itemsToInsert);
        
              if (itemsError) throw itemsError;
        
              alert('Invoice saved successfully!');
              // Reset form
              setStep(1);
              setCustomerDetails({ customerName: '', gstNumber: '', phoneNumber: '' });
              setProducts([{
                id: 1, serialNumber: 1, productName: '', hsnCode: '',
                quantity: 0, rate: 0, gstPercentage: 18, totalAmount: 0
              }]);
              
            } catch (error) {
              console.error('Error saving invoice:', error);
              alert('Error saving invoice: ' + error.message);
            }
            */

            // Simulated save for demo
            console.log('Saving invoice...', {
                customer: customerDetails,
                products: products,
                grandTotal: calculateGrandTotal()
            });

            setTimeout(() => {
                setSaving(false);
                alert('Invoice saved successfully! (Demo mode - implement Supabase)');
            }, 1000);
        };

        const validateStep1 = () => {
            return customerDetails.customerName &&
                customerDetails.customerAddress &&
                customerDetails.phoneNumber;
        };


        const [number, setNumber] = useState('');
        const [name, setName] = useState('');
        const [address, setAddress] = useState('');
        const [dateTime, setDateTime] = useState('');



        useEffect(() => {
            // Get current date and time in the format required by datetime-local input
            // Format: YYYY-MM-DDTHH:MM
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');

            const currentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
            setDateTime(currentDateTime);
        }, []);

        return (
            <>
                <div >

                    <p className='font-bold text-3xl text-center mt-4'>Invoice</p>

                    <div className='min-h-screen m-3 bg-[#FFFFFF] rounded-t-4xl py-10 px-8 border-[#E5E7EB] border flex flex-col' >

                        <div className='flex flex-col gap-5'>

                            <Input id="name" type="text" value={customerDetails.customerName} fxn={(e) => handleCustomerChange('customerName', e.target.value)} placeholder="Customer Name" />
                            <Input id="Address" type="text" value={customerDetails.customerAddress} fxn={(e) => handleCustomerChange('customerAddress', e.target.value)} placeholder="Customer Address" />
                            <Input id="number" type="number" value={customerDetails.phoneNumber} fxn={(e) => handleCustomerChange('phoneNumber', e.target.value)} placeholder="Mobile Number" />
                            <Input id="date_time" type="datetime-local" value={dateTime} fxn={(e) => { setDateTime(e.target.value); console.log(number) }} placeholder="Date & Time" />
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

                </div>
            </>
        )
    }

    export default Invoice