import { AccountId, Transaction, TransactionId } from '@hashgraph/sdk';
import { HashConnect, HashConnectTypes, MessageTypes } from 'hashconnect';
import { randomIntFromInterval } from '../utils/numberUtils';

type NetworkType = 'testnet' | 'mainnet' | 'previewnet';

class Hashconnect {
  hashconnect: HashConnect;

  appMetadata: HashConnectTypes.AppMetadata = {
    name: 'HeliSwap DEX',
    description: 'HeliSwap DEX',
    icon: 'https://absolute.url/to/icon.png',
  };

  topic: string = '';
  pairingString: string = '';
  pairingData: HashConnectTypes.SavedPairingData | null = null;

  setUserId: (userId: string) => void;
  setExtensionFound: (loading: boolean) => void;
  setIsHashpackLoading: (loading: boolean) => void;
  setConnected: (loading: boolean) => void;
  setShowConnectModal: (show: boolean) => void;
  transactionResponseReceived: Event;

  availableExtensions: HashConnectTypes.WalletMetadata[] = [];
  pairedWalletData?: HashConnectTypes.WalletMetadata;
  pairedAccounts: string[] = [];

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

  async initHashconnect() {
    //create the hashconnect instance
    this.hashconnect = new HashConnect(true);

    //register events
    this.setUpHashConnectEvents();

    //initialize and use returned data
    let initData = await this.hashconnect.init(
      this.appMetadata,
      process.env.REACT_APP_NETWORK_TYPE as NetworkType,
      false,
    );

    this.topic = initData.topic;
    this.pairingString = initData.pairingString;

    //Saved pairings will return here, generally you will only have one unless you are doing something advanced
    this.pairingData = initData.savedPairings[0];

    if (this.pairingData && this.pairingData.accountIds[0]) {
      this.setUserId(this.pairingData.accountIds[0]);
      this.setConnected(true);
    }
  }

  setUpHashConnectEvents() {
    this.hashconnect.foundExtensionEvent.on(data => {
      this.availableExtensions.push(data);

      this.setExtensionFound(true);
    });

    this.hashconnect.pairingEvent.on(data => {
      this.pairedWalletData = data.metadata;

      data.accountIds.forEach(id => {
        if (this.pairedAccounts.indexOf(id) === -1) {
          this.pairedAccounts.push(id);
          this.setUserId(id);
        }
      });

      this.setConnected(true);
      this.setIsHashpackLoading(false);
      this.setShowConnectModal(false);
    });

    this.hashconnect.transactionEvent.on(data => {
      //this will not be common to be used in a dapp
      console.log('transaction event callback');
    });
  }

  async connectToExtension() {
    const hashconnectData = localStorage.getItem('hashconnectData');

    if (!hashconnectData) {
      await this.initHashconnect();
    }
    //this will automatically pop up a pairing request in the HashPack extension
    this.hashconnect.connectToLocalWallet();
  }

  async sendTransaction(
    trans: Uint8Array,
    acctToSign: string,
    return_trans: boolean = false,
    hideNfts: boolean = false,
  ) {
    const transaction: MessageTypes.Transaction = {
      topic: this.topic,
      byteArray: trans,

      metadata: {
        accountToSign: acctToSign,
        returnTransaction: return_trans,
        hideNft: hideNfts,
      },
    };

    return await this.hashconnect.sendTransaction(this.topic, transaction);
  }

  async requestAccountInfo() {
    let request: MessageTypes.AdditionalAccountRequest = {
      topic: this.topic,
      network: process.env.REACT_APP_NETWORK_TYPE as NetworkType,
      multiAccount: true,
    };

    await this.hashconnect.requestAdditionalAccounts(this.topic, request);
  }

  clearPairings() {
    this.hashconnect.clearConnectionsAndData();
    this.pairingData = null;
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
