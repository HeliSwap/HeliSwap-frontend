import { hethers } from '@hashgraph/hethers';
import { AccountAllowanceApproveTransaction, Client, PrivateKey } from '@hashgraph/sdk';
import { addressToId } from '../utils/tokenUtils';
import FactoryContractABI from './abis/FactoryABI.json';
import MultirewardsContractABI from './abis/MultirewardsABI.json';

const LOCAL_NODE_ACCOUNT_IDS = ['0.0.1012', '0.0.1013', '0.0.1014', '0.0.1015'];
class FarmsSDK {
  factoryAddress: string;
  walletId: string;
  walletAddress: string;
  walletPrivateKey: string;
  provider: hethers.providers.BaseProvider;
  eoaAccount: {
    account: string;
    privateKey: string;
  };
  factoryContract: hethers.Contract;
  connectedWallet: hethers.Wallet;
  network: 'testnet' | 'mainnet';

  constructor() {
    this.network = 'testnet';
    this.factoryAddress = '0x0000000000000000000000000000000002eafc23';
    this.walletId = '0.0.34226199';
    this.walletAddress = '0x00000000000000000000000000000000020A4017';
    this.walletPrivateKey = '0xb9ea0174648293031e3730c3a9b48aa075fe36343dbd5b3015595aeba36f547f';
    this.provider = hethers.providers.getDefaultProvider('testnet');

    this.eoaAccount = {
      account: this.walletId,
      privateKey: this.walletPrivateKey,
    };

    // @ts-ignore
    const walletEoaAccount = new hethers.Wallet(this.eoaAccount, this.provider);
    // @ts-ignore
    this.connectedWallet = walletEoaAccount.connect(this.provider);

    this.factoryContract = new hethers.Contract(
      this.factoryAddress,
      FactoryContractABI,
      this.connectedWallet,
    );
  }

  async deployFarm(tokenAddress: string, loadingFunc: (loading: boolean) => void) {
    loadingFunc(true);
    let farmAddress = '';
    try {
      await this.factoryContract.deploy(this.walletAddress, tokenAddress, {
        gasLimit: 3000000,
      });

      const numberOfFarmsStr = await this.factoryContract.getCampaignsLength({
        gasLimit: 300000,
      });
      const numberOfFarms = parseInt(numberOfFarmsStr);

      farmAddress = await this.factoryContract.campaigns(numberOfFarms - 1, {
        gasLimit: 300000,
      });

      loadingFunc(false);
      return farmAddress;
    } catch (error) {
      console.log(error);
      loadingFunc(false);
      return farmAddress;
    }
  }

  async enableReward(
    farmAddress: string,
    rewardAddress: string,
    duration: number,
    loadingFunc: (loading: boolean) => void,
  ) {
    loadingFunc(true);
    try {
      const multirewardsContract = new hethers.Contract(
        farmAddress,
        MultirewardsContractABI,
        this.connectedWallet,
      );
      await multirewardsContract.enableReward(rewardAddress, true, duration, {
        gasLimit: 1000000,
      });
      console.log('success');

      loadingFunc(false);
    } catch (error) {
      console.log(error);
      loadingFunc(false);
    }
  }

  async approveToken(
    spenderAccountAddress: string,
    tokenAddress: string,
    amount: number,
    loadingFunc: (loading: boolean) => void,
  ): Promise<void> {
    loadingFunc(true);
    try {
      const spenderId = addressToId(spenderAccountAddress);
      const tokenId = addressToId(tokenAddress);

      const networkClient = this.network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
      const client = networkClient.setOperator(
        this.walletId || LOCAL_NODE_ACCOUNT_IDS[0],
        this.walletPrivateKey,
      );
      const tokenApprove = await (
        await new AccountAllowanceApproveTransaction()
          .addTokenAllowance(tokenId, spenderId, amount)
          .freezeWith(client)
          .sign(PrivateKey.fromStringECDSA(this.walletPrivateKey))
      ).execute(client);
      const approveReceipt = await tokenApprove.getReceipt(client);
      console.log(approveReceipt);
      loadingFunc(false);
    } catch (error) {
      console.log(error);
      loadingFunc(false);
    }
  }

  async sendReward(
    farmAddress: string,
    rewardAddress: string,
    amount: number,
    loadingFunc: (loading: boolean) => void,
  ): Promise<void> {
    loadingFunc(true);
    try {
      loadingFunc(true);
      const multirewardsContract = new hethers.Contract(
        farmAddress,
        MultirewardsContractABI,
        this.connectedWallet,
      );
      await multirewardsContract.notifyRewardAmount(rewardAddress, amount, {
        gasLimit: 1000000,
      });
      loadingFunc(false);
      console.log('send successful');
    } catch (error) {
      console.log(error);
      loadingFunc(false);
    }
  }
}

export default FarmsSDK;
