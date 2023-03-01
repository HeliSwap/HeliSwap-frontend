import { hethers } from '@hashgraph/hethers';
import { formatStringWeiToStringEther } from '../utils/numberUtils';
import { addressToId } from '../utils/tokenUtils';
import FactoryContractABI from './abis/FactoryABI.json';
import MultirewardsContractABI from './abis/MultirewardsABI.json';
import WHBARABI from './abis/WHBARABI.json';
import ERC20 from '../abi/ERC20.json';

type networkType = 'testnet' | 'mainnet';
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
  network: networkType;

  constructor() {
    this.network = 'testnet';
    // this.network = process.env.REACT_APP_NETWORK_TYPE as networkType;
    this.factoryAddress = process.env.REACT_APP_CAMPAIGN_FACTORY_ADDRESS as string;
    this.walletAddress = process.env.REACT_APP_DEPLOYER_ADDRESS as string;

    this.walletId = addressToId(this.walletAddress);
    this.walletPrivateKey = process.env.REACT_APP_DEPLOYER_PK as string;
    this.provider = hethers.providers.getDefaultProvider(this.network);

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

  async deployFarm(tokenAddress: string) {
    let farmAddress = '';
    await this.factoryContract.deploy(this.walletAddress, tokenAddress, {
      gasLimit: 250000,
    });

    const numberOfFarmsStr = await this.factoryContract.getCampaignsLength({
      gasLimit: 50000,
    });
    const numberOfFarms = parseInt(numberOfFarmsStr);

    farmAddress = await this.factoryContract.campaigns(numberOfFarms - 1, {
      gasLimit: 50000,
    });

    return farmAddress;
  }

  async enableReward(farmAddress: string, rewardAddress: string, duration: number) {
    const multirewardsContract = new hethers.Contract(
      farmAddress,
      MultirewardsContractABI,
      this.connectedWallet,
    );
    await multirewardsContract.enableReward(rewardAddress, true, duration, {
      gasLimit: 850000,
    });
  }

  async sendReward(farmAddress: string, rewardAddress: string, amount: number): Promise<void> {
    const multirewardsContract = new hethers.Contract(
      farmAddress,
      MultirewardsContractABI,
      this.connectedWallet,
    );
    await multirewardsContract.notifyRewardAmount(rewardAddress, amount, {
      gasLimit: 200000,
    });
    console.log('reward sent successfully');
  }

  async setRewardDuration(
    farmAddress: string,
    rewardAddress: string,
    duration: number,
  ): Promise<void> {
    const multirewardsContract = new hethers.Contract(
      farmAddress,
      MultirewardsContractABI,
      this.connectedWallet,
    );
    await multirewardsContract.setRewardsDuration(rewardAddress, duration, {
      gasLimit: 100000,
    });
    console.log('changed reward duration successfully');
  }

  async wrapHBAR(hbarAmount: string) {
    const WHBAR = new hethers.Contract(
      process.env.REACT_APP_WHBAR_ADDRESS as string,
      WHBARABI,
      this.connectedWallet,
    );

    const depositTx = await WHBAR.deposit({
      value: hbarAmount,
      gasLimit: 150_000,
    });

    await depositTx.wait();
  }

  async approveToken(tokenAddress: string, spenderAddress: string, amountToApprove: string) {
    const tokenContract = new hethers.Contract(tokenAddress, ERC20.abi, this.connectedWallet);

    const approveTX = await tokenContract.approve(spenderAddress, amountToApprove, {
      gasLimit: 1000000,
    });

    await approveTX.wait();
  }
}

export default FarmsSDK;
