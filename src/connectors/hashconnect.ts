import { HashConnect, HashConnectTypes, MessageTypes } from 'hashconnect';
import { Transaction, AccountId, TransactionId } from '@hashgraph/sdk';
import { randomIntFromInterval } from '../utils/numberUtils';

class Hashconnect {
  constructor(
    setExtensionFound: (loading: boolean) => void,
    setConnected: (loading: boolean) => void,
    setUserId: (userId: string) => void,
    setIsHashpackLoading: (loading: boolean) => void,
    setShowConnectModal: (show: boolean) => void,
  ) {
    this.hashconnect = new HashConnect();
    this.setExtensionFound = setExtensionFound;
    this.setConnected = setConnected;
    this.setUserId = setUserId;
    this.setIsHashpackLoading = setIsHashpackLoading;
    this.setShowConnectModal = setShowConnectModal;
    this.transactionResponseReceived = new CustomEvent('transaction-response-received');
  }

  hashconnect: HashConnect;
  status: string = 'Initializing';

  setUserId: (userId: string) => void;
  setExtensionFound: (loading: boolean) => void;
  setIsHashpackLoading: (loading: boolean) => void;
  setConnected: (loading: boolean) => void;
  setShowConnectModal: (show: boolean) => void;

  availableExtensions: HashConnectTypes.WalletMetadata[] = [];

  saveData: {
    topic: string;
    pairingString: string;
    privateKey?: string;
    pairedWalletData?: HashConnectTypes.WalletMetadata;
    pairedAccounts: string[];
  } = {
    topic: '',
    pairingString: '',
    privateKey: undefined,
    pairedWalletData: undefined,
    pairedAccounts: [],
  };

  appMetadata: HashConnectTypes.AppMetadata = {
    name: 'HeliSwap DEX',
    description: 'HeliSwap DEX',
    icon: 'https://absolute.url/to/icon.png',
  };

  transactionResponseReceived: Event;

  async initHashconnect() {
    //create the hashconnect instance
    this.hashconnect = new HashConnect(true);

    if (this.loadLocalData()) {
      await this.hashconnect.init(this.appMetadata, this.saveData.privateKey);
      await this.hashconnect.connect(this.saveData.topic, this.saveData.pairedWalletData!);

      this.setExtensionFound(true);
      this.setConnected(true);
    } else {
      //first init, store the private key in localstorage
      const initData = await this.hashconnect.init(this.appMetadata);
      this.saveData.privateKey = initData.privKey;

      //then connect, storing the new topic in localstorage
      const state = await this.hashconnect.connect();
      this.saveData.topic = state.topic;

      //generate a pairing string, which you can display and generate a QR code from
      this.saveData.pairingString = this.hashconnect.generatePairingString(
        state,
        process.env.REACT_APP_NETWORK_TYPE || '',
        true,
      );

      //find any supported local wallets
      this.hashconnect.findLocalWallets();
    }

    this.setUpEvents();
  }

  setUpEvents() {
    this.hashconnect.foundExtensionEvent.on(data => {
      this.availableExtensions.push(data);

      this.setExtensionFound(true);
    });

    this.hashconnect.pairingEvent.on(data => {
      this.saveData.pairedWalletData = data.metadata;

      data.accountIds.forEach(id => {
        if (this.saveData.pairedAccounts.indexOf(id) === -1) {
          this.saveData.pairedAccounts.push(id);
          this.setUserId(id);
        }
      });

      this.saveDataInLocalstorage();
      this.setConnected(true);
      this.setIsHashpackLoading(false);
      this.setShowConnectModal(false);
    });

    this.hashconnect.transactionEvent.on(data => {
      //this will not be common to be used in a dapp
      console.log('transaction event callback');
    });
  }

  connect() {
    this.hashconnect.connectToLocalWallet(this.saveData.pairingString);
    this.setConnected(true);
  }

  disconnect() {
    this.saveData.pairedAccounts = [];
    this.saveData.pairedWalletData = undefined;
    localStorage.removeItem('hashconnectData');

    this.setConnected(false);
  }

  saveDataInLocalstorage() {
    let data = JSON.stringify(this.saveData);

    localStorage.setItem('hashconnectData', data);
  }

  loadLocalData(): boolean {
    let foundData = localStorage.getItem('hashconnectData');

    if (foundData) {
      this.saveData = JSON.parse(foundData);
      return true;
    } else return false;
  }

  async sendTransaction(trans: Uint8Array, acctToSign: string, return_trans: boolean = false) {
    const transaction: MessageTypes.Transaction = {
      topic: this.saveData.topic,
      byteArray: trans,

      metadata: {
        accountToSign: acctToSign,
        returnTransaction: return_trans,
      },
    };

    const transactionRespose = await this.hashconnect.sendTransaction(
      this.saveData.topic,
      transaction,
    );

    document.dispatchEvent(this.transactionResponseReceived);
    return transactionRespose;
  }

  async requestAccountInfo() {
    let request: MessageTypes.AdditionalAccountRequest = {
      topic: this.saveData.topic,
      network: process.env.REACT_APP_NETWORK_TYPE || '',
      multiAccount: true,
    };

    await this.hashconnect.requestAdditionalAccounts(this.saveData.topic, request);
  }

  async makeBytes(trans: Transaction, signingAcctId: string) {
    let transId = TransactionId.generate(signingAcctId);
    trans.setTransactionId(transId);

    let nodeId = 3;
    //Choose random node depending on the network selected (we exclude some of the nodes as the current hashgraph/sdk version 2.16.2 used by hashconnect doesn't support all of the available hedera nodes)
    if (process.env.REACT_APP_NETWORK_TYPE === 'testnet') {
      nodeId = randomIntFromInterval(3, 7);
    } else if (process.env.REACT_APP_NETWORK_TYPE === 'mainnet') {
      nodeId = randomIntFromInterval(3, 20);
    }

    trans.setNodeAccountIds([new AccountId(nodeId)]);

    trans.freeze();

    let transBytes = trans.toBytes();

    return transBytes;
  }
}

export default Hashconnect;
