import { Client } from '@hashgraph/sdk';

class SDK {
  constructor() {
    const client = Client.forTestnet();

    console.log('client', client);
  }
}

export default SDK;
