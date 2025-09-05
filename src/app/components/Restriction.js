import React from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Restriction = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
           

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Access Restricted Card */}
                <div className="bg-white rounded-2xl shadow-sm border p-8">
                    <div className="text-center">
                        {/* Icon */}
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-10 h-10 text-orange-600" />
                        </div>

                        {/* Main Message */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Access Not Available
                        </h2>
                        
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div className="text-left">
                                    <p className="text-orange-700 text-sm leading-relaxed">
                                        You are not subscribed to Pro or you are not part of any institution. 
                                        Please contact the admin for assistance.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center space-x-2 text-gray-700 mb-2">
                                <Mail className="w-4 h-4" />
                                <span className="font-medium">Contact Admin</span>
                            </div>
                            <a 
                                href="mailto:adityaaman.codex@gmail.com"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                adityaaman.codex@gmail.com
                            </a>
                        </div>

                        {/* Action Button */}
                        <a
                            href="mailto:adityaaman.codex@gmail.com?subject=Access Request - Campus Connect&body=Hello, I would like to request access to Campus Connect features."
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 inline-flex items-center space-x-2"
                        >
                            <Mail className="w-4 h-4" />
                            <span>Contact Admin</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Restriction;