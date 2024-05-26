import { Pagination } from "react-bootstrap";
import PropTypes from "prop-types";
import "./CustomPagination.css";

/**
 * Pagination component for Film List page to navigate between pages.
 */

const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
  // Calculate pagination items based on current page and total pages.
  const paginationItems = () => {
    let start = Math.max(1, currentPage - 4);
    let end = Math.min(totalPages, currentPage + 5);

    if (currentPage < 6) {
      start = 1;
      end = Math.min(10, totalPages);
    }

    if (totalPages < 10) {
      start = 1;
      end = totalPages;
    }

    if (totalPages - currentPage < 5) {
      start = Math.max(1, totalPages - 9);
      end = totalPages;
    }

    return [...Array(end - start + 1)].map((_, idx) => start + idx);
  };

  return (
    <Pagination className="justify-content-center">
      {/* First and previous page buttons */}
      {currentPage > 1 && <Pagination.First onClick={() => onPageChange(1)} />}
      {currentPage > 1 && (
        <Pagination.Prev onClick={() => onPageChange(currentPage - 1)} />
      )}

      {/* Page number buttons */}
      {paginationItems().map((number) => (
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => onPageChange(number)}
        >
          {number}
        </Pagination.Item>
      ))}

      {/* Next and last page buttons */}
      {currentPage < totalPages && (
        <Pagination.Next onClick={() => onPageChange(currentPage + 1)} />
      )}
      {currentPage < totalPages && (
        <Pagination.Last onClick={() => onPageChange(totalPages)} />
      )}
    </Pagination>
  );
};

// Prop types for CustomPagination component.
CustomPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default CustomPagination;