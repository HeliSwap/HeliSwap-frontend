import { HashConnect, HashConnectTypes, MessageTypes } from 'hashconnect';
import { Transaction, AccountId, TransactionId } from '@hashgraph/sdk';
export class HashconnectService {
  constructor(
    setLoading: (loading: boolean) => void,
    setExtensionFound: (loading: boolean) => void,
    setConnected: (loading: boolean) => void,
  ) {
    this.hashconnect = new HashConnect();
    this.setLoading = setLoading;
    this.setExtensionFound = setExtensionFound;
    this.setConnected = setConnected;
  }

  hashconnect: HashConnect;
  status: string = 'Initializing';
  setLoading: (loading: boolean) => void;
  setExtensionFound: (loading: boolean) => void;
  setConnected: (loading: boolean) => void;

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
    name: 'dApp Example',
    description: 'An example hedera dApp',
    icon: 'https://www.hashpack.app/img/logo.svg',
  };

  async initHashconnect() {
    //create the hashconnect instance
    this.hashconnect = new HashConnect(true);

    if (this.loadLocalData()) {
      await this.hashconnect.init(this.appMetadata, this.saveData.privateKey);
      await this.hashconnect.connect(this.saveData.topic, this.saveData.pairedWalletData!);
      this.setLoading(false);
      this.setExtensionFound(true);
      this.setConnected(true);
      this.status = 'Paired';
    } else {
      //first init, store the private key in localstorage
      let initData = await this.hashconnect.init(this.appMetadata);
      this.saveData.privateKey = initData.privKey;

      //then connect, storing the new topic in localstorage
      const state = await this.hashconnect.connect();
      console.log('Received state', state);
      this.saveData.topic = state.topic;

      //generate a pairing string, which you can display and generate a QR code from
      this.saveData.pairingString = this.hashconnect.generatePairingString(state, 'testnet', true);

      //find any supported local wallets
      this.hashconnect.findLocalWallets();

      this.status = 'Connected';
    }

    this.setUpEvents();
  }

  setUpEvents() {
    this.hashconnect.foundExtensionEvent.on(data => {
      this.availableExtensions.push(data);
      this.setLoading(false);
      this.setExtensionFound(true);
      console.log('Found extension', data);
    });

    // this.hashconnect.additionalAccountResponseEvent.on((data) => {
    //     console.log("Received account info", data);

    //     data.accountIds.forEach(id => {
    //         if(this.saveData.pairedAccounts.indexOf(id) == -1)
    //             this.saveData.pairedAccounts.push(id);
    //     })
    // })

    this.hashconnect.pairingEvent.on(data => {
      console.log('Paired with wallet', data);
      this.status = 'Paired';

      this.saveData.pairedWalletData = data.metadata;

      data.accountIds.forEach(id => {
        if (this.saveData.pairedAccounts.indexOf(id) == -1) this.saveData.pairedAccounts.push(id);
      });

      this.saveDataInLocalstorage();
      this.setLoading(false);
      this.setConnected(true);
    });

    this.hashconnect.transactionEvent.on(data => {
      //this will not be common to be used in a dapp
      console.log('transaction event callback');
    });
  }

  async connectToExtension() {
    this.hashconnect.connectToLocalWallet(this.saveData.pairingString);
    this.setConnected(true);
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

    return await this.hashconnect.sendTransaction(this.saveData.topic, transaction);
  }

  async requestAccountInfo() {
    let request: MessageTypes.AdditionalAccountRequest = {
      topic: this.saveData.topic,
      network: 'mainnet',
      multiAccount: true,
    };

    await this.hashconnect.requestAdditionalAccounts(this.saveData.topic, request);
  }

  saveDataInLocalstorage() {
    let data = JSON.stringify(this.saveData);

    localStorage.setItem('hashconnectData', data);
  }

  loadLocalData(): boolean {
    let foundData = localStorage.getItem('hashconnectData');

    if (foundData) {
      this.saveData = JSON.parse(foundData);
      console.log('Found local data', this.saveData);
      return true;
    } else return false;
  }

  clearPairings() {
    this.saveData.pairedAccounts = [];
    this.saveData.pairedWalletData = undefined;
    this.status = 'Connected';
    localStorage.removeItem('hashconnectData');
    this.setConnected(false);
  }

  async makeBytes(trans: Transaction, signingAcctId: string) {
    let transId = TransactionId.generate(signingAcctId);
    trans.setTransactionId(transId);
    trans.setNodeAccountIds([new AccountId(3)]);

    await trans.freeze();

    let transBytes = trans.toBytes();

    return transBytes;
  }
}
