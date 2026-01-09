// components/invoice/ImageUpload.jsx
import React from 'react';
import { Upload, FileText, Loader2, Scan } from 'lucide-react';

export default function ImageUpload({ preview, loading, onImageUpload, onExtractData, disabled }) {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onImageUpload(file);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Upload className="mr-2" size={24} />
                Upload Invoice
            </h2>

            {/* Image Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                    {preview ? (
                        <div className="relative">
                            <img
                                src={preview}
                                alt="Invoice preview"
                                className="max-h-64 mx-auto rounded shadow-sm"
                            />
                            <div className="mt-3 text-sm text-blue-600 hover:underline">
                                Change image
                            </div>
                        </div>
                    ) : (
                        <div>
                            <FileText className="mx-auto mb-4 text-gray-400" size={48} />
                            <p className="text-gray-600 font-medium">Click to upload invoice image</p>
                            <p className="text-sm text-gray-400 mt-2">PNG, JPG, WEBP supported</p>
                        </div>
                    )}
                </label>
            </div>

            {/* Extract Button */}
            <button
                onClick={onExtractData}
                disabled={!preview || loading || disabled}
                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin mr-2" size={20} />
                        Extracting data...
                    </>
                ) : (
                    <>
                        <Scan className="mr-2" size={20} />
                        Extract Data
                    </>
                )}
            </button>

            {disabled && (
                <p className="text-xs text-amber-600 mt-2 text-center">
                    Please enter API key first
                </p>
            )}
        </div>
    );
}