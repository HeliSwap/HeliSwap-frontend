import { ethers } from 'ethers';

const useProvider = () => {
  const provider = new ethers.providers.JsonRpcProvider('https://testnet.hashio.io/api');

  return provider;
};

export default useProvider;
