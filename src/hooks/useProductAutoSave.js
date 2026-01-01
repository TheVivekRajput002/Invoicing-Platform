import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useProductAutoSave = (products, productsFromDB) => {
    const [autoSavedProducts, setAutoSavedProducts] = useState(new Set());

    const autoSaveNewProduct = async (product) => {
        if (!product.productName || !product.hsnCode || !product.rate) {
            return;
        }

        const productKey = product.productName + product.hsnCode;

        if (autoSavedProducts.has(productKey)) {
            return;
        }

        try {
            const { data: existing, error: searchError } = await supabase
                .from('products')
                .select('id')
                .eq('product_name', product.productName)
                .eq('hsn_code', product.hsnCode)
                .maybeSingle();

            if (searchError) throw searchError;

            if (existing) {
                console.log('Product already exists in DB:', product.productName);
                return;
            }

            const { data: newProduct, error: insertError } = await supabase
                .from('products')
                .insert([{
                    product_name: product.productName,
                    hsn_code: product.hsnCode,
                    base_rate: product.rate,
                    purchase_rate: product.rate * 0.8,
                    gst_rate: product.gstPercentage,
                    current_stock: 0,
                    minimum_stock: 5,
                    brand: '',
                    vehicle_model: ''
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            console.log('✅ New product auto-saved to inventory:', product.productName);
            setAutoSavedProducts(prev => new Set([...prev, productKey]));

        } catch (error) {
            console.error('Error auto-saving product:', error);
        }
    };

    useEffect(() => {
        const checkAndSaveNewProducts = async () => {
            for (const product of products) {
                const isComplete = product.productName && product.hsnCode && product.rate;
                const isFromDB = productsFromDB.has(product.id);
                const alreadySaved = autoSavedProducts.has(product.productName + product.hsnCode);

                if (isComplete && !isFromDB && !alreadySaved) {
                    await autoSaveNewProduct(product);
                }
            }
        };

        const timer = setTimeout(() => {
            checkAndSaveNewProducts();
        }, 1000);

        return () => clearTimeout(timer);
    }, [products]);

    return { autoSaveNewProduct };
};