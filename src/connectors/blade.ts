import { BladeSigner, HederaNetwork } from '@bladelabs/blade-web3.js';

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
}

export default BladeConnect;
