import { ethers } from 'ethers';

const data = [
  {
    claimdropStart: {
      date: '08 March 2023',
      timestamp: 1678261314000,
    },
    claimdropEnd: {
      date: '11 March 2023',
      timestamp: 1678520514000,
    },
    expiryEnd: {
      date: '18 March 2023',
      timestamp: 1679125314000,
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
    token: '0x00000000000000000000000000000000001d90C9',
    claimdropAddress: '',
    title: 'HELI',
    claimdropTitle: 'Lockdrop Claimdrop',
    claimdropDescription:
      'If you participated in the Community Lockdrop, the HeliSwap Team would like to thank you for your trust and commitment to the platform. This is why we decided to give you extra HELI tokens that symbolize the importance of the community to us. Welcome to HELI ! Enjoy the ride!',
  },
];

export default data;
