import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, onItemsPerPageChange }) => {
  if (totalPages <= 1 && totalItems <= itemsPerPage) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="pagination-wrapper">
      <div className="pagination-info">
        <span>Showing <strong>{start}–{end}</strong> of <strong>{totalItems}</strong> entries</span>
        <div className="pagination-perpage">
          <label>Rows per page:</label>
          <select value={itemsPerPage} onChange={(e) => { onItemsPerPageChange(Number(e.target.value)); onPageChange(1); }}>
            {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="pagination-controls">
        <button className="pg-btn" onClick={() => onPageChange(1)} disabled={currentPage === 1} title="First page">
          <ChevronsLeft size={15} />
        </button>
        <button className="pg-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} title="Previous">
          <ChevronLeft size={15} />
        </button>

        {getPageNumbers().map(p => (
          <button
            key={p}
            className={`pg-btn pg-num ${p === currentPage ? 'pg-active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        <button className="pg-btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} title="Next">
          <ChevronRight size={15} />
        </button>
        <button className="pg-btn" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} title="Last page">
          <ChevronsRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
