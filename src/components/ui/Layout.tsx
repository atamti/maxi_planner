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
  // Map legacy background prop to subtle variants within dark / light contexts.
  const bgClasses = {
    white: "bg-white dark:bg-brand-black/70",
    gray: "bg-gray-50 dark:bg-brand-black/60",
    blue: "bg-blue-50 dark:bg-brand-navy/30",
    green: "bg-green-50 dark:bg-brand-green/10",
    yellow: "bg-yellow-50 dark:bg-brand-orange/10",
    red: "bg-red-50 dark:bg-brand-red/10",
  } as const;

  return (
    <div
      className={`card-maxi ${bgClasses[background]} rounded-none p-4 ${className}`}
    >
      {title && (
        <h3 className="text-base font-heading font-bold tracking-wide text-brand-orange mb-3">
          {title.toUpperCase()}
        </h3>
      )}
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
        className="w-full flex items-center justify-between p-3 bg-brand-black/60 dark:hover:bg-brand-black/80 hover:bg-gray-200 border border-brand-orange/30 text-left font-heading tracking-wide text-sm text-brand-gray transition-colors duration-200 rounded-none"
      >
        <span className="font-medium flex-1">
          {icon && <span className="mr-2">{icon}</span>}
          {title.toUpperCase()}
        </span>
        <span className="text-lg font-bold text-brand-orange">
          {isExpanded ? "−" : "+"}
        </span>
      </button>
      {isExpanded && (
        <div className="mt-3 p-4 card-maxi bg-white dark:bg-brand-black/70 border border-brand-orange/30 rounded-none">
          {children}
        </div>
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
    primary:
      "btn-gradient-orange text-white shadow-glow-orange border border-brand-orange/50",
    secondary:
      "btn-secondary-navy text-white border border-brand-orange/30 hover:shadow-glow-orange",
    danger:
      "bg-brand-red text-white hover:bg-brand-red/90 border border-brand-red/60",
    success:
      "bg-brand-green text-white hover:bg-brand-green/90 border border-brand-green/60",
  } as const;

  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variantClasses[variant]} ${sizeClasses[size]} tracking-wide font-heading rounded-none transition-all duration-300 ease-aggressive focus-ring-maxi relative overflow-hidden ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
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
    info: "bg-brand-navy/30 text-brand-orange border border-brand-orange/30",
    success: "bg-brand-green/20 text-brand-green border border-brand-green/40",
    warning:
      "bg-brand-orange/20 text-brand-orange border border-brand-orange/50",
    error: "bg-brand-red/20 text-brand-red border border-brand-red/50",
  } as const;

  return (
    <span
      className={`
  inline-flex items-center px-2.5 py-0.5 rounded-none text-[10px] leading-tight font-heading tracking-wide ${variantClasses[variant]} ${className}
    `}
    >
      {children}
    </span>
  );
};
