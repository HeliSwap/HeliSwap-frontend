import { Client, TokenInfoQuery, TokenId, AccountId, PrivateKey } from '@hashgraph/sdk';

class SDK {
  private client;

  constructor() {
    // This needs to be taked from wallet
    const operatorId = AccountId.fromString(process.env.REACT_APP_OPERATOR_ID || '');
    const operatorKey = PrivateKey.fromString(process.env.REACT_APP_OPERATOR_KEY || '');

    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    this.client = client;
  }

  async getTokenInfo(tokenIdString: string) {
    const tokenIdObject = TokenId.fromString(tokenIdString);
    const { tokenId, name, symbol, totalSupply, expirationTime, decimals } =
      await new TokenInfoQuery().setTokenId(tokenIdObject).execute(this.client);

    const tokenInfo = {
      tokenId: tokenId.toString(),
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString(),
      expirationTime: expirationTime?.toString(),
    };

    return tokenInfo;
  }
}

export default SDK;
