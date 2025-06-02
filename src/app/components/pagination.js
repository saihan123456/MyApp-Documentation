import React from 'react';
import styles from './pagination.module.css';

/**
 * Reusable pagination component with scalable approach
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current active page (1-based)
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback when page is changed, receives page number
 * @param {string} [props.className] - Optional additional CSS class
 */
const Pagination = ({ currentPage, totalPages, onPageChange, className = '' }) => {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Generate the page numbers to show
  const getPageNumbers = () => {
    // Always show first page, last page, current page, and 1 page before and after current
    const pageNumbers = [];
    const pagesToShow = new Set();
    
    // Always add first page
    pagesToShow.add(1);
    
    // Always add last page
    pagesToShow.add(totalPages);
    
    // Add current page and 1 page before and after
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pagesToShow.add(i);
    }
    
    // Convert to array and sort
    const sortedPages = Array.from(pagesToShow).sort((a, b) => a - b);
    
    // Add the page numbers with ellipses
    sortedPages.forEach((pageNum, index) => {
      // Add ellipsis if there's a gap
      if (index > 0 && pageNum > sortedPages[index - 1] + 1) {
        pageNumbers.push(
          <span key={`ellipsis-${pageNum}`} className={styles.ellipsis}>
            ...
          </span>
        );
      }
      
      // Add the page button
      pageNumbers.push(
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`${styles.pageButton} ${currentPage === pageNum ? styles.active : ''}`}
          aria-current={currentPage === pageNum ? 'page' : undefined}
        >
          {pageNum}
        </button>
      );
    });
    
    return pageNumbers;
  };

  return (
    <div className={`${styles.pagination} ${className}`}>
      {/* Previous page button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.navButton}
        aria-label="Previous page"
      >
        &lt;
      </button>
      
      {/* Page numbers */}
      {getPageNumbers()}
      
      {/* Next page button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.navButton}
        aria-label="Next page"
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;
