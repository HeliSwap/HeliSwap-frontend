import { ethers } from 'ethers';

const data = [
  {
    claimdropStart: {
      date: '17 February 2023',
      timestamp: 1676626712000,
    },
    claimdropEnd: {
      date: '18 May 2023',
      timestamp: 1684402712000,
    },
    vestingPeriod: {
      valueString: '90 Days',
      valueNumericDays: 90,
      valueNumericMilliseconds: 7776000000,
    },
    claimPeriod: {
      valueString: '7 Days',
      valueNumericDays: 7,
      valueNumericMilliseconds: 604800000,
    },
    totalAllocated: {
      valueBN: ethers.BigNumber.from('1000000000000'),
      valueStringWei: '1000000000000',
      valueStringETH: '10000.0',
    },
    claimedOf: {
      valueBN: ethers.BigNumber.from('0'),
      valueStringWei: '0',
      valueStringETH: '0.0',
    },
    vestedTokensOf: {
      valueBN: ethers.BigNumber.from('0'),
      valueStringWei: '0',
      valueStringETH: '0.0',
    },
    claimable: {
      valueBN: ethers.BigNumber.from('0'),
      valueStringWei: '0',
      valueStringETH: '0.0',
    },
    extraTokensOf: {
      valueBN: ethers.BigNumber.from('0'),
      valueStringWei: '0',
      valueStringETH: '0.0',
    },
    totalAllocatedOf: {
      valueBN: ethers.BigNumber.from('0'),
      valueStringWei: '0',
      valueStringETH: '0.0',
    },
    token: '0x0000000000000000000000000000000000002023',
    claimdropAddress: '0x0000000000000000000000000000000000372c6e',
    title: 'HELI',
  },
];

export default data;
