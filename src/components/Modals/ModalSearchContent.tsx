import React, { useState } from 'react';
import { getTokenInfo } from '../../utils/tokenUtils';
import { ITokenData } from '../../interfaces/tokens';

import Button from '../../components/Button';

interface IModalProps {
  closeModal: () => void;
  setTokensData: (prev: any) => void;
  tokenFieldId: string;
}

const ModalSearchContent = ({ closeModal, setTokensData, tokenFieldId }: IModalProps) => {
  const [searchInputValue, setSearchInputValue] = useState('');
  const [findTokenLoading, setFindTokenLoading] = useState(false);
  const [foundTokenData, setFoundTokenData] = useState<ITokenData>({} as ITokenData);

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setSearchInputValue(value);
  };

  const handleSearchButtonClick = async () => {
    setFoundTokenData({} as ITokenData);
    if (!searchInputValue) return;

    setFindTokenLoading(true);

    try {
      const result = await getTokenInfo(searchInputValue);

      // Proper check for result
      if (result) {
        setFoundTokenData(result);
      }
    } catch (err) {
      console.log('err', err);
    } finally {
      setFindTokenLoading(false);
    }
  };

  const handleSaveButton = () => {
    setTokensData((prev: any) => ({ ...prev, [tokenFieldId]: foundTokenData }));
    setSearchInputValue('');
    setFoundTokenData({} as ITokenData);
    closeModal();
  };

  const hasTokenData = Object.keys(foundTokenData).length > 0;

  return (
    <>
      <div className="modal-body">
        <div className="p-4">
          <div>
            <div className="bg-slate p-3 rounded mb-4">
              <ul>
                <li>0.0.447200</li>
                <li>0.0.34247682</li>
                <li>0.0.34250206</li>
                <li>0.0.34250234</li>
                <li>0.0.34250245</li>
              </ul>
            </div>
            <label className="mb-2" htmlFor="">
              Token id
            </label>
            <div className="d-flex align-items-center">
              <input
                value={searchInputValue}
                onChange={onSearchInputChange}
                type="text"
                className="form-control me-3"
              />
              <Button
                loadingText={' '}
                loading={findTokenLoading}
                onClick={handleSearchButtonClick}
              >
                Search
              </Button>
            </div>
          </div>
          {hasTokenData ? (
            <div className="mt-4 bg-slate p-3 rounded">
              <p>
                {foundTokenData.name} ({foundTokenData.symbol})
              </p>
            </div>
          ) : null}
        </div>
      </div>
      <div className="modal-footer">
        <button
          onClick={closeModal}
          type="button"
          className="btn btn-secondary"
          data-bs-dismiss="modal"
        >
          Close
        </button>
        <button
          disabled={!hasTokenData}
          onClick={handleSaveButton}
          type="button"
          className="btn btn-primary"
        >
          Save changes
        </button>
      </div>
    </>
  );
};

export default ModalSearchContent;
