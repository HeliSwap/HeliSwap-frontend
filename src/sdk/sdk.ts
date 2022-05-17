import { hethers } from '@hashgraph/hethers';
import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  TransactionReceipt,
} from '@hashgraph/sdk';
import Hashconnect from '../connectors/hashconnect';
import { ICreatePairData } from '../interfaces/comon';
import { addressToId, idToAddress } from '../utils/tokenUtils';
import ERC20 from '../abi/ERC20';

class SDK {
  private connectedWallet;

  constructor() {
    const provider = hethers.providers.getDefaultProvider(process.env.REACT_APP_NETWORK_TYPE);
    const eoaAccount = {
      account: process.env.REACT_APP_ACCOUNT_ID,
      privateKey: process.env.REACT_APP_ACCOUNT_KEY,
    };
    const walletEoaAccount = new hethers.Wallet(eoaAccount as any, provider as any);
    this.connectedWallet = walletEoaAccount.connect(provider as any);
  }

  async createPair(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    createPairData: ICreatePairData,
  ) {
    const { tokenAId, tokenBId } = createPairData;
    const tokenAAdress = idToAddress(tokenAId);
    const tokenBAdress = idToAddress(tokenBId);

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId('0.0.34735045')

      //Set the gas for the contract call
      .setGas(3000000)

      //Set the contract function to call
      .setFunction(
        'createPair',
        new ContractFunctionParameters().addAddress(tokenAAdress).addAddress(tokenBAdress),
      );

    const transactionBytes: Uint8Array | undefined = await hashconnectConnectorInstance?.makeBytes(
      trans,
      userId as string,
    );

    const response = await hashconnectConnectorInstance?.sendTransaction(
      transactionBytes as Uint8Array,
      userId as string,
      false,
    );

    const responseData: any = {
      response,
      receipt: null,
    };

    if (response?.success) {
      responseData.receipt = TransactionReceipt.fromBytes(response.receipt as Uint8Array);
    }

    return responseData;
  }

  async checkAllowance(tokenAddress: string, userAddress: string, spenderAddress: string) {
    const erc20 = hethers.ContractFactory.getContract(
      tokenAddress,
      ERC20.abi,
      this.connectedWallet,
    );
  }

  // Works only for erc20 tokens
  async approveToken(hashconnectConnectorInstance: Hashconnect, userId: string, tokenId: string) {
    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;

    // TODO Use Hethers for contracts interactions
    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(tokenId)

      //Set the gas for the contract call
      .setGas(3000000)

      //Set the contract function to call
      .setFunction(
        'approve',
        new ContractFunctionParameters()
          .addAddress(routerContractAddress)
          .addUint256(1000000000000000000),
      );

    const transactionBytes: Uint8Array | undefined = await hashconnectConnectorInstance?.makeBytes(
      trans,
      userId as string,
    );

    const response = await hashconnectConnectorInstance?.sendTransaction(
      transactionBytes as Uint8Array,
      userId as string,
      false,
    );

    const responseData: any = {
      response,
      receipt: null,
    };

    if (response?.success) {
      responseData.receipt = TransactionReceipt.fromBytes(response.receipt as Uint8Array);
    }

    return responseData;
  }

  async addLiquidity(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    createPairData: ICreatePairData,
  ) {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60;
    const {
      tokenAAmount: tokenAAmountString,
      tokenAId,
      tokenBAmount: tokenBAmountString,
      tokenBId,
    } = createPairData;

    const tokenAAddress = idToAddress(tokenAId);
    const tokenBAddress = idToAddress(tokenBId);

    const tokenAAmount = Number(tokenAAmountString);
    const tokenBAmount = Number(tokenBAmountString);

    const userAddress = idToAddress(userId);
    const routerId = addressToId(process.env.REACT_APP_ROUTER_ADDRESS as string);
    const trans = new ContractExecuteTransaction()
      //Set the ID of the router contract
      .setContractId(routerId)

      //Set the gas for the contract call
      .setGas(3000000)

      //Set the contract function to call
      .setFunction(
        'addLiquidity',
        new ContractFunctionParameters()
          .addAddress(tokenAAddress)
          .addAddress(tokenBAddress)
          .addUint256(tokenAAmount)
          .addUint256(tokenBAmount)
          .addUint256(tokenAAmount)
          .addUint256(tokenBAmount)
          .addAddress(userAddress)
          .addUint256(deadline),
      );

    const transactionBytes: Uint8Array | undefined = await hashconnectConnectorInstance?.makeBytes(
      trans,
      userId as string,
    );

    const response = await hashconnectConnectorInstance?.sendTransaction(
      transactionBytes as Uint8Array,
      userId as string,
      false,
    );

    console.log('response', response);

    const responseData: any = {
      response,
      receipt: null,
    };

    if (response?.success) {
      responseData.receipt = TransactionReceipt.fromBytes(response.receipt as Uint8Array);
    }

    return responseData;
  }

  async swapTokens(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    tokenInId: string,
    tokenOutId: string,
    amountIn: string,
    amountMinOut: string,
  ) {
    const routerContractAddress = '0x000000000000000000000000000000000212272e';
    const tokenInAddress = idToAddress(tokenInId);
    const tokenOutAddress = idToAddress(tokenOutId);
    const userAddress = idToAddress(userId);

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(routerContractAddress))

      //Set the gas for the contract call
      .setGas(3000000)

      //Set the contract function to call
      .setFunction(
        'swapExactTokensForTokens',
        new ContractFunctionParameters()
          .addAddressArray([tokenInAddress, tokenOutAddress])
          .addAddress(userAddress),
      );

    const transactionBytes: Uint8Array | undefined = await hashconnectConnectorInstance?.makeBytes(
      trans,
      userId as string,
    );

    const response = await hashconnectConnectorInstance?.sendTransaction(
      transactionBytes as Uint8Array,
      userId as string,
      false,
    );

    const responseData: any = {
      response,
      receipt: null,
    };

    if (response?.success) {
      responseData.receipt = TransactionReceipt.fromBytes(response.receipt as Uint8Array);
    }

    return responseData;
  }
}

export default SDK;
