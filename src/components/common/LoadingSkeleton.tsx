
import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-6 bg-slate-200 rounded w-1/4"></div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 rounded"></div>
        ))}
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionText, onAction, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-slate-200 my-4">
      {icon && <div className="text-slate-400 mb-3">{icon}</div>}
      <h4 className="text-base font-semibold text-slate-700">{title}</h4>
      {description && <p className="text-sm text-slate-400 max-w-sm mt-1">{description}</p>}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
