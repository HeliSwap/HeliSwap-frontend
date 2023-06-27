import {
  AccountId,
  Client,
  Transaction,
  TransactionId,
  TransactionReceiptQuery,
} from '@hashgraph/sdk';
import {
  BladeConnector,
  ConnectorStrategy,
  BladeSigner,
  HederaNetwork,
} from '@bladelabs/blade-web3.js';
import { randomIntFromInterval } from '../utils/numberUtils';

class BladeConnect {
  connector: BladeConnector;
  signer: BladeSigner | null = null;
  setConnected: (loading: boolean) => void;
  setUserId: (userId: string) => void;
  setShowConnectModal: (show: boolean) => void;
  setConnectorInstance: (instance: BladeConnect) => void;

  constructor(
    setConnected: (loading: boolean) => void,
    setUserId: (userId: string) => void,
    setShowConnectModal: (show: boolean) => void,
    setConnectorInstance: (instance: BladeConnect) => void,
  ) {
    const bladeConnector = new BladeConnector(ConnectorStrategy.EXTENSION, {
      name: 'HeliSwap DEX',
      description: 'DApp description',
      url: 'https://app.heliswap.io/',
      icons: ['logo.png'],
    });

    this.connector = bladeConnector;
    this.setConnected = setConnected;
    this.setUserId = setUserId;
    this.setShowConnectModal = setShowConnectModal;
    this.setConnectorInstance = setConnectorInstance;
  }

  async connect() {
    const params = {
      network: process.env.REACT_APP_NETWORK_TYPE as HederaNetwork,
    };

    // create session with optional parameters.
    const accounts = await this.connector.createSession(params);

    this.setConnected(true);
    this.setUserId(accounts[0]);
    this.signer = await this.connector.getSigner();
    this.setShowConnectModal(false);
    this.setConnectorInstance(this);
  }

  async sendTransaction(transaction: Transaction, userId: string) {
    const transactionBytes = await this.freezeTransaction(transaction, userId);
    const signer = (await this.connector.getSigner()) as BladeSigner;
    const response = await signer.call(transactionBytes);
    const { transactionId } = response;

    try {
      const networkType = process.env.REACT_APP_NETWORK_TYPE as string;
      const client = networkType === 'testnet' ? Client.forTestnet() : Client.forMainnet();
      const receipt = await new TransactionReceiptQuery({
        transactionId,
      }).execute(client);

      return {
        response: {
          ...response,
          success: receipt.status.toString() === 'SUCCESS',
          error: '',
        },
        receipt,
      };
    } catch (error) {
      return {
        response: {
          ...response,
          success: false,
          error,
        },
        receipt: null,
      };
    }
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
