import React from "react";

type LoadingProps = {
  label?: string;
  className?: string;
};

const Loading: React.FC<LoadingProps> = ({ label = "Loading...", className }) => {
  return (
    <div className={`w-full ${className || ""}`}>
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3"></div>
        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3"></div>
        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
      </div>
      <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
    </div>
  );
};

export default Loading;
