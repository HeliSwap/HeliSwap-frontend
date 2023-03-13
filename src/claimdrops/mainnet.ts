import { ethers } from 'ethers';

const data = [
  {
    claimdropStart: {
      date: '08 March 2023',
      timestamp: 1678276556000,
    },
    claimdropEnd: {
      date: '08 April 2023',
      timestamp: 1680904556000,
    },
    expiryEnd: {
      date: '07 June 2023',
      timestamp: 1686160556000,
    },
    vestingPeriod: {
      valueString: '30 Days',
      valueNumericDays: 30,
      valueNumericMilliseconds: 2628000000,
    },
    claimPeriod: {
      valueString: '60 Days',
      valueNumericDays: 60,
      valueNumericMilliseconds: 5256000000,
    },
    totalAllocated: {
      valueBN: ethers.BigNumber.from('89660000000000'),
      valueStringWei: '89660000000000',
      valueStringETH: '896600.0',
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
    claimdropAddress: '0x00000000000000000000000000000000001ec642',
    title: 'HELI',
    claimdropTitle: 'Lockdrop Claimdrop',
    claimdropDescription:
      'If you participated in the Community Lockdrop, the HeliSwap Team would like to thank you for your trust and commitment to the platform. This is why we decided to give you extra HELI tokens that symbolize the importance of the community to us. Welcome to HELI ! Enjoy the ride!',
  },
];

export default data;
