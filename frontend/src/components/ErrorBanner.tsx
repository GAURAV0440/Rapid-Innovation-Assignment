import React from "react";

type Props = {
  message?: string;
  onClose?: () => void;
};

const ErrorBanner: React.FC<Props> = ({ message = "Something went wrong.", onClose }) => {
  return (
    <div className="rounded border border-red-500/30 bg-red-50 px-4 py-3 text-red-700 dark:bg-red-950/40 dark:text-red-200 flex items-start justify-between gap-4">
      <div className="text-sm">
        <strong className="font-semibold">Error: </strong>
        <span>{message}</span>
      </div>
      {onClose ? (
        <button
          className="text-red-700/70 hover:text-red-700 dark:text-red-300/70 dark:hover:text-red-200 text-sm"
          onClick={onClose}
          aria-label="Close"
        >
          Close
        </button>
      ) : null}
    </div>
  );
};

export default ErrorBanner;
