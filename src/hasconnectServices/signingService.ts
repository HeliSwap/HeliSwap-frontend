import {
  Client,
  PrivateKey,
  HbarUnit,
  TransferTransaction,
  Transaction,
  AccountId,
  Hbar,
  TransactionId,
  PublicKey,
} from '@hashgraph/sdk';

export class SigningService {
  constructor() {
    this.client = new Client();
  }

  /*****************************
   *
   *  PLEASE NOTE
   *  THIS SHOULD BE SERVER SIDE,
   *  NEVER PUT YOUR DAPP PRIVATE KEYS CLIENT SIDE
   *  GENERATE A FROZEN TRANSACTION ON YOUR SERVER USING YOUR KEYS AND RETURN IT
   */

  client: Client;
  // pk =
  //   '302e020100300506032b65700422042093e3a32a53b0878429043643be0c992cec4f3e2aba8ccbde9905192e9326e0d2';
  // publicKey = 'ce1311702fa06b70c76fa36e9bfb52d1ce6f250634f35f8c822259a1ef9a4a38';
  // acc = '0.0.572001';

  pk =
    '302e020100300506032b657004220420c43bbb4a84ca2964495205f348d2e862c0571f280ccbb1521018a5772d0faf00';
  acc = '0.0.34303026';

  // pk =
  //   '302e020100300506032b6570042204208f928905b01db1a212f1733f6d6fe60e858497316f2ccf06312d210d64386d77';
  // acc = '0.0.34185346';

  async init() {
    // this.client = Client.forTestnet();
    // this.client.setOperator(this.acc, this.pk);
  }

  async signAndMakeBytes(trans: Transaction, signingAcctId: string) {
    const privKey = PrivateKey.fromString(this.pk);
    const pubKey = privKey.publicKey;

    let nodeId = [new AccountId(3)];
    let transId = TransactionId.generate(signingAcctId);

    trans.setNodeAccountIds(nodeId);
    trans.setTransactionId(transId);

    trans = await trans.freeze();

    let transBytes = trans.toBytes();

    const sig = await privKey.signTransaction(Transaction.fromBytes(transBytes) as any);

    const out = trans.addSignature(pubKey, sig);

    const outBytes = out.toBytes();

    console.log('Transaction bytes', outBytes);

    return outBytes;
  }

  async makeBytes(trans: Transaction, signingAcctId: string) {
    let transId = TransactionId.generate(signingAcctId);
    trans.setTransactionId(transId);
    trans.setNodeAccountIds([new AccountId(3)]);

    await trans.freeze();

    let transBytes = trans.toBytes();

    return transBytes;
  }

  signData(data: object): { signature: Uint8Array; serverSigningAccount: string } {
    const privKey = PrivateKey.fromString(this.pk);
    const pubKey = privKey.publicKey;

    let bytes = new Uint8Array(Buffer.from(JSON.stringify(data)));

    let signature = privKey.sign(bytes);

    let verify = pubKey.verify(bytes, signature); //this will be true

    return { signature: signature, serverSigningAccount: this.acc };
  }

  verifyData(data: object, publicKey: string, signature: Uint8Array): boolean {
    const pubKey = PublicKey.fromString(publicKey);

    let bytes = new Uint8Array(Buffer.from(JSON.stringify(data)));

    let verify = pubKey.verify(bytes, signature);

    return verify;
  }
}
