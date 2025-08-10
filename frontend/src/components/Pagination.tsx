import React from "react";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<Props> = ({ page, totalPages, onPageChange }) => {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        disabled={!canPrev}
        onClick={() => onPageChange(page - 1)}
        className="rounded border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        Previous
      </button>
      <span className="text-sm text-neutral-600 dark:text-neutral-300">
        Page {page} of {totalPages}
      </span>
      <button
        disabled={!canNext}
        onClick={() => onPageChange(page + 1)}
        className="rounded border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
