import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { IPoolExtendedData } from '../interfaces/tokens';
// import debounce from 'lodash.debounce';
const debounce = require('lodash.debounce');

interface ISearchAreaProps {
  searchFunc: (value: string) => void;
  calledSearchResults: boolean;
  loadingSearchResults: boolean;
  results: IPoolExtendedData[];
}

const SearchArea = ({
  searchFunc,
  calledSearchResults,
  loadingSearchResults,
  results,
}: ISearchAreaProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleSearch = useCallback(
    (value: string) => {
      if (value.length > 1) {
        console.log('Searching for', value);
        searchFunc(value);
      }
    },
    [searchFunc],
  );

  const debouncedSearchHandler = useMemo(() => debounce(handleSearch, 1000), [handleSearch]);

  useEffect(() => {
    return () => {
      debouncedSearchHandler.cancel();
    };
  }, [debouncedSearchHandler]);

  return (
    <div className="search-area-container">
      <div className="search-area-wrapper">
        <input
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            debouncedSearchHandler(e.target.value);
          }}
          className="search-area-input"
        ></input>
      </div>
      {calledSearchResults && loadingSearchResults ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {(results || []).map((item: IPoolExtendedData, index: number) => {
            return <li key={index}>{item.pairName}</li>;
          })}
        </ul>
      )}
    </div>
  );
};

export default SearchArea;
