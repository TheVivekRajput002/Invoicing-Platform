// components/invoice/BulkActionsPanel.jsx
import React from 'react';
import { CheckSquare, Square, ArrowRight } from 'lucide-react';

export default function BulkActionsPanel({
    totalProducts,
    selectedCount,
    onSelectAll,
    onDeselectAll,
    onProceed
}) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                        {selectedCount} of {totalProducts} selected
                    </span>

                    <div className="flex space-x-2">
                        <button
                            onClick={onSelectAll}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                        >
                            <CheckSquare size={16} className="mr-1" />
                            Select All
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                            onClick={onDeselectAll}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                        >
                            <Square size={16} className="mr-1" />
                            Deselect All
                        </button>
                    </div>
                </div>

                <button
                    onClick={onProceed}
                    disabled={selectedCount === 0}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                    Proceed
                    <ArrowRight size={18} className="ml-2" />
                </button>
            </div>
        </div>
    );
}