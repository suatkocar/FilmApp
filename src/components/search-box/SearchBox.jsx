import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import './SearchBox.css';

function SearchBox({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useCallback(
    debounce((query) => {
      // Directly sending the string instead of an object
      onSearch(query.trim());
    }, 500),
    [onSearch] // Only recreate the debounced function if onSearch changes
  );

  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();  // Cancel debounced calls when component unmounts
    };
  }, [debouncedSearch]);

  return (
    <div className="search-box">
      <input
        id="film-search-input"
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by ID, Title, Year, Director or Star..."
      />
    </div>
  );
}

SearchBox.propTypes = {
  onSearch: PropTypes.func.isRequired
};

export default SearchBox;