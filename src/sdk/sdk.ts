import { hethers, BigNumber } from '@hashgraph/hethers';
import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  TransactionReceipt,
} from '@hashgraph/sdk';
import Hashconnect from '../connectors/hashconnect';
import { ICreatePairData } from '../interfaces/comon';
import { addressToId, idToAddress } from '../utils/tokenUtils';
import { formatStringToBigNumberWei } from '../utils/numberUtils';

import ERC20 from '../abi/ERC20';
import PairV2 from '../abi/PairV2';
// import router from '../abi/router';
import BN from 'bignumber.js';

class SDK {
  getSwapAmountOut(
    poolAddess: string,
    amountIn: string,
    amountInRes: string,
    amountOutRes: string,
    connectedWallet: any,
  ) {
    // const routerContract = hethers.ContractFactory.getContract(
    //   poolAddess,
    //   router.abi,
    //   connectedWallet,
    // );

    const tenPowDecS = new BN(10).pow(18);
    const amountInBN = new BN(amountIn).times(tenPowDecS);

    const amountInBNStr = amountInBN.toString();
    const amountInBNStrHethers = BigNumber.from(amountInBNStr);

    // const amountInResBNStr = amountInRes.toString();
    const amountInResBNStrHethers = BigNumber.from(amountInRes);

    // const amountOutResBNStr = amountOutRes.toString();
    const amountOutResBNStrHethers = BigNumber.from(amountOutRes);

    // const totalSupply = await routerContract.getSwapAmountOut(
    //   amountInBNStrHethers,
    //   amountInResBNStrHethers,
    //   amountOutResBNStrHethers,
    //   {
    //     gasLimit: 3000000,
    //   },
    // );
    // console.log('totalSupply', totalSupply.toString());

    // const amountInPar = BigNumber.from('100');

    // const amountsOut = await routerContract.getAmountsOut(
    //   BigNumber.from(amountIn).mul(tenPowDec),
    //   ['0x00000000000000000000000000000000021385a7', '0x00000000000000000000000000000000021385af'],
    //   {
    //     gasLimit: 3000000,
    //   },
    // );

    // console.log(amountsOut[0].toString(), amountsOut[1].toString());

    const amountInWithFee = amountInBNStrHethers.mul(997);
    const numerator = amountInWithFee.mul(amountOutResBNStrHethers);
    const denominator = amountInResBNStrHethers.mul(1000).add(amountInWithFee);
    const amountOut = numerator.div(denominator);
    console.log('amountOut', hethers.utils.formatUnits(amountOut, 18).toString());

    return hethers.utils.formatUnits(amountOut, 18).toString();
  }

  getSwapAmountIn(
    poolAddess: string,
    amountOut: string,
    amountInRes: string,
    amountOutRes: string,
    connectedWallet: any,
  ) {
    // const routerContract = hethers.ContractFactory.getContract(
    //   poolAddess,
    //   router.abi,
    //   connectedWallet,
    // );

    const tenPowDecS = new BN(10).pow(18);
    const amountoutBN = new BN(amountOut).times(tenPowDecS);

    const amountOutBNStr = amountoutBN.toString();
    const amountOutBNStrHethers = BigNumber.from(amountOutBNStr);

    // const amountInResBNStr = amountInRes.toString();
    const amountInResBNStrHethers = BigNumber.from(amountInRes);

    // const amountOutResBNStr = amountOutRes.toString();
    const amountOutResBNStrHethers = BigNumber.from(amountOutRes);

    const numerator = amountInResBNStrHethers.mul(amountOutBNStrHethers).mul(1000);
    const denominator = amountOutResBNStrHethers.sub(amountOutBNStrHethers).mul(997);
    const amountIn = numerator.div(denominator).add(1);
    console.log('amountIn', hethers.utils.formatUnits(amountIn, 18).toString());

    return hethers.utils.formatUnits(amountIn, 18).toString();
  }

  /* Hethers contract calls - To be removed! */
  async checkAllowance(
    tokenAddress: string,
    userAddress: string,
    spenderAddress: string,
    connectedWallet: any,
  ) {
    const erc20 = hethers.ContractFactory.getContract(tokenAddress, ERC20.abi, connectedWallet);

    const allowance = await erc20.allowance(userAddress, spenderAddress, {
      gasLimit: 3000000,
    });

    return allowance;
  }

  async checkBalance(tokenAddress: string, userAddress: string, connectedWallet: any) {
    const erc20 = hethers.ContractFactory.getContract(tokenAddress, ERC20.abi, connectedWallet);

    const balance = await erc20.balanceOf(userAddress, {
      gasLimit: 3000000,
    });

    return balance;
  }

  async getReserves(poolAddess: string, connectedWallet: any) {
    const pairV2 = hethers.ContractFactory.getContract(poolAddess, PairV2.abi, connectedWallet);

    const reserves = await pairV2.getReserves({
      gasLimit: 3000000,
    });

    return reserves;
  }

  async getTotalSupply(poolAddess: string, connectedWallet: any) {
    const pairV2 = hethers.ContractFactory.getContract(poolAddess, PairV2.abi, connectedWallet);

    const totalSupply = await pairV2.totalSupply({
      gasLimit: 3000000,
    });

    return totalSupply;
  }
  /* Hethers contract calls - To be removed! */

  // Works only for erc20 tokens
  async approveToken(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    tokenId: string | ContractId,
  ) {
    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;

    const amountToApproveBN = formatStringToBigNumberWei('1000000000');

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
          .addUint256(amountToApproveBN),
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

    const tokenAAmount = formatStringToBigNumberWei(tokenAAmountString);
    const tokenBAmount = formatStringToBigNumberWei(tokenBAmountString);

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

    const responseData: any = {
      response,
      receipt: null,
    };

    if (response?.success) {
      responseData.receipt = TransactionReceipt.fromBytes(response.receipt as Uint8Array);
    }

    return responseData;
  }

  async removeLiquidity(
    hashconnectConnectorInstance: Hashconnect,
    userId: string,
    tokenInAddress: string,
    tokenOutAddress: string,
    tokensLpAmount: string,
    tokens0Amount: string,
    tokens1Amount: string,
  ) {
    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;
    const userAddress = idToAddress(userId);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60;

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(routerContractAddress))

      //Set the gas for the contract call
      .setGas(3000000)

      //Set the contract function to call
      .setFunction(
        'removeLiquidity',
        new ContractFunctionParameters()
          .addAddress(tokenInAddress)
          .addAddress(tokenOutAddress)
          // @ts-ignore
          .addUint256(tokensLpAmount)
          // @ts-ignore
          .addUint256(tokens0Amount)
          // @ts-ignore
          .addUint256(tokens1Amount)
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
    const routerContractAddress = process.env.REACT_APP_ROUTER_ADDRESS as string;
    const tokenInAddress = idToAddress(tokenInId);
    const tokenOutAddress = idToAddress(tokenOutId);
    const userAddress = idToAddress(userId);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60;

    const tokenInAmount = formatStringToBigNumberWei(amountIn);
    const tokenOutMinAmount = formatStringToBigNumberWei(amountMinOut);

    const trans = new ContractExecuteTransaction()
      //Set the ID of the contract
      .setContractId(addressToId(routerContractAddress))

      //Set the gas for the contract call
      .setGas(3000000)

      //Set the contract function to call
      .setFunction(
        'swapExactTokensForTokens',
        new ContractFunctionParameters()
          .addUint256(tokenInAmount) //amountIn
          .addUint256(tokenOutMinAmount) //amountMinOut
          .addAddressArray([tokenInAddress, tokenOutAddress])
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
