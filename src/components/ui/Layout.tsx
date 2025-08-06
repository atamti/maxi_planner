// Pure layout and display components
import React, { ReactNode } from "react";

export interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  background?: "white" | "gray" | "blue" | "green" | "yellow" | "red";
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = "",
  background = "white",
}) => {
  const bgClasses = {
    white: "bg-white",
    gray: "bg-gray-50",
    blue: "bg-blue-50",
    green: "bg-green-50",
    yellow: "bg-yellow-50",
    red: "bg-red-50",
  };

  return (
    <div
      className={`${bgClasses[background]} p-4 rounded-lg shadow border ${className}`}
    >
      {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
      {children}
    </div>
  );
};

export interface SectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
  icon?: string;
}

export const CollapsibleSection: React.FC<SectionProps> = ({
  title,
  isExpanded,
  onToggle,
  children,
  className = "",
  icon,
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
      >
        <span className="font-medium text-left">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </span>
        <span className="text-lg font-bold">{isExpanded ? "−" : "+"}</span>
      </button>
      {isExpanded && (
        <div className="mt-3 p-4 bg-white rounded-lg border">{children}</div>
      )}
    </div>
  );
};

export interface GridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 2,
  gap = "md",
  className = "",
}) => {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  return (
    <div
      className={`grid ${colClasses[columns]} ${gapClasses[gap]} ${className}`}
    >
      {children}
    </div>
  );
};

export interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  icon,
}) => {
  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white",
  };

  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        rounded transition-colors duration-200 
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export interface BadgeProps {
  children: ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "info",
  className = "",
}) => {
  const variantClasses = {
    info: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${variantClasses[variant]} ${className}
    `}
    >
      {children}
    </span>
  );
};
