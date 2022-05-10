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
    setFindTokenLoading(true);
    setFoundTokenData({} as ITokenData);

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

  return (
    <>
      <div className="modal-body">
        <div className="p-4">
          <div>
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
              <Button loading={findTokenLoading} onClick={handleSearchButtonClick}>
                Search
              </Button>
            </div>
          </div>
          <div className="mt-3">
            {foundTokenData ? (
              <p>
                {foundTokenData.name} ({foundTokenData.symbol})
              </p>
            ) : null}
          </div>
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
        <button onClick={handleSaveButton} type="button" className="btn btn-primary">
          Save changes
        </button>
      </div>
    </>
  );
};

export default ModalSearchContent;
