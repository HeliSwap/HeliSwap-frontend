import React, { useEffect } from 'react';
import useDebounce from '../hooks/useDebounce';

interface ISearchAreaProps {
  searchFunc: (value: string) => void;
  setInputValue: (value: string) => void;
  inputValue: string;
}

const SearchArea = ({ searchFunc, setInputValue, inputValue }: ISearchAreaProps) => {
  const debouncedSearchTerm: string = useDebounce(inputValue, 1000);

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchFunc(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchFunc]);

  return (
    <div className="search-area-container">
      <div className="search-area-wrapper">
        <input
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
          }}
          className="search-area-input"
        ></input>
      </div>
    </div>
  );
};

export default SearchArea;