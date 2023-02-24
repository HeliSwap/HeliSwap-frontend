# 💰 HeliSwap Dex Frontend

Node version: `16.14.2`

If you use another version, please use [n](https://github.com/tj/n) to manage.

## ⚙️ Installation

```
yarn
```

⚠️ Project requires to be run on ssh due to wallet requirements.

Please follow instruction [here](https://www.freecodecamp.org/news/how-to-set-up-https-locally-with-create-react-app/) to setup local certificate.

Before running the project please create `.env` or use the example one.

```shell
cp .env.example .env
```

```
REACT_APP_PROVIDER_URL = <LINK_TO_RELAYER_URL>
REACT_APP_MIRROR_NODE_URL = <LINK_TO_MIRROR_NODE>
REACT_APP_TOKEN_LIST_URL = <LINK_TO_TOKEN_LIST>
REACT_APP_NETWORK_TYPE = <NETWORK_TYPE>
REACT_APP_GRAPHQL_URI = <LINK_TO_GRAPHQL_ENDPOINT>
REACT_APP_ROUTER_ADDRESS = <ROUTER_ADDRESS>
REACT_APP_WHBAR_ADDRESS = <WRAPPED_HBAR_ADDRESS>
REACT_APP_LOCKDROP_ADDRESS = <LOCKDROP_ADDRESS>
REACT_APP_HELI_TOKEN_ADDRESS = <HELI_TOKEN_ADDRESS>
REACT_APP_POOL_MIN_LIQUIDITY = <MIN_POOL_LIQUITIDY_FOR_PRICE_CALCULATION>
```

## 🚀 Available Scripts

To start the project, you can run:

```
yarn start
```

Runs the app in the development mode.\
Open [https://localhost:3000](https://localhost:3000) to view it in the browser.
