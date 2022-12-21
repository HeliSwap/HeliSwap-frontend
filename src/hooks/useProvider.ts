import { ethers } from 'ethers';

const useProvider = () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_PROVIDER_URL);

  return provider;
};

export default useProvider;
