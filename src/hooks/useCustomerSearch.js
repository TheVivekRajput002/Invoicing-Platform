import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useCustomerSearch = (phoneNumber) => {
    const [searching, setSearching] = useState(false);
    const [found, setFound] = useState(false);
    const [customerData, setCustomerData] = useState(null);

    useEffect(() => {
        const searchCustomer = async () => {
            if (!phoneNumber || phoneNumber.length !== 10) {
                setFound(false);
                setCustomerData(null);
                return;
            }

            setSearching(true);
            try {
                const { data, error } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('phone_number', phoneNumber)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (error) throw error;

                if (data) {
                    setCustomerData(data);
                    setFound(true);
                } else {
                    setFound(false);
                    setCustomerData(null);
                }
            } catch (error) {
                console.error('Error searching customer:', error);
                setFound(false);
                setCustomerData(null);
            } finally {
                setSearching(false);
            }
        };

        const timer = setTimeout(searchCustomer, 500);
        return () => clearTimeout(timer);
    }, [phoneNumber]);

    return { searching, found, customerData };
};