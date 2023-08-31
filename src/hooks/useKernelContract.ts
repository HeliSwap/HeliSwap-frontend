import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider } from '../utils/tokenUtils';

const IKernelAbi = require('../abi/IKernel.json');

const useKernelContract = () => {
  const [kernelContract, setKernelContract] = useState({} as ethers.Contract);

  useEffect(() => {
    const provider = getProvider();
    const kernelAddress = process.env.REACT_APP_KERNEL_ADDRESS;
    setKernelContract(new ethers.Contract(kernelAddress as string, IKernelAbi, provider));
  }, []);

  return kernelContract;
};

export default useKernelContract;
