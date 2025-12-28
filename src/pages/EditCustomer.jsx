import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Save } from 'lucide-react';

const EditCustomer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [customer, setCustomer] = useState({
        name: '',
        phone_number: '',
        address: '',
        vehicle: ''
    });

    useEffect(() => {
        fetchCustomer();
    }, [id]);

    const fetchCustomer = async () => {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        if (!error && data) {
            setCustomer(data);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase
            .from('customers')
            .update({
                name: customer.name,
                phone_number: customer.phone_number,
                address: customer.address,
                vehicle: customer.vehicle
            })
            .eq('id', id);

        if (error) {
            alert('Error updating customer: ' + error.message);
        } else {
            alert('Customer updated successfully!');
            navigate('/search');
        }
        setSaving(false);
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
                        <button
                            onClick={() => navigate('/customer/search')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft size={20} />
                            Back
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer Name *
                            </label>
                            <input
                                type="text"
                                value={customer.name}
                                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                value={customer.phone_number}
                                onChange={(e) => setCustomer({ ...customer, phone_number: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <input
                                type="text"
                                value={customer.address || ''}
                                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vehicle
                            </label>
                            <input
                                type="text"
                                value={customer.vehicle || ''}
                                onChange={(e) => setCustomer({ ...customer, vehicle: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            onClick={() => navigate('/search')}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            <Save size={20} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCustomer;