const axios = require('axios');

const extractUniqueAddressesFromContract = async contractId => {
  const startDateTimestamp = 1693440000;
  const endDateTimestamp = Date.now() / 1000;
  const step = 24 * 60 * 60;
  let addresses = [];

  for (let i = startDateTimestamp; i < endDateTimestamp; i += step) {
    const result = await axios(
      `https://mainnet-public.mirrornode.hedera.com/api/v1/contracts/${contractId}/results?limit=200&order=asc&timestamp=gt:${i}`,
    );
    const found = result.data.results.map(item => item.from);
    addresses = [...addresses, ...found];
  }

  const uniqueAddresses = addresses.filter((item, index) => addresses.indexOf(item) === index);

  const chunkSize = 100;
  for (let i = 0; i < uniqueAddresses.length; i += chunkSize) {
    const chunk = uniqueAddresses.slice(i, i + chunkSize);
    console.log(`chunk ${i} - ${i + chunkSize}`, chunk);
  }

  console.log('All addresses: ', addresses.length);
  console.log('Unique addresses: ', uniqueAddresses.length);
};

extractUniqueAddressesFromContract('0.0.3696885');
