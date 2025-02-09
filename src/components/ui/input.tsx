import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => (
    <input
        className={`w-full px-3 py-2 rounded-md bg-background border border-input
            text-sm placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-ring
            disabled:cursor-not-allowed disabled:opacity-50
            ${className}`}
        {...props}
    />
); 