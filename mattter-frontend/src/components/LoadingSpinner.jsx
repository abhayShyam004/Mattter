import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', className = '', color = 'text-accent-purple' }) => {
    const sizeClasses = {
        sm: 'w-5 h-5',   // Buttons
        md: 'w-8 h-8',   // Medium sections
        lg: 'w-12 h-12', // Page loading
        xl: 'w-16 h-16'  // Hero sections
    };

    return (
        <Loader
            className={`${sizeClasses[size] || sizeClasses.md} ${color} animate-spin ${className}`}
        />
    );
};

export default LoadingSpinner;
