import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider } from '../utils/tokenUtils';

const RewardsABI = require('../abi/Rewards.json');

const useRewardsContract = () => {
  const [rewardsContract, setRewardsContract] = useState({} as ethers.Contract);

  useEffect(() => {
    const provider = getProvider();
    const rewardsAddress = process.env.REACT_APP_REWARDS_ADDRESS;
    setRewardsContract(new ethers.Contract(rewardsAddress as string, RewardsABI, provider as any));
  }, []);

  return rewardsContract;
};

export default useRewardsContract;
