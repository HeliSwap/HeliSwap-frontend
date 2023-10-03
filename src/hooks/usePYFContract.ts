import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider } from '../utils/tokenUtils';

const MultiRewards = require('../abi/MultiRewards.json');

const usePYFContract = (farmAddress: string) => {
  const [farmContract, setFarmContract] = useState({} as ethers.Contract);

  useEffect(() => {
    const provider = getProvider();
    setFarmContract(new ethers.Contract(farmAddress, MultiRewards, provider));
  }, [farmAddress]);

  return farmContract;
};

export default usePYFContract;
