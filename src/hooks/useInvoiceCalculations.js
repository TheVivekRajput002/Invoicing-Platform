import { useMemo } from 'react';

export const useInvoiceCalculations = (products, gstIncluded) => {
    const calculateProductTotal = (quantity, rate, gstPercentage) => {
        if (gstIncluded) {
            return quantity * rate;
        } else {
            const baseAmount = quantity * rate;
            const gstAmount = (baseAmount * gstPercentage) / 100;
            return baseAmount + gstAmount;
        }
    };

    const subtotal = useMemo(() => {
        return products.reduce((sum, product) => {
            const base = product.quantity * product.rate;
            return sum + base;
        }, 0);
    }, [products]);

    const totalGST = useMemo(() => {
        if (gstIncluded) return 0;
        return products.reduce((sum, product) => {
            const base = product.quantity * product.rate;
            const gst = (base * product.gstPercentage) / 100;
            return sum + gst;
        }, 0);
    }, [products, gstIncluded]);

    const grandTotal = useMemo(() => {
        return products.reduce((sum, product) => sum + product.totalAmount, 0);
    }, [products]);

    return {
        calculateProductTotal,
        subtotal,
        totalGST,
        grandTotal
    };
};