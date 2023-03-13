import { AccountId, Transaction, TransactionId } from '@hashgraph/sdk';
import { BladeSigner, HederaNetwork } from '@bladelabs/blade-web3.js';
import { randomIntFromInterval } from '../utils/numberUtils';

class BladeConnect {
  signer: BladeSigner;
  setConnected: (loading: boolean) => void;
  setUserId: (userId: string) => void;

  constructor(setConnected: (loading: boolean) => void, setUserId: (userId: string) => void) {
    this.signer = {} as BladeSigner;
    this.setConnected = setConnected;
    this.setUserId = setUserId;
  }

  async initBlade() {
    const bladeSigner = new BladeSigner();

    const params = {
      network: process.env.REACT_APP_NETWORK_TYPE as HederaNetwork,
      // dAppCode - optional while testing, request specific one by contacting us.
      dAppCode: 'HeliSwap DEX',
    };

    // create session with optional parameters.
    await bladeSigner.createSession(params);

    this.signer = bladeSigner;
    this.setConnected(true);
    this.setUserId(bladeSigner.getAccountId().toString());
  }

  async sendTransaction(transaction: Transaction) {
    return await this.signer.call(transaction);
  }

  async freezeTransaction(trans: Transaction, userId: string) {
    let transId = TransactionId.generate(userId);
    trans.setTransactionId(transId);

    let nodeId = 5;
    //Choose random node depending on the network selected (we exclude some of the nodes as the current hashgraph/sdk version 2.16.2 used by hashconnect doesn't support all of the available hedera nodes)
    if (process.env.REACT_APP_NETWORK_TYPE === 'testnet') {
      nodeId = randomIntFromInterval(3, 7);
    } else if (process.env.REACT_APP_NETWORK_TYPE === 'mainnet') {
      nodeId = randomIntFromInterval(5, 20);
    }

    trans.setNodeAccountIds([new AccountId(nodeId)]);

    trans.freeze();

    return trans;
  }
}

export default BladeConnect;
