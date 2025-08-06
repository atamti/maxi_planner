// Pure display components for data visualization
import React from "react";

export interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: "blue" | "green" | "yellow" | "red" | "gray";
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  showPercentage = true,
  color = "blue",
  className = "",
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    gray: "bg-gray-500",
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-600">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export interface MetricDisplayProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "large" | "compact";
  className?: string;
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  value,
  unit,
  trend,
  variant = "default",
  className = "",
}) => {
  const trendIcons = {
    up: "↗️",
    down: "↘️",
    neutral: "➡️",
  };

  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600",
  };

  const variantClasses = {
    default: "p-3",
    large: "p-4 text-center",
    compact: "p-2",
  };

  const valueClasses = {
    default: "text-lg font-semibold",
    large: "text-2xl font-bold",
    compact: "text-base font-medium",
  };

  return (
    <div
      className={`bg-white rounded border ${variantClasses[variant]} ${className}`}
    >
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`${valueClasses[variant]} flex items-center gap-1`}>
        <span>{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
        {trend && (
          <span className={`text-sm ${trendColors[trend]}`}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
    </div>
  );
};

export interface AllocationVisualizationProps {
  allocations: Array<{
    label: string;
    percentage: number;
    color: string;
  }>;
  className?: string;
}

export const AllocationVisualization: React.FC<
  AllocationVisualizationProps
> = ({ allocations, className = "" }) => {
  return (
    <div className={`${className}`}>
      {/* Horizontal bar visualization */}
      <div className="w-full bg-gray-200 rounded-full h-6 mb-3 flex overflow-hidden">
        {allocations.map((allocation, index) => (
          <div
            key={allocation.label}
            className={`h-full transition-all duration-300`}
            style={{
              width: `${allocation.percentage}%`,
              backgroundColor: allocation.color,
            }}
            title={`${allocation.label}: ${allocation.percentage}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {allocations.map((allocation) => (
          <div key={allocation.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: allocation.color }}
            />
            <span className="text-sm">
              {allocation.label}: {allocation.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export interface StatusIndicatorProps {
  status: "success" | "warning" | "error" | "info";
  message: string;
  details?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  details,
  className = "",
}) => {
  const statusConfig = {
    success: {
      icon: "✅",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
    },
    warning: {
      icon: "⚠️",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
    },
    error: {
      icon: "❌",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
    },
    info: {
      icon: "ℹ️",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`
      ${config.bgColor} ${config.borderColor} ${config.textColor}
      border rounded p-3 ${className}
    `}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">{config.icon}</span>
        <div className="flex-1">
          <div className="font-medium">{message}</div>
          {details && <div className="text-sm mt-1 opacity-80">{details}</div>}
        </div>
      </div>
    </div>
  );
};
