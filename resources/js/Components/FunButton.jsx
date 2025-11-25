import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const FunButton = forwardRef(({ 
    variant = 'primary',
    size = 'md',
    icon = null,
    children,
    className = '',
    disabled = false,
    loading = false,
    type = 'button',
    ...props
}, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variants = {
        primary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 focus:ring-purple-500 shadow-lg shadow-purple-500/30',
        secondary: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 focus:ring-blue-500 shadow-lg shadow-blue-500/30',
        accent: 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 focus:ring-orange-500 shadow-lg shadow-orange-500/30',
        success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 focus:ring-green-500 shadow-lg shadow-green-500/30',
        warning: 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 focus:ring-red-500 shadow-lg shadow-red-500/30',
        outline: 'border-2 border-purple-500 text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-8 py-3.5 text-lg',
        xl: 'px-10 py-4 text-xl',
    };

    const buttonVariants = {
        initial: { scale: 1 },
        hover: { 
            scale: 1.05,
            transition: { 
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        },
        tap: { 
            scale: 0.95,
            transition: { 
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        },
    };

    return (
        <motion.button
            ref={ref}
            type={type}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            variants={buttonVariants}
            initial="initial"
            whileHover={!disabled && !loading ? "hover" : "initial"}
            whileTap={!disabled && !loading ? "tap" : "initial"}
            {...props}
        >
            {loading ? (
                <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {icon && <span className="text-xl">{icon}</span>}
                    {children}
                </>
            )}
        </motion.button>
    );
});

FunButton.displayName = 'FunButton';

export default FunButton;
