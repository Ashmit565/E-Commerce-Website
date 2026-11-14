import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const nums = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(pages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      nums.push(i);
    }
    return nums;
  };

  return (
    <div className="flex items-center justify-center gap-2" style={{ margin: '2.5rem 0 1rem' }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="btn btn-secondary btn-sm"
        style={{ padding: '0.5rem', borderRadius: '8px' }}
        title="Previous Page"
      >
        <ChevronLeft size={18} />
      </button>

      {getPageNumbers().map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`btn ${num === page ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{
            minWidth: '38px',
            height: '38px',
            padding: '0',
            borderRadius: '8px',
            fontWeight: num === page ? 700 : 500
          }}
        >
          {num}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="btn btn-secondary btn-sm"
        style={{ padding: '0.5rem', borderRadius: '8px' }}
        title="Next Page"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

