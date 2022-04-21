import React, { useState, useEffect } from 'react';

const Swap = () => {
  const [tokenList, setTokenList] = useState<string[]>([]);

  useEffect(() => {
    setTokenList(['0.0.447200', '0.0.34250206', '0.0.34250234', '0.0.34250245']);
  }, []);

  return (
    <div className="container-swap">
      <div className="d-flex justify-content-between">
        <span className="badge bg-primary text-uppercase">From</span>
        <span></span>
      </div>

      <div className="row justify-content-between align-items-end mt-3">
        <div className="col-8">
          <h3>Ethereum</h3>
          <input type="text" className="form-control mt-2" />
          <p className="text-success mt-3">$0.00</p>
        </div>

        <div className="col-4">
          <select name="" id="" className="form-control">
            <option value="">Select</option>
          </select>
          <p className="text-steel mt-3 text-end">Wallet balance: 400.00</p>
        </div>
      </div>

      <div className="d-flex justify-content-between mt-5">
        <span className="badge bg-info text-uppercase">To</span>
        <span></span>
      </div>

      <div className="row justify-content-between align-items-end mt-3">
        <div className="col-8">
          <h3>BSC</h3>
          <input type="text" className="form-control mt-2" />
          <p className="text-success mt-3">$0.00</p>
        </div>

        <div className="col-4">
          <select name="" id="" className="form-control">
            <option value="">Select</option>
          </select>
          <p className="text-steel mt-3 text-end">Wallet balance: 400.00</p>
        </div>
      </div>

      <div className="mt-5 d-flex justify-content-center">
        <button className="btn btn-primary">Swap</button>
      </div>
    </div>
  );
};

export default Swap;
