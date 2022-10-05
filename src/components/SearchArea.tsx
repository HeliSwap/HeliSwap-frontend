import React, { useEffect } from 'react';
import useDebounce from '../hooks/useDebounce';

interface ISearchAreaProps {
  searchFunc: (value: string) => void;
  setInputValue: (value: string) => void;
  inputValue: string;
  minLength: number;
}

const SearchArea = ({ searchFunc, setInputValue, inputValue, minLength }: ISearchAreaProps) => {
  const debouncedSearchTerm: string = useDebounce(inputValue, 1000);

  useEffect(() => {
    searchFunc(debouncedSearchTerm);
  }, [debouncedSearchTerm, searchFunc]);

  return (
    <div className="search-area-container">
      <div className="search-area-wrapper">
        <input
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
          }}
          placeholder="Search pools"
          className="form-control form-control-sm"
          minLength={minLength}
        ></input>
      </div>
    </div>
  );
};

export default SearchArea;
