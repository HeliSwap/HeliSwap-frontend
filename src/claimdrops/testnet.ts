import { ethers } from 'ethers';

const data = [
  {
    claimdropStart: {
      date: '06 March 2023',
      timestamp: 1678101242000,
    },
    claimdropEnd: {
      date: '09 March 2023',
      timestamp: 1678360442000,
    },
    expiryEnd: {
      date: '16 March 2023',
      timestamp: 1678965242000,
    },
    vestingPeriod: {
      valueString: '3 Days',
      valueNumericDays: 3,
      valueNumericMilliseconds: 259200000,
    },
    claimPeriod: {
      valueString: '7 Days',
      valueNumericDays: 7,
      valueNumericMilliseconds: 604800000,
    },
    totalAllocated: {
      valueBN: ethers.BigNumber.from('100000000000000'),
      valueStringWei: '100000000000000',
      valueStringETH: '1000000.0',
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
    claimdropAddress: '0x000000000000000000000000000000000037bb12',
    title: 'HELI',
    claimdropDescription:
      'You may have received claimable token rewards from the HeliSwap Airdrop. Claiming your airdrop will forfeit a portion of your balance. Your total claimable amount will rise whenever someone forfeits a portion of their reward.',
  },
];

export default data;
