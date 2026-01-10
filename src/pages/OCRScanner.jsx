import React, { useState, useCallback, useRef } from 'react';
import { Camera, Upload, X, Check, AlertCircle, Trash2, Edit2, Save, Plus, ChevronDown, ChevronUp, Crop, RotateCcw } from 'lucide-react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../supabaseClient';

// ============================================================================
// UI COMPONENTS
// ============================================================================

// Alert Component
function Alert({ children, variant = 'info', className = '' }) {
    const variants = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        error: 'bg-red-50 border-red-200 text-red-800'
    };

    return (
        <div className={`border rounded-lg p-4 ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
}

// Badge Component
function Badge({ children, variant = 'default', className = '' }) {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800'
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}

// ============================================================================
// UTILITY FUNCTIONS & CONSTANTS
// ============================================================================

const constants = {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    MIN_CONFIDENCE_SCORE: 0.7,
    GEMINI_MODEL: 'gemini-2.5-flash'
};

const imageUtils = {
    validateImage: (file) => {
        if (!file) {
            return { valid: false, error: 'No file selected' };
        }
        if (!constants.ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return { valid: false, error: 'Invalid file type. Please upload JPG, PNG, or WEBP.' };
        }
        if (file.size > constants.MAX_IMAGE_SIZE) {
            return { valid: false, error: 'File size exceeds 5MB limit.' };
        }
        return { valid: true };
    },

    convertToBase64: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    compressImage: async (file, maxWidth = 1920) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: file.type }));
                    }, file.type, 0.9);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    },

    getCroppedImage: (image, crop, fileName) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;

            canvas.width = crop.width * scaleX;
            canvas.height = crop.height * scaleY;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(
                image,
                crop.x * scaleX,
                crop.y * scaleY,
                crop.width * scaleX,
                crop.height * scaleY,
                0,
                0,
                crop.width * scaleX,
                crop.height * scaleY
            );

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(new File([blob], fileName || 'cropped-image.jpg', { type: 'image/jpeg' }));
            }, 'image/jpeg', 0.95);
        });
    }
};

// Image Cropper Component
function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
    const [crop, setCrop] = useState({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5
    });
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);

    const handleCropComplete = async () => {
        if (!completedCrop || !imgRef.current) {
            onCancel();
            return;
        }

        try {
            const croppedFile = await imageUtils.getCroppedImage(
                imgRef.current,
                completedCrop,
                'cropped-invoice.jpg'
            );
            onCropComplete(croppedFile);
        } catch (error) {
            console.error('Error cropping image:', error);
            onCancel();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-2">
                        <Crop className="text-blue-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-800">Crop Image</h2>
                    </div>
                    <p className="text-sm text-gray-600">Drag to adjust the crop area</p>
                </div>

                <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center">
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        className="max-h-[70vh]"
                    >
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Crop preview"
                            style={{ maxHeight: '70vh', maxWidth: '100%' }}
                            onLoad={(e) => {
                                // Set initial crop to cover most of the image
                                const { width, height } = e.currentTarget;
                                setCrop({
                                    unit: 'px',
                                    width: width * 0.9,
                                    height: height * 0.9,
                                    x: width * 0.05,
                                    y: height * 0.05
                                });
                            }}
                        />
                    </ReactCrop>
                </div>

                <div className="p-4 border-t flex gap-3 bg-gray-50">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <RotateCcw size={18} />
                        Cancel
                    </button>
                    <button
                        onClick={handleCropComplete}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <Check size={18} />
                        Apply Crop
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// SERVICES
// ============================================================================

const geminiService = {
    extractProductsFromImage: async (imageBase64, apiKey) => {
        if (!apiKey) {
            throw new Error('API key is required');
        }

        const prompt = `Analyze this invoice/receipt image and extract all products with their details.
    
Return a JSON array of products with this exact structure:
[
  {
    "name": "Product name",
    "quantity": number,
    "hsn_code": "HSN code",
    "price": number,
    "unit": "unit of measurement (pcs, kg, box, etc.)",
    "confidence": number (0-1)
  }
]

Rules:
- Extract only visible products from the image
- Calculate individual item price if total is given
- Use appropriate units (pcs, kg, liters, etc.)
- Set confidence based on text clarity
- Return empty array if no products found
- Ensure all prices are numbers without currency symbols`;

        try {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: constants.GEMINI_MODEL,
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: 'image/jpeg',
                                    data: imageBase64
                                }
                            }
                        ]
                    }
                ],
                config: {
                    temperature: 0.1,
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 2048,
                }
            });

            const text = response.text;

            if (!text) {
                throw new Error('No response from AI');
            }

            // Extract JSON from markdown code blocks or plain text
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('Could not parse AI response');
            }

            const products = JSON.parse(jsonMatch[1] || jsonMatch[0]);

            if (!Array.isArray(products)) {
                throw new Error('Invalid response format');
            }

            return products.map((p, index) => ({
                id: `product_${Date.now()}_${index}`,
                name: p.name || 'Unknown Product',
                quantity: Number(p.quantity) || 1,
                hsn_code: p.hsn_code || '0000',
                price: Number(p.price) || 0,
                unit: p.unit || 'pcs',
                confidence: Number(p.confidence) || 0.5,
                edited: false
            }));
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }
};

const validationService = {
    validateProduct: (product) => {
        const errors = [];

        if (!product.name || product.name.trim().length === 0) {
            errors.push('Product name is required');
        }
        if (product.name && product.name.length > 200) {
            errors.push('Product name too long (max 200 characters)');
        }
        if (!product.quantity || product.quantity <= 0) {
            errors.push('Quantity must be greater than 0');
        }
        if (!product.price || product.price < 0) {
            errors.push('Price must be 0 or greater');
        }
        if (!product.unit || product.unit.trim().length === 0) {
            errors.push('Unit is required');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    validateBatch: (products) => {
        const results = products.map(product => ({
            id: product.id,
            ...validationService.validateProduct(product)
        }));

        const allValid = results.every(r => r.valid);
        const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

        return {
            allValid,
            totalErrors,
            results
        };
    }
};

// Supabase product service - inserts products into the database
const productService = {
    createProducts: async (products) => {
        // Map OCR extracted data to match the products table schema
        const productsToInsert = products.map(p => ({
            product_name: p.name,
            purchase_rate: p.price,
            current_stock: p.quantity,
            hsn_code: p.hsn_code || '0000',
            brand: '',
            vehicle_model: '',
            minimum_stock: 0
        }));

        const { data, error } = await supabase
            .from('products')
            .insert(productsToInsert)
            .select();

        if (error) {
            console.error('Supabase insert error:', error);
            throw new Error(error.message || 'Failed to add products to database');
        }

        console.log('Products added to database:', data);
        return data;
    }
};

// ============================================================================
// INVOICE SCANNER COMPONENTS
// ============================================================================

function ApiKeyInput({ apiKey, setApiKey }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Camera className="mr-2" size={18} />
                Gemini API Key
            </label>
            <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">
                Get your free API key from{' '}
                <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                >
                    Google AI Studio
                </a>
            </p>
        </div>
    );
}

function ImageUpload({ onImageSelect, isProcessing, imagePreview, onCropClick }) {
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = imageUtils.validateImage(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        const compressedFile = await imageUtils.compressImage(file);
        onImageSelect(compressedFile);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isProcessing}
                    />
                </label>
            ) : (
                <div className="relative">
                    <img src={imagePreview} alt="Invoice preview" className="w-full rounded-lg" />
                    <div className="absolute top-2 right-2 flex gap-2">
                        <button
                            onClick={onCropClick}
                            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                            disabled={isProcessing}
                            title="Crop Image"
                        >
                            <Crop size={20} />
                        </button>
                        <button
                            onClick={() => onImageSelect(null)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            disabled={isProcessing}
                            title="Remove Image"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function ProductCard({ product, onUpdate, onDelete, isSelected, onToggleSelect }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(product);

    const handleSave = () => {
        onUpdate(product.id, editData);
        setIsEditing(false);
    };

    const validation = validationService.validateProduct(editData);
    const confidenceColor = product.confidence >= 0.8 ? 'success' : product.confidence >= 0.6 ? 'warning' : 'error';

    return (
        <div className={`bg-white rounded-lg shadow p-4 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onToggleSelect(product.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                    />
                    <Badge variant={confidenceColor}>
                        {Math.round(product.confidence * 100)}% confidence
                    </Badge>
                    {product.edited && <Badge variant="info">Edited</Badge>}
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            disabled={!validation.valid}
                            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                        >
                            <Save size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                            <Edit2 size={18} />
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(product.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        placeholder="Product name"
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                    <div className="grid grid-cols-4 gap-2">
                        <input
                            type="number"
                            value={editData.quantity}
                            onChange={(e) => setEditData({ ...editData, quantity: parseFloat(e.target.value) })}
                            placeholder="Qty"
                            className="px-3 py-2 border rounded-lg"
                        />
                        <input
                            type="number"
                            value={editData.price}
                            onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                            placeholder="Price"
                            className="px-3 py-2 border rounded-lg"
                        />
                        <input
                            type="text"
                            value={editData.unit}
                            onChange={(e) => setEditData({ ...editData, unit: e.target.value })}
                            placeholder="Unit"
                            className="px-3 py-2 border rounded-lg"
                        />
                        <input
                            type="text"
                            value={editData.hsn_code}
                            onChange={(e) => setEditData({ ...editData, hsn_code: e.target.value })}
                            placeholder="HSN"
                            className="px-3 py-2 border rounded-lg"
                        />
                    </div>
                    {!validation.valid && (
                        <Alert variant="error" className="text-xs">
                            {validation.errors.join(', ')}
                        </Alert>
                    )}
                </div>
            ) : (
                <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Quantity: {product.quantity} {product.unit}</span>
                        <span className="font-semibold">₹{product.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>HSN: {product.hsn_code || 'N/A'}</span>
                        <span>Total: ₹{(product.quantity * product.price).toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function BulkActionsPanel({ selectedIds, products, onDeleteSelected, onSelectAll, onDeselectAll }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const selectedCount = selectedIds.length;
    const totalProducts = products.length;

    if (totalProducts === 0) return null;

    return (
        <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-blue-100 rounded"
                    >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <span className="font-medium text-gray-700">
                        {selectedCount} of {totalProducts} selected
                    </span>
                </div>
                {isExpanded && (
                    <div className="flex gap-2">
                        <button
                            onClick={onSelectAll}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Select All
                        </button>
                        <button
                            onClick={onDeselectAll}
                            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Deselect All
                        </button>
                        {selectedCount > 0 && (
                            <button
                                onClick={onDeleteSelected}
                                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                            >
                                <Trash2 size={16} />
                                Delete Selected
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function ConfirmationModal({ products, onConfirm, onCancel, isProcessing }) {
    const validation = validationService.validateBatch(products);
    const total = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Confirm Products</h2>
                    <p className="text-gray-600 mt-1">Review before adding to inventory</p>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {!validation.allValid && (
                        <Alert variant="error" className="mb-4">
                            <AlertCircle className="inline mr-2" size={18} />
                            {validation.totalErrors} validation error(s) found. Please fix before confirming.
                        </Alert>
                    )}

                    <div className="space-y-3 mb-6">
                        {products.map((product) => {
                            const productValidation = validationService.validateProduct(product);
                            return (
                                <div
                                    key={product.id}
                                    className={`p-4 rounded-lg ${productValidation.valid ? 'bg-gray-50' : 'bg-red-50 border border-red-200'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">{product.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                {product.quantity} {product.unit} × ${product.price.toFixed(2)} = ${(product.quantity * product.price).toFixed(2)}
                                            </p>
                                        </div>
                                        {!productValidation.valid && (
                                            <Badge variant="error">Invalid</Badge>
                                        )}
                                    </div>
                                    {!productValidation.valid && (
                                        <div className="mt-2 text-xs text-red-600">
                                            {productValidation.errors.join(', ')}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                            {products.length} product(s)
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!validation.allValid || isProcessing}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <Check size={18} />
                                Confirm & Add
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN INVOICE SCANNER
// ============================================================================

export default function InvoiceScanner() {
    const [apiKey, setApiKey] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [products, setProducts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [error, setError] = useState(null);

    const handleImageSelect = useCallback((file) => {
        if (!file) {
            setImage(null);
            setImagePreview(null);
            setProducts([]);
            setError(null);
            return;
        }

        setImage(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
    }, []);

    const handleScan = async () => {
        if (!apiKey) {
            setError('Please enter your Gemini API key');
            return;
        }
        if (!image) {
            setError('Please upload an image');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const base64 = await imageUtils.convertToBase64(image);
            const extractedProducts = await geminiService.extractProductsFromImage(base64, apiKey);

            if (extractedProducts.length === 0) {
                setError('No products found in the image. Please try a clearer image.');
            } else {
                setProducts(extractedProducts);
            }
        } catch (err) {
            setError(err.message || 'Failed to process image');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateProduct = (id, updatedData) => {
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...updatedData, id, edited: true } : p
        ));
    };

    const handleDeleteProduct = (id) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        setSelectedIds(prev => prev.filter(sid => sid !== id));
    };

    const handleToggleSelect = (id, checked) => {
        setSelectedIds(prev =>
            checked ? [...prev, id] : prev.filter(sid => sid !== id)
        );
    };

    const handleSelectAll = () => {
        setSelectedIds(products.map(p => p.id));
    };

    const handleDeselectAll = () => {
        setSelectedIds([]);
    };

    const handleDeleteSelected = () => {
        setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
    };

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            await productService.createProducts(products);
            alert('Products added successfully to database!');
            setProducts([]);
            setImage(null);
            setImagePreview(null);
            setShowConfirmation(false);
        } catch (err) {
            setError(err.message || 'Failed to add products');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Invoice Scanner</h1>
                    <p className="text-gray-600">Upload an invoice to automatically extract products</p>
                </div>

                <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />

                {error && (
                    <Alert variant="error" className="mb-6">
                        <AlertCircle className="inline mr-2" size={18} />
                        {error}
                    </Alert>
                )}

                <ImageUpload
                    onImageSelect={handleImageSelect}
                    isProcessing={isProcessing}
                    imagePreview={imagePreview}
                    onCropClick={() => setShowCropper(true)}
                />

                {imagePreview && products.length === 0 && (
                    <button
                        onClick={handleScan}
                        disabled={isProcessing || !apiKey}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium mb-6"
                    >
                        {isProcessing ? 'Scanning...' : 'Scan Invoice'}
                    </button>
                )}

                {products.length > 0 && (
                    <>
                        <BulkActionsPanel
                            selectedIds={selectedIds}
                            products={products}
                            onDeleteSelected={handleDeleteSelected}
                            onSelectAll={handleSelectAll}
                            onDeselectAll={handleDeselectAll}
                        />

                        <div className="space-y-4 mb-6">
                            {products.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onUpdate={handleUpdateProduct}
                                    onDelete={handleDeleteProduct}
                                    isSelected={selectedIds.includes(product.id)}
                                    onToggleSelect={handleToggleSelect}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => setShowConfirmation(true)}
                            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                        >
                            <Check size={20} />
                            Review & Add Products ({products.length})
                        </button>
                    </>
                )}

                {showConfirmation && (
                    <ConfirmationModal
                        products={products}
                        onConfirm={handleConfirm}
                        onCancel={() => setShowConfirmation(false)}
                        isProcessing={isProcessing}
                    />
                )}

                {showCropper && imagePreview && (
                    <ImageCropper
                        imageSrc={imagePreview}
                        onCropComplete={(croppedFile) => {
                            handleImageSelect(croppedFile);
                            setShowCropper(false);
                        }}
                        onCancel={() => setShowCropper(false)}
                    />
                )}
            </div>
        </div>
    );
}