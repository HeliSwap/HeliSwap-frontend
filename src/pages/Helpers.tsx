import React, { useState } from 'react';
import { addressToId, idToAddress } from '../utils/tokenUtils';

const Helpers = () => {
  const [formData, setFormData] = useState({
    idToAddressIn: '',
    idToAddressOut: '',
    addressToIdIn: '',
    addressToIdOut: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      value,
      name,
      dataset: { type },
    } = e.target;

    const target = e.target.dataset.target as string;
    const valueToUpdate = type === 'id' ? addressToId(value) : idToAddress(value);

    setFormData(prev => ({ ...prev, [name]: value, [target]: valueToUpdate }));
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="container-swap">
        <h1>Helpers</h1>

        <div className="mt-5">
          <div>
            <label className="mb-2" htmlFor="">
              Id to Address:
            </label>
            <input
              onChange={handleInputChange}
              value={formData.idToAddressIn}
              type="text"
              name="idToAddressIn"
              className="form-control"
              data-target="idToAddressOut"
              data-type="address"
            />
            <input
              value={formData.idToAddressOut}
              type="text"
              name="idToAddressOut"
              className="form-control mt-3"
            />
          </div>

          <div className="mt-4">
            <label className="mb-2" htmlFor="">
              Address to Id:
            </label>
            <input
              value={formData.addressToIdIn}
              onChange={handleInputChange}
              type="text"
              name="addressToIdIn"
              className="form-control"
              data-target="addressToIdOut"
              data-type="id"
            />
            <input
              value={formData.addressToIdOut}
              type="text"
              name="addressToIdOut"
              className="form-control mt-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Helpers;
