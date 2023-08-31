import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider } from '../utils/tokenUtils';

const ERC20Abi = require('../abi/ERC20.json').abi;

const useHELITokenContract = () => {
  const [tokenContract, setTokenContract] = useState({} as ethers.Contract);

  useEffect(() => {
    const provider = getProvider();
    const HELITokenAddress = process.env.REACT_APP_HELI_TOKEN_ADDRESS;
    const contract = new ethers.Contract(HELITokenAddress as string, ERC20Abi, provider as any);
    setTokenContract(contract);
  }, []);

  return tokenContract;
};

export default useHELITokenContract;
