import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
    page: {
        padding: 15,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    // Header Section
    headerContainer: {
        marginBottom: 0,
    },
    headerGrid: {
        flexDirection: 'row',
        borderBottom: 2,
        borderColor: '#d1d5db',
    },
    companySection: {
        width: '50%',
        padding: 15,
        borderRight: 2,
        borderColor: '#d1d5db',
    },
    companyHeader: {
        flexDirection: 'row',
        gap: 10,
    },
    logoBox: {
        width: 50,
        height: 50,
        backgroundColor: '#fbbf24',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 24,
        color: '#1f2937',
        fontFamily: 'Helvetica-Bold',
    },
    companyDetails: {
        flex: 1,
    },
    companyName: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    companyAddress: {
        fontSize: 9,
        color: '#4b5563',
        marginBottom: 2,
    },
    invoiceSection: {
        width: '50%',
        padding: 15,
        backgroundColor: '#f9fafb',
    },
    invoiceTitle: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        color: '#1f2937',
        marginBottom: 10,
        textAlign: 'center',
        marginTop: 10,
    },
    invoiceDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    invoiceLabel: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
    },
    invoiceValue: {
        fontSize: 9,
        color: '#111827',
    },
    // Customer Section
    customerSection: {
        padding: 10,
        paddingBottom: 10,
        backgroundColor: '#eff6ff',
        borderBottom: 2,
        borderColor: '#d1d5db',
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#1f2937',
        marginBottom: 10,
    },
    customerGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
    },
    customerColumn: {
        width: '48%',
    },
    customerField: {
        width: '48%',
        marginBottom: 8,
    },
    fieldLabel: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
        marginBottom: 3,
        width: '50%'
    },
    fieldValue: {
        fontSize: 9,
        color: '#111827',
        padding: 6,
        backgroundColor: '#ffffff',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    // Items Section
    itemsSection: {
        padding: 10,
    },
    table: {
        borderWidth: 2,
        borderColor: '#d1d5db',
        borderRadius: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1f2937',
        color: '#ffffff',
        padding: 8,
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: 1,
        borderColor: '#d1d5db',
        padding: 8,
        fontSize: 9,
    },
    col1: { width: '5%', textAlign: 'center' },
    col2: { width: '30%' },
    col3: { width: '12%' },
    col4: { width: '10%', textAlign: 'center' },
    col5: { width: '13%', textAlign: 'right' },
    col6: { width: '10%', textAlign: 'center' },
    col7: { width: '20%', textAlign: 'right' },
    // Total Section
    totalSection: {
        padding: 8,
        backgroundColor: '#f9fafb',
    },
    totalGrid: {
        flexDirection: 'row',
        gap: 20,
        alignItems: 'flex-start',
    },
    paymentMode: {
        width: '50%',
    },
    totalsBox: {
        width: '100%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottom: 1,
        borderColor: '#d1d5db',
    },
    totalLabel: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
    },
    totalValue: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#1f2937',
        color: '#ffffff',
        padding: 6,
        borderRadius: 4,
        marginTop: 5,
    },
    grandTotalLabel: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
    },
    grandTotalValue: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
    },
    paymentBadge: {
        padding: 4,
        backgroundColor: '#ffffff',
        borderRadius: 3,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        width: '50%'
    },
    paymentBadgeInner: {
        padding: 3,
        borderRadius: 10,
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
    },
    paymentPaid: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
    },
    paymentUnpaid: {
        backgroundColor: '#fef3c7',
        color: '#92400e',
    },
    // Signature and Terms Section
    footerSection: {
        padding: 8,
        borderTop: 2,
        borderColor: '#d1d5db',
    },
    signatureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    signatureBox: {
        width: '45%',
    },
    signatureLabel: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
        marginBottom: 20,
    },
    signatureLine: {
        borderTop: 1,
        borderColor: '#9ca3af',
        paddingTop: 5,
    },
    signatureText: {
        fontSize: 8,
        color: '#6b7280',
        textAlign: 'center',
    },
    termsSection: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#f9fafb',
        borderRadius: 4,
    },
    termsTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    termItem: {
        fontSize: 8,
        color: '#4b5563',
        marginBottom: 4,
        paddingLeft: 10,
    },
    footerNote: {
        marginTop: 8,
        textAlign: 'center',
        fontSize: 7,
        color: '#9ca3af',
        fontStyle: 'italic',
    },
    termsPlaceholder: {
        width: '50%',
        paddingRight: 10,
    },
    totalsContainer: {
        width: '50%',
        paddingLeft: 10,
    },
    totalsBox: {
        width: '100%',
    },
    paymentModeBelow: {
        flexDirection: 'row',
        width: '100%',
        marginTop: 10,
        marginLeft: 'auto',
        alignItems: 'center',
    },
    termsSectionInline: {
        padding: 10,
        backgroundColor: '#f9fafb',
        borderRadius: 4,
        borderWidth: 1,

        borderColor: '#e5e7eb',
    },
    customerInfoText: {
        paddingLeft: 5,
    },
    customerTextLine: {
        fontSize: 10,
        marginBottom: 4,
        color: '#111827',
    },
    customerLabel: {
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
    },
    customerValue: {
        fontFamily: 'Helvetica',
        color: '#111827',
    },
    // Add these new styles in your StyleSheet.create()
    gstBreakdownBox: {
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderRadius: 4,
        padding: 8,
        backgroundColor: '#f9fafb',
        marginBottom: 8,
    },
    gstBreakdownTitle: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    gstBreakdownItem: {
        marginBottom: 8,
    },
    gstBreakdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    gstRateLabel: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#4b5563',
    },
    gstTotalAmount: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#2563eb',
    },
    gstDetailsGrid: {
        flexDirection: 'row',
        gap: 4,
    },
    gstDetailBox: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 3,
        padding: 4,
    },
    gstDetailLabel: {
        fontSize: 7,
        color: '#6b7280',
    },
    gstDetailValue: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
    },
    gstSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 6,
        marginTop: 6,
        borderTop: 1,
        borderColor: '#d1d5db',
    },
    gstSummaryLabel: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
    },
    gstSummaryValue: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#2563eb',
    },
});

const InvoicePDF = ({ isInvoice, pageHead, invoice, customer, products, gstIncluded }) => {


    // Calculate totals with gstIncluded logic
    const calculateSubtotal = () => {
        return products.reduce((sum, product) => {
            if (gstIncluded) {
                // When GST is included, subtotal is base price (rate without GST)
                const basePrice = product.rate / (1 + product.gstPercentage / 100);
                return sum + (product.quantity * basePrice);
            } else {
                // When GST is not included, subtotal is just quantity × rate
                return sum + (product.quantity * product.rate);
            }
        }, 0);
    };

    const calculateTotalGST = () => {
        return products.reduce((sum, product) => {
            if (gstIncluded) {
                // When GST is included, extract GST from the rate
                const basePrice = product.rate / (1 + product.gstPercentage / 100);
                const gstAmount = product.rate - basePrice;
                return sum + (product.quantity * gstAmount);
            } else {
                // When GST is not included, calculate GST on base amount
                const base = product.quantity * product.rate;
                const gst = (base * product.gstPercentage) / 100;
                return sum + gst;
            }
        }, 0);
    };

    const calculateGrandTotal = () => {
        // Grand total is always subtotal + totalGST
        return calculateSubtotal() + calculateTotalGST();
    };

    const calculateGSTDistribution = () => {
        const distribution = {};

        products.forEach(product => {
            let baseAmount;
            let gstAmount;

            if (gstIncluded) {
                // When GST is included in rate
                const basePrice = product.rate / (1 + product.gstPercentage / 100);
                baseAmount = product.quantity * basePrice;
                gstAmount = (product.quantity * product.rate) - baseAmount;
            } else {
                // When GST is not included
                baseAmount = product.quantity * product.rate;
                gstAmount = (baseAmount * product.gstPercentage) / 100;
            }

            if (product.gstPercentage > 0) {
                const gstKey = `${product.gstPercentage}%`;
                if (!distribution[gstKey]) {
                    distribution[gstKey] = {
                        rate: product.gstPercentage,
                        taxableAmount: 0,
                        cgst: 0,
                        sgst: 0,
                        totalGst: 0
                    };
                }

                distribution[gstKey].taxableAmount += baseAmount;
                distribution[gstKey].cgst += gstAmount / 2;
                distribution[gstKey].sgst += gstAmount / 2;
                distribution[gstKey].totalGst += gstAmount;
            }
        });

        return Object.values(distribution);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Section */}
                <View style={styles.headerContainer}>
                    <Text style={styles.invoiceTitle}>{pageHead}</Text>
                    <View style={styles.headerGrid}>
                        {/* Company Details */}
                        <View style={styles.companySection}>
                            <View style={styles.companyHeader}>
                                <View style={styles.logoBox}>
                                    <Text style={styles.logoText}>SS</Text>
                                </View>
                                <View style={styles.companyDetails}>
                                    <Text style={styles.companyName}>Shiv Shakti Automobile</Text>
                                    <Text style={styles.companyAddress}>Near new Bus Stand, Vidisha, M.P.</Text>
                                    <Text style={styles.companyAddress}>Mobile No. - 9993646020</Text>
                                    <Text style={styles.companyAddress}>GST: 23AYKPR3166N1ZV</Text>
                                </View>
                            </View>
                        </View>

                        {/* Invoice Details */}
                        <View style={styles.invoiceSection}>
                            <View style={styles.invoiceDetailsRow}>
                                <Text style={styles.invoiceLabel}>Invoice No:</Text>
                                <Text style={styles.invoiceValue}>{invoice.invoice_number || invoice.estimate_number}</Text>
                            </View>
                            <View style={styles.invoiceDetailsRow}>
                                <Text style={styles.invoiceLabel}>Invoice Date:</Text>
                                <Text style={styles.invoiceValue}>{formatDate(invoice.bill_date)}</Text>
                            </View>
                            <View style={styles.invoiceDetailsRow}>
                                <Text style={styles.invoiceLabel}>Created At:</Text>
                                <Text style={styles.invoiceValue}>
                                    {new Date(invoice.created_at).toLocaleString('en-IN')}
                                </Text>
                            </View>

                            {/* GSTIN - Full Width */}
                            {invoice.gstin && (
                                <View style={styles.invoiceDetailsRow}>
                                    <Text style={styles.invoiceLabel}>GSTIN: </Text>
                                    <Text style={styles.invoiceValue}>
                                        {invoice.gstin}
                                    </Text>
                                </View>
                            )}

                        </View>
                    </View>
                </View>

                {/* Customer Details */}
                <View style={styles.customerSection}>
                    <View style={styles.customerInfoText}>
                        <View style={styles.customerGrid}>
                            {/* Left Column */}
                            <View style={styles.customerColumn}>
                                <Text style={styles.customerTextLine}>
                                    <Text style={styles.customerLabel}>Name: </Text>
                                    <Text style={styles.customerValue}>{customer?.name || 'N/A'}</Text>
                                </Text>
                                <Text style={styles.customerTextLine}>
                                    <Text style={styles.customerLabel}>Phone: </Text>
                                    <Text style={styles.customerValue}>{customer?.phone_number || 'N/A'}</Text>
                                </Text>
                            </View>

                            {/* Right Column */}
                            <View style={styles.customerColumn}>
                                <Text style={styles.customerTextLine}>
                                    <Text style={styles.customerLabel}>Vehicle / Mechanic: </Text>
                                    <Text style={styles.customerValue}>{customer?.vehicle || 'N/A'}</Text>
                                </Text>
                                <Text style={styles.customerTextLine}>
                                    <Text style={styles.customerLabel}>Address: </Text>
                                    <Text style={styles.customerValue}>{customer?.address || 'N/A'}</Text>
                                </Text>
                            </View>
                        </View>

                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.itemsSection}>
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={styles.col1}>S.No</Text>
                            <Text style={styles.col2}>Product Name</Text>
                            <Text style={styles.col3}>HSN</Text>
                            <Text style={styles.col4}>Qty</Text>
                            <Text style={styles.col5}>Rate</Text>
                            <Text style={styles.col6}>GST %</Text>
                            <Text style={styles.col7}>Amount</Text>
                        </View>

                        {/* Table Rows */}
                        {products.map((product, index) => (
                            <View key={product.id} style={styles.tableRow}>
                                <Text style={styles.col1}>{index + 1}</Text>
                                <Text style={styles.col2}>{product.productName}</Text>
                                <Text style={styles.col3}>{product.hsnCode}</Text>
                                <Text style={styles.col4}>{product.quantity}</Text>
                                <Text style={styles.col5}>₹{parseFloat(product.rate).toFixed(2)}</Text>
                                <Text style={styles.col6}>{product.gstPercentage}%</Text>
                                <Text style={styles.col7}>₹{parseFloat(product.totalAmount).toFixed(2)}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Total Section */}
                <View style={styles.totalSection}>
                    <View style={styles.totalGrid}>

                        {/* Left side - Terms and Conditions */}
                        <View style={styles.termsPlaceholder}>
                            <View style={styles.termsSectionInline}>

                                <Text style={styles.termsTitle}>Terms & Conditions</Text>
                                <Text style={styles.termItem}>
                                    • Errors and omissions are subject to correction.
                                </Text>
                                <Text style={styles.termItem}>
                                    • Goods once sold will not be taken back or exchanged.
                                </Text>
                                <Text style={styles.termItem}>
                                    • Subject to Vidisha Jurisdiction.
                                </Text>

                            </View>
                        </View>

                        {/* Right side - Totals and Payment */}
                        <View style={styles.totalsContainer}>

                            {/* Totals */}
                            <View style={styles.totalsBox}>
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Subtotal:</Text>
                                    <Text style={styles.totalValue}>₹{calculateSubtotal().toFixed(2)}</Text>
                                </View>

                                {/* 🆕 GST BREAKDOWN - ADD THIS */}
                                {calculateGSTDistribution().length > 0 && (
                                    <View style={styles.gstBreakdownBox}>
                                        <Text style={styles.gstBreakdownTitle}>GST Breakdown</Text>

                                        {calculateGSTDistribution().map((gst, index) => (
                                            <View key={index} style={styles.gstBreakdownItem}>
                                                <View style={styles.gstBreakdownHeader}>
                                                    <Text style={styles.gstRateLabel}>GST @ {gst.rate}%</Text>
                                                    <Text style={styles.gstTotalAmount}>₹{gst.totalGst.toFixed(2)}</Text>
                                                </View>

                                                <View style={styles.gstDetailsGrid}>
                                                    <View style={styles.gstDetailBox}>
                                                        <Text style={styles.gstDetailLabel}>Taxable</Text>
                                                        <Text style={styles.gstDetailValue}>₹{gst.taxableAmount.toFixed(2)}</Text>
                                                    </View>
                                                    <View style={styles.gstDetailBox}>
                                                        <Text style={styles.gstDetailLabel}>CGST</Text>
                                                        <Text style={styles.gstDetailValue}>₹{gst.cgst.toFixed(2)}</Text>
                                                    </View>
                                                    <View style={styles.gstDetailBox}>
                                                        <Text style={styles.gstDetailLabel}>SGST</Text>
                                                        <Text style={styles.gstDetailValue}>₹{gst.sgst.toFixed(2)}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ))}

                                        <View style={styles.gstSummaryRow}>
                                            <Text style={styles.gstSummaryLabel}>Total GST:</Text>
                                            <Text style={styles.gstSummaryValue}>₹{calculateTotalGST().toFixed(2)}</Text>
                                        </View>
                                    </View>
                                )}
                                {/* 🆕 END GST BREAKDOWN */}

                                <View style={styles.grandTotalRow}>
                                    <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
                                    <Text style={styles.grandTotalValue}>₹{calculateGrandTotal().toFixed(2)}</Text>
                                </View>
                            </View>

                            {/* Payment Mode below totals */}
                            {isInvoice ? (
                                <View style={styles.paymentModeBelow}>
                                    <Text style={styles.fieldLabel}>Payment Mode</Text>
                                    <View style={styles.paymentBadge}>
                                        <View
                                            style={[
                                                styles.paymentBadgeInner,
                                                invoice.mode_of_payment === 'cash' || invoice.mode_of_payment === 'online'
                                                    ? styles.paymentPaid
                                                    : styles.paymentUnpaid,
                                            ]}
                                        >
                                            <Text>{invoice.mode_of_payment.toUpperCase()}</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : ""}

                        </View>
                    </View>
                </View>

                {/* Signature and Terms Section */}
                <View style={styles.footerSection}>
                    {/* Signatures */}
                    <View style={styles.signatureRow}>
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureText}>Customer Signature</Text>
                        </View>
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureText}>Authorized Signature</Text>
                        </View>
                    </View>

                    {/* Footer Note */}
                    <Text style={styles.footerNote}>
                        This is a computer-generated invoice and does not require a physical signature.
                    </Text>
                </View>
            </Page>
        </Document >
    );
};

export default InvoicePDF;