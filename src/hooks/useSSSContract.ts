import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const SSSAbi = require('../abi/SSS.json');

const useSSSContract = () => {
  const [sssContract, setsssContract] = useState({} as ethers.Contract);

  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_PROVIDER_URL);
    const sssAddress = process.env.REACT_APP_SSS_ADDRESS;
    setsssContract(new ethers.Contract(sssAddress as string, SSSAbi, provider));
  }, []);

  return sssContract;
};

export default useSSSContract;
