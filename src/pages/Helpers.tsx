import React, { useState } from 'react';
import { hethers } from '@hashgraph/hethers';
import { addressToId, idToAddress } from '../utils/tokenUtils';
import ERC20 from '../abi/ERC20';
import Button from '../components/Button';

export const getConnectedWallet = () => {
  if (process.env.REACT_APP_ACCOUNT_ID && process.env.REACT_APP_ACCOUNT_KEY) {
    const provider = hethers.providers.getDefaultProvider(process.env.REACT_APP_NETWORK_TYPE);
    const eoaAccount = {
      account: process.env.REACT_APP_ACCOUNT_ID,
      privateKey: process.env.REACT_APP_ACCOUNT_KEY,
    };
    const walletEoaAccount = new hethers.Wallet(eoaAccount as any, provider as any);
    const connectedWallet = walletEoaAccount.connect(provider as any);

    return connectedWallet;
  } else {
    return false;
  }
};

const Helpers = () => {
  const connectedWallet = getConnectedWallet();

  const [tokenAddress, setTokenAddress] = useState('');
  const [walletAddress, setWalletAddress] = useState('0x0000000000000000000000000000000002099e42');
  const [tokenContract, setTokenContract] = useState();

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

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTokenAddress(value);
  };

  const handleWalletAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setWalletAddress(value);
  };

  const handleGetContractClick = () => {
    const erc20 = hethers.ContractFactory.getContract(
      tokenAddress,
      ERC20.abi,
      connectedWallet as any,
    );
    setTokenContract(erc20 as any);
  };

  const handleShowBalanceClick = async () => {
    if (tokenContract) {
      // @ts-ignore
      const balanceBN = await tokenContract.balanceOf(walletAddress, {
        gasLimit: 3000000,
      });

      const balanceStr = hethers.utils.formatUnits(balanceBN, 18);

      console.log('balance', balanceStr);
    }
  };

  const handleShowAllowanceClick = async () => {
    if (tokenContract) {
      // @ts-ignore
      const allowanceBN = await tokenContract.allowance(
        walletAddress,
        process.env.REACT_APP_ROUTER_ADDRESS as string,
        {
          gasLimit: 3000000,
        },
      );

      const allowanceSrt = hethers.utils.formatUnits(allowanceBN, 18);

      console.log('allowance', allowanceSrt);
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="container-action">
        <h1>Helpers</h1>

        <div className="my-4">
          <div className="bg-slate p-3 rounded mb-4">
            <ul>
              <li>
                0.0.447200 - HEX [HTS] <span className="cursor-pointer">📝</span>
              </li>
              <li>
                0.0.34741585 - USDT [HTS] <span className="cursor-pointer">📝</span>
              </li>
              <li>
                0.0.34741650 - WETH [HTS] <span className="cursor-pointer">📝</span>
              </li>
              <li>
                0.0.34741685 - WBTC [HTS] <span className="cursor-pointer">📝</span>
              </li>
              <li>
                0.0.45906586 - HELI [HTS] <span className="cursor-pointer">📝</span>
              </li>

              <li>
                0.0.34947702 - USDT [ERC20] <span className="cursor-pointer">📝</span>
              </li>

              <li>
                0.0.34838105 - WETH [ERC20] <span className="cursor-pointer">📝</span>
              </li>

              <li>
                0.0.34838117 - WBTC [ERC20] <span className="cursor-pointer">📝</span>
              </li>

              <li>
                0.0.34838123 - DOB [ERC20] <span className="cursor-pointer">📝</span>
              </li>

              <li>
                0.0.34948327 - EIGHT [ERC20] <span className="cursor-pointer">📝</span>
              </li>
            </ul>
          </div>
        </div>

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
              readOnly
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
              readOnly
            />
          </div>

          <h2 className="mt-5">Contracts:</h2>

          <div className="mt-4">
            <label className="mb-2" htmlFor="">
              Wallet address:
            </label>
            <input
              value={walletAddress}
              onChange={handleWalletAddressInputChange}
              type="text"
              name="tokenAddress"
              className="form-control"
            />
          </div>

          <div className="mt-4">
            <div className="d-flex align-items-end">
              <div className="flex-1">
                <label className="mb-2" htmlFor="">
                  Token address:
                </label>
                <input
                  value={tokenAddress}
                  onChange={handleAddressInputChange}
                  type="text"
                  name="tokenAddress"
                  className="form-control"
                />
              </div>
              <div className="ms-3">
                <Button onClick={handleGetContractClick}>Get contract</Button>
              </div>
            </div>

            {tokenContract ? (
              <div className="mt-3 d-flex">
                <Button className="mx-3" onClick={handleShowBalanceClick}>
                  Show balance
                </Button>
                <Button className="mx-3" onClick={handleShowAllowanceClick}>
                  Show allowance
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Helpers;
