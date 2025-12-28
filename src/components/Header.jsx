import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import React from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Data from '../pages/Data'
import Invoice from '../pages/Invoice'
import Billing from '../pages/Billing'
import Search from '../pages/Search'


const Header = () => {

    const navItems = [
        { name: 'Home', to: '/' },
        { name: 'Billing', to: '/billing' },
        { name: 'Data', to: '/data' },
        { name: 'Search', to: '/search' },
        { name: 'Invoice', to: '/billing/invoice' },
    ];

    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div>
            {/* Desktop Sidebar */}
            <div className='max-md:hidden'>
                {/* Sidebar Toggle Button */}
                <button
                    onClick={toggleMenu}
                    className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] transition-colors"
                    aria-label="Toggle sidebar"
                >
                    {isOpen ? (
                        <X className="h-6 w-6 text-white" />
                    ) : (
                        <Menu className="h-6 w-6 text-white" />
                    )}
                </button>

                {/* Sidebar */}
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                                onClick={toggleMenu}
                            />

                            {/* Sidebar Content */}
                            <motion.div
                                initial={{ x: -300 }}
                                animate={{ x: 0 }}
                                exit={{ x: -300 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="fixed top-0 left-0 h-full w-64 bg-[#070C1B] shadow-2xl z-50 overflow-y-auto"
                            >
                                <div className="p-6">
                                    {/* Logo/Title */}
                                    <div className="mb-8 mt-4">
                                        <p className="text-white text-xl font-semibold">Shiv Shakti Automobile</p>
                                    </div>

                                    {/* Navigation Items */}
                                    <div className="space-y-3">
                                        {navItems.map((item, index) => (
                                            <motion.div
                                                key={item.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <Link
                                                    to={item.to}
                                                    className="block px-4 py-3 text-white hover:bg-blue-600 rounded-lg transition-colors duration-200 font-medium"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    {item.name}
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Register Button */}
                                    <div className="mt-8">
                                        <button className="w-full px-4 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium">
                                            Register
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile view */}
            <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#2563EB] shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <p className='text-white'>Shiv Shakti Automobile</p>
                        </div>

                        {/* Hamburger Button */}
                        <button
                            onClick={toggleMenu}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? (
                                <X className="h-6 w-6 text-white" />
                            ) : (
                                <Menu className="h-6 w-6 text-white" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden bg-[#070C1B] border-t border-gray-200 overflow-hidden"
                        >
                            <div className="px-4 py-4 space-y-3">
                                {navItems.map((item, index) => (
                                    <motion.p
                                        key={item.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="block px-4 py-2 text-white hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200 font-medium"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Link to={item.to}>{item.name}</Link>
                                    </motion.p>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

        </div>
    )
}

export default Header