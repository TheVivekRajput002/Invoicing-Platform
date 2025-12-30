import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    // Header Section
    headerContainer: {
        borderTop: 4,
        borderBottom: 4,
        borderColor: '#1f2937',
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
        padding: 15,
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
        flexWrap: 'wrap',
        gap: 10,
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
        padding: 15,
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
        padding: 15,
        backgroundColor: '#f9fafb',
        borderTop: 2,
        borderColor: '#d1d5db',
    },
    totalGrid: {
        flexDirection: 'row',
        gap: 20,
    },
    paymentMode: {
        width: '50%',
    },
    totalsBox: {
        width: '50%',
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
        padding: 10,
        borderRadius: 4,
        marginTop: 5,
    },
    grandTotalLabel: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
    },
    grandTotalValue: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
    },
    paymentBadge: {
        padding: 6,
        backgroundColor: '#ffffff',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    paymentBadgeInner: {
        padding: 4,
        borderRadius: 12,
        fontSize: 9,
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
        marginTop: 30,
        padding: 15,
        borderTop: 2,
        borderColor: '#d1d5db',
    },
    signatureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    signatureBox: {
        width: '45%',
    },
    signatureLabel: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#374151',
        marginBottom: 30,
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
        marginTop: 15,
        textAlign: 'center',
        fontSize: 8,
        color: '#9ca3af',
        fontStyle: 'italic',
    },
});

const InvoicePDF = ({ invoice, customer, products }) => {
    // Calculate totals
    const calculateSubtotal = () => {
        return products.reduce((sum, product) => {
            const base = product.quantity * product.rate;
            return sum + base;
        }, 0);
    };

    const calculateTotalGST = () => {
        return products.reduce((sum, product) => {
            const base = product.quantity * product.rate;
            const gst = (base * product.gstPercentage) / 100;
            return sum + gst;
        }, 0);
    };

    const calculateGrandTotal = () => {
        return products.reduce((sum, product) => sum + product.totalAmount, 0);
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
                            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
                            <View style={styles.invoiceDetailsRow}>
                                <Text style={styles.invoiceLabel}>Invoice No:</Text>
                                <Text style={styles.invoiceValue}>{invoice.invoice_number}</Text>
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
                        </View>
                    </View>
                </View>

                {/* Customer Details */}
                <View style={styles.customerSection}>
                    <Text style={styles.sectionTitle}>BILL TO</Text>
                    <View style={styles.customerGrid}>
                        <View style={styles.customerField}>
                            <Text style={styles.fieldLabel}>Phone Number</Text>
                            <View style={styles.fieldValue}>
                                <Text>{customer?.phone_number || 'N/A'}</Text>
                            </View>
                        </View>
                        <View style={styles.customerField}>
                            <Text style={styles.fieldLabel}>Customer Name</Text>
                            <View style={styles.fieldValue}>
                                <Text>{customer?.name || 'N/A'}</Text>
                            </View>
                        </View>
                        <View style={styles.customerField}>
                            <Text style={styles.fieldLabel}>Address</Text>
                            <View style={styles.fieldValue}>
                                <Text>{customer?.address || 'N/A'}</Text>
                            </View>
                        </View>
                        <View style={styles.customerField}>
                            <Text style={styles.fieldLabel}>Vehicle Number</Text>
                            <View style={styles.fieldValue}>
                                <Text>{customer?.vehicle || 'N/A'}</Text>
                            </View>
                        </View>
                        {invoice.gstin && (
                            <View style={[styles.customerField, { width: '100%' }]}>
                                <Text style={styles.fieldLabel}>GSTIN</Text>
                                <View style={styles.fieldValue}>
                                    <Text>{invoice.gstin}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.itemsSection}>
                    <Text style={styles.sectionTitle}>ITEMS</Text>
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
                        {/* Payment Mode */}
                        <View style={styles.paymentMode}>
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

                        {/* Totals */}
                        <View style={styles.totalsBox}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Subtotal:</Text>
                                <Text style={styles.totalValue}>₹{calculateSubtotal().toFixed(2)}</Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total GST:</Text>
                                <Text style={styles.totalValue}>₹{calculateTotalGST().toFixed(2)}</Text>
                            </View>
                            <View style={styles.grandTotalRow}>
                                <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
                                <Text style={styles.grandTotalValue}>₹{calculateGrandTotal().toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Signature and Terms Section */}
                <View style={styles.footerSection}>
                    {/* Signatures */}
                    <View style={styles.signatureRow}>
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureLabel}>Customer Signature</Text>
                            <View style={styles.signatureLine}>
                                <Text style={styles.signatureText}>Signature & Date</Text>
                            </View>
                        </View>
                        <View style={styles.signatureBox}>
                            <Text style={styles.signatureLabel}>Authorized Signatory</Text>
                            <View style={styles.signatureLine}>
                                <Text style={styles.signatureText}>For Shiv Shakti Automobile</Text>
                            </View>
                        </View>
                    </View>

                    {/* Terms and Conditions */}
                    <View style={styles.termsSection}>
                        <Text style={styles.termsTitle}>Terms & Conditions</Text>
                        <Text style={styles.termItem}>
                            • All disputes are subject to Vidisha jurisdiction only.
                        </Text>
                        <Text style={styles.termItem}>
                            • Goods once sold will not be taken back or exchanged.
                        </Text>
                        <Text style={styles.termItem}>
                            • Payment should be made within 30 days of invoice date.
                        </Text>
                        <Text style={styles.termItem}>
                            • Interest @18% per annum will be charged on delayed payments.
                        </Text>
                        <Text style={styles.termItem}>
                            • Subject to terms and conditions as per our standard policy.
                        </Text>
                    </View>

                    {/* Footer Note */}
                    <Text style={styles.footerNote}>
                        This is a computer-generated invoice and does not require a physical signature.
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default InvoicePDF;