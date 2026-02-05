import React from 'react';

interface StatusBadgeProps {
    status: 'active' | 'inactive' | 'pending' | 'completed' | 'failed';
    label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
    const statusStyles: Record<string, { bg: string; text: string }> = {
        active: { bg: 'bg-green-100', text: 'text-green-800' },
        inactive: { bg: 'bg-gray-100', text: 'text-gray-800' },
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        completed: { bg: 'bg-blue-100', text: 'text-blue-800' },
        failed: { bg: 'bg-red-100', text: 'text-red-800' },
    };

    const { bg, text } = statusStyles[status];

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
            {label || status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

// TODO: Add icon support to StatusBadge component
export const StatusBadgeWithIcon: React.FC<StatusBadgeProps & { icon?: React.ReactNode }> = ({
    status,
    label,
    icon,
}) => {
    // TODO: Implement icon rendering logic
    return null;
};

// TODO: Create a hook for status color management
export const useStatusColors = (status: StatusBadgeProps['status']) => {
    // TODO: Return memoized status style values
};

// TODO: Add animated status indicator variant
export const AnimatedStatusBadge: React.FC<StatusBadgeProps> = () => {
    // TODO: Implement animation logic for status changes
    return null;
};