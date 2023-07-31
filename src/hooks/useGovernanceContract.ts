import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider } from '../utils/tokenUtils';

const GovernanceABI = require('../abi/Governance.json');

const useGovernanceContract = () => {
  const [governanceContract, setGovernanceContract] = useState({} as ethers.Contract);

  useEffect(() => {
    const provider = getProvider();
    const governanceAddress = process.env.REACT_APP_GOVERNANCE_ADDRESS;
    setGovernanceContract(
      new ethers.Contract(governanceAddress as string, GovernanceABI, provider as any),
    );
  }, []);

  return governanceContract;
};

export default useGovernanceContract;
