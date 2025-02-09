import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export const Card: React.FC<CardProps> = ({ className = '', ...props }) => (
    <div
        className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
        {...props}
    />
); 