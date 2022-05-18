const PairV2 = {
  _format: 'hh-sol-artifact-1',
  contractName: 'UniswapV2Pair',
  sourceName: 'contracts/core/UniswapV2Pair.sol',
  abi: [
    {
      inputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'Approval',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount0',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount1',
          type: 'uint256',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
      ],
      name: 'Burn',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount0',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount1',
          type: 'uint256',
        },
      ],
      name: 'Mint',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount0In',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount1In',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount0Out',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount1Out',
          type: 'uint256',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
      ],
      name: 'Swap',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint112',
          name: 'reserve0',
          type: 'uint112',
        },
        {
          indexed: false,
          internalType: 'uint112',
          name: 'reserve1',
          type: 'uint112',
        },
      ],
      name: 'Sync',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'Transfer',
      type: 'event',
    },
    {
      constant: true,
      inputs: [],
      name: 'DOMAIN_SEPARATOR',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'MINIMUM_LIQUIDITY',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'PERMIT_TYPEHASH',
      outputs: [
        {
          internalType: 'bytes32',
          name: '',
          type: 'bytes32',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'allowance',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'approve',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'balanceOf',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
      ],
      name: 'burn',
      outputs: [
        {
          internalType: 'uint256',
          name: 'amount0',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'amount1',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'decimals',
      outputs: [
        {
          internalType: 'uint8',
          name: '',
          type: 'uint8',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'factory',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'getReserves',
      outputs: [
        {
          internalType: 'uint112',
          name: '_reserve0',
          type: 'uint112',
        },
        {
          internalType: 'uint112',
          name: '_reserve1',
          type: 'uint112',
        },
        {
          internalType: 'uint32',
          name: '_blockTimestampLast',
          type: 'uint32',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: '_token0',
          type: 'address',
        },
        {
          internalType: 'address',
          name: '_token1',
          type: 'address',
        },
      ],
      name: 'initialize',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'kLast',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
      ],
      name: 'mint',
      outputs: [
        {
          internalType: 'uint256',
          name: 'liquidity',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'name',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'nonces',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'deadline',
          type: 'uint256',
        },
        {
          internalType: 'uint8',
          name: 'v',
          type: 'uint8',
        },
        {
          internalType: 'bytes32',
          name: 'r',
          type: 'bytes32',
        },
        {
          internalType: 'bytes32',
          name: 's',
          type: 'bytes32',
        },
      ],
      name: 'permit',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'price0CumulativeLast',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'price1CumulativeLast',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
      ],
      name: 'skim',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'uint256',
          name: 'amount0Out',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'amount1Out',
          type: 'uint256',
        },
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'bytes',
          name: 'data',
          type: 'bytes',
        },
      ],
      name: 'swap',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'symbol',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [],
      name: 'sync',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'token0',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'token1',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'totalSupply',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'transfer',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'transferFrom',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
  bytecode:
    '0x60806040526001600c5534801561001557600080fd5b5060004690506040518080613f6b60529139605201905060405180910390206040518060400160405280600a81526020017f556e697377617020563200000000000000000000000000000000000000000000815250805190602001206040518060400160405280600181526020017f3100000000000000000000000000000000000000000000000000000000000000815250805190602001208330604051602001808681526020018581526020018481526020018381526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200195505050505050604051602081830303815290604052805190602001206003819055505033600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550613df6806101756000396000f3fe608060405234801561001057600080fd5b50600436106101a95760003560e01c80636a627842116100f9578063ba9a7a5611610097578063d21220a711610071578063d21220a7146108c4578063d505accf1461090e578063dd62ed3e146109a7578063fff6cae914610a1f576101a9565b8063ba9a7a5614610818578063bc25cf7714610836578063c45a01551461087a576101a9565b80637ecebe00116100d35780637ecebe001461067857806389afcb44146106d057806395d89b411461072f578063a9059cbb146107b2576101a9565b80636a627842146105aa57806370a08231146106025780637464fc3d1461065a576101a9565b806323b872dd116101665780633644e515116101405780633644e515146104ec578063485cc9551461050a5780635909c0d51461056e5780635a3d54931461058c576101a9565b806323b872dd1461042457806330adf81f146104aa578063313ce567146104c8576101a9565b8063022c0d9f146101ae57806306fdde031461025b5780630902f1ac146102de578063095ea7b3146103565780630dfe1681146103bc57806318160ddd14610406575b600080fd5b610259600480360360808110156101c457600080fd5b810190808035906020019092919080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019064010000000081111561021557600080fd5b82018360208201111561022757600080fd5b8035906020019184600183028401116401000000008311171561024957600080fd5b9091929391929390505050610a29565b005b610263611216565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156102a3578082015181840152602081019050610288565b50505050905090810190601f1680156102d05780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102e661124f565b60405180846dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff168152602001836dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff1681526020018263ffffffff1663ffffffff168152602001935050505060405180910390f35b6103a26004803603604081101561036c57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506112ac565b604051808215151515815260200191505060405180910390f35b6103c46112c3565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61040e6112e9565b6040518082815260200191505060405180910390f35b6104906004803603606081101561043a57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506112ef565b604051808215151515815260200191505060405180910390f35b6104b26114ba565b6040518082815260200191505060405180910390f35b6104d06114e1565b604051808260ff1660ff16815260200191505060405180910390f35b6104f46114e6565b6040518082815260200191505060405180910390f35b61056c6004803603604081101561052057600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506114ec565b005b6105766119c1565b6040518082815260200191505060405180910390f35b6105946119c7565b6040518082815260200191505060405180910390f35b6105ec600480360360208110156105c057600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506119cd565b6040518082815260200191505060405180910390f35b6106446004803603602081101561061857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611e7e565b6040518082815260200191505060405180910390f35b610662611e96565b6040518082815260200191505060405180910390f35b6106ba6004803603602081101561068e57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611e9c565b6040518082815260200191505060405180910390f35b610712600480360360208110156106e657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611eb4565b604051808381526020018281526020019250505060405180910390f35b6107376124a1565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561077757808201518184015260208101905061075c565b50505050905090810190601f1680156107a45780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6107fe600480360360408110156107c857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506124da565b604051808215151515815260200191505060405180910390f35b6108206124f1565b6040518082815260200191505060405180910390f35b6108786004803603602081101561084c57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506124f7565b005b6108826127d2565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6108cc6127f8565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6109a5600480360360e081101561092457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919080359060200190929190803560ff169060200190929190803590602001909291908035906020019092919050505061281e565b005b610a09600480360360408110156109bd57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050612b62565b6040518082815260200191505060405180910390f35b610a27612b87565b005b6001600c5414610aa1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260118152602001807f556e697377617056323a204c4f434b454400000000000000000000000000000081525060200191505060405180910390fd5b6000600c819055506000851180610ab85750600084115b610b0d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526025815260200180613d086025913960400191505060405180910390fd5b600080610b1861124f565b5091509150816dffffffffffffffffffffffffffff1687108015610b4b5750806dffffffffffffffffffffffffffff1686105b610ba0576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180613d516021913960400191505060405180910390fd5b6000806000600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690506000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690508173ffffffffffffffffffffffffffffffffffffffff168973ffffffffffffffffffffffffffffffffffffffff1614158015610c5957508073ffffffffffffffffffffffffffffffffffffffff168973ffffffffffffffffffffffffffffffffffffffff1614155b610ccb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260158152602001807f556e697377617056323a20494e56414c49445f544f000000000000000000000081525060200191505060405180910390fd5b60008b1115610ce057610cdf828a8d612e07565b5b60008a1115610cf557610cf4818a8c612e07565b5b6000888890501115610ddd578873ffffffffffffffffffffffffffffffffffffffff166310d1e85c338d8d8c8c6040518663ffffffff1660e01b8152600401808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001858152602001848152602001806020018281038252848482818152602001925080828437600081840152601f19601f8201169050808301925050509650505050505050600060405180830381600087803b158015610dc457600080fd5b505af1158015610dd8573d6000803e3d6000fd5b505050505b8173ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b158015610e5a57600080fd5b505afa158015610e6e573d6000803e3d6000fd5b505050506040513d6020811015610e8457600080fd5b810190808051906020019092919050505093508073ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b158015610f1457600080fd5b505afa158015610f28573d6000803e3d6000fd5b505050506040513d6020811015610f3e57600080fd5b810190808051906020019092919050505092505050600089856dffffffffffffffffffffffffffff16038311610f75576000610f8b565b89856dffffffffffffffffffffffffffff160383035b9050600089856dffffffffffffffffffffffffffff16038311610faf576000610fc5565b89856dffffffffffffffffffffffffffff160383035b90506000821180610fd65750600081115b61102b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526024815260200180613d2d6024913960400191505060405180910390fd5b600061106761104460038561305490919063ffffffff16565b6110596103e88861305490919063ffffffff16565b6130e990919063ffffffff16565b905060006110a561108260038561305490919063ffffffff16565b6110976103e88861305490919063ffffffff16565b6130e990919063ffffffff16565b90506110ef620f42406110e1896dffffffffffffffffffffffffffff168b6dffffffffffffffffffffffffffff1661305490919063ffffffff16565b61305490919063ffffffff16565b611102828461305490919063ffffffff16565b1015611176576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600c8152602001807f556e697377617056323a204b000000000000000000000000000000000000000081525060200191505060405180910390fd5b50506111848484888861316c565b8873ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d82284848f8f6040518085815260200184815260200183815260200182815260200194505050505060405180910390a35050505050506001600c819055505050505050565b6040518060400160405280600a81526020017f556e69737761702056320000000000000000000000000000000000000000000081525081565b6000806000600860009054906101000a90046dffffffffffffffffffffffffffff1692506008600e9054906101000a90046dffffffffffffffffffffffffffff1691506008601c9054906101000a900463ffffffff169050909192565b60006112b93384846134ea565b6001905092915050565b600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60005481565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054146114a45761142382600260008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546130e990919063ffffffff16565b600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505b6114af8484846135d5565b600190509392505050565b7f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c960001b81565b601281565b60035481565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146115af576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f556e697377617056323a20464f5242494444454e00000000000000000000000081525060200191505060405180910390fd5b81600660006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600760006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061016773ffffffffffffffffffffffffffffffffffffffff1630600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16604051602401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001925050506040516020818303038152906040527f49146bde000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b6020831061178d578051825260208201915060208101905060208303925061176a565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d80600081146117ef576040519150601f19603f3d011682016040523d82523d6000602084013e6117f4565b606091505b50505061016773ffffffffffffffffffffffffffffffffffffffff1630600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16604051602401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001925050506040516020818303038152906040527f49146bde000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b602083106119535780518252602082019150602081019050602083039250611930565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d80600081146119b5576040519150601f19603f3d011682016040523d82523d6000602084013e6119ba565b606091505b5050505050565b60095481565b600a5481565b60006001600c5414611a47576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260118152602001807f556e697377617056323a204c4f434b454400000000000000000000000000000081525060200191505060405180910390fd5b6000600c81905550600080611a5a61124f565b50915091506000600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b158015611b0057600080fd5b505afa158015611b14573d6000803e3d6000fd5b505050506040513d6020811015611b2a57600080fd5b810190808051906020019092919050505090506000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b158015611bde57600080fd5b505afa158015611bf2573d6000803e3d6000fd5b505050506040513d6020811015611c0857600080fd5b810190808051906020019092919050505090506000611c40856dffffffffffffffffffffffffffff16846130e990919063ffffffff16565b90506000611c67856dffffffffffffffffffffffffffff16846130e990919063ffffffff16565b90506000611c758787613769565b90506000805490506000811415611cc957611cb56103e8611ca7611ca2868861305490919063ffffffff16565b61394a565b6130e990919063ffffffff16565b9850611cc460006103e86139ac565b611d2c565b611d29886dffffffffffffffffffffffffffff16611cf0838761305490919063ffffffff16565b81611cf757fe5b04886dffffffffffffffffffffffffffff16611d1c848761305490919063ffffffff16565b81611d2357fe5b04613ac6565b98505b60008911611d85576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526028815260200180613d9a6028913960400191505060405180910390fd5b611d8f8a8a6139ac565b611d9b86868a8a61316c565b8115611e1357611e0c6008600e9054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff16600860009054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff1661305490919063ffffffff16565b600b819055505b3373ffffffffffffffffffffffffffffffffffffffff167f4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f8585604051808381526020018281526020019250505060405180910390a250505050505050506001600c81905550919050565b60016020528060005260406000206000915090505481565b600b5481565b60046020528060005260406000206000915090505481565b6000806001600c5414611f2f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260118152602001807f556e697377617056323a204c4f434b454400000000000000000000000000000081525060200191505060405180910390fd5b6000600c81905550600080611f4261124f565b50915091506000600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690506000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905060008273ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b15801561201457600080fd5b505afa158015612028573d6000803e3d6000fd5b505050506040513d602081101561203e57600080fd5b8101908080519060200190929190505050905060008273ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b1580156120d057600080fd5b505afa1580156120e4573d6000803e3d6000fd5b505050506040513d60208110156120fa57600080fd5b810190808051906020019092919050505090506000600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050600061215d8888613769565b905060008054905080612179868561305490919063ffffffff16565b8161218057fe5b049a5080612197858561305490919063ffffffff16565b8161219e57fe5b04995060008b1180156121b1575060008a115b612206576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526028815260200180613d726028913960400191505060405180910390fd5b6122103084613adf565b61221b878d8d612e07565b612226868d8c612e07565b8673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b1580156122a357600080fd5b505afa1580156122b7573d6000803e3d6000fd5b505050506040513d60208110156122cd57600080fd5b810190808051906020019092919050505094508573ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b15801561235d57600080fd5b505afa158015612371573d6000803e3d6000fd5b505050506040513d602081101561238757600080fd5b810190808051906020019092919050505093506123a685858b8b61316c565b811561241e576124176008600e9054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff16600860009054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff1661305490919063ffffffff16565b600b819055505b8b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d819364968d8d604051808381526020018281526020019250505060405180910390a35050505050505050506001600c81905550915091565b6040518060400160405280600681526020017f554e492d5632000000000000000000000000000000000000000000000000000081525081565b60006124e73384846135d5565b6001905092915050565b6103e881565b6001600c541461256f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260118152602001807f556e697377617056323a204c4f434b454400000000000000000000000000000081525060200191505060405180910390fd5b6000600c819055506000600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690506000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690506126c582846126c0600860009054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b15801561267757600080fd5b505afa15801561268b573d6000803e3d6000fd5b505050506040513d60208110156126a157600080fd5b81019080805190602001909291905050506130e990919063ffffffff16565b612e07565b6127c581846127c06008600e9054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b15801561277757600080fd5b505afa15801561278b573d6000803e3d6000fd5b505050506040513d60208110156127a157600080fd5b81019080805190602001909291905050506130e990919063ffffffff16565b612e07565b50506001600c8190555050565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b42841015612894576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f556e697377617056323a2045585049524544000000000000000000000000000081525060200191505060405180910390fd5b60006003547f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c960001b898989600460008e73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000815480929190600101919050558a604051602001808781526020018673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200184815260200183815260200182815260200196505050505050506040516020818303038152906040528051906020012060405160200180807f190100000000000000000000000000000000000000000000000000000000000081525060020183815260200182815260200192505050604051602081830303815290604052805190602001209050600060018286868660405160008152602001604052604051808581526020018460ff1660ff1681526020018381526020018281526020019450505050506020604051602081039080840390855afa158015612a66573d6000803e3d6000fd5b505050602060405103519050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614158015612ada57508873ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16145b612b4c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601c8152602001807f556e697377617056323a20494e56414c49445f5349474e41545552450000000081525060200191505060405180910390fd5b612b578989896134ea565b505050505050505050565b6002602052816000526040600020602052806000526040600020600091509150505481565b6001600c5414612bff576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260118152602001807f556e697377617056323a204c4f434b454400000000000000000000000000000081525060200191505060405180910390fd5b6000600c81905550612dfd600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b158015612ca957600080fd5b505afa158015612cbd573d6000803e3d6000fd5b505050506040513d6020811015612cd357600080fd5b8101908080519060200190929190505050600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b158015612d8357600080fd5b505afa158015612d97573d6000803e3d6000fd5b505050506040513d6020811015612dad57600080fd5b8101908080519060200190929190505050600860009054906101000a90046dffffffffffffffffffffffffffff166008600e9054906101000a90046dffffffffffffffffffffffffffff1661316c565b6001600c81905550565b600060608473ffffffffffffffffffffffffffffffffffffffff166040518060400160405280601981526020017f7472616e7366657228616464726573732c75696e743235362900000000000000815250805190602001208585604051602401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b60208310612f345780518252602082019150602081019050602083039250612f11565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d8060008114612f96576040519150601f19603f3d011682016040523d82523d6000602084013e612f9b565b606091505b5091509150818015612fdb5750600081511480612fda5750808060200190516020811015612fc857600080fd5b81019080805190602001909291905050505b5b61304d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601a8152602001807f556e697377617056323a205452414e534645525f4641494c454400000000000081525060200191505060405180910390fd5b5050505050565b600080821480613071575082828385029250828161306e57fe5b04145b6130e3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f64732d6d6174682d6d756c2d6f766572666c6f7700000000000000000000000081525060200191505060405180910390fd5b92915050565b6000828284039150811115613166576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260158152602001807f64732d6d6174682d7375622d756e646572666c6f77000000000000000000000081525060200191505060405180910390fd5b92915050565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6dffffffffffffffffffffffffffff1684111580156131dc57507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6dffffffffffffffffffffffffffff168311155b61324e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260138152602001807f556e697377617056323a204f564552464c4f570000000000000000000000000081525060200191505060405180910390fd5b6000640100000000428161325e57fe5b06905060006008601c9054906101000a900463ffffffff168203905060008163ffffffff161180156132a157506000846dffffffffffffffffffffffffffff1614155b80156132be57506000836dffffffffffffffffffffffffffff1614155b156133a0578063ffffffff16613303856132d786613bf9565b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff16613c2490919063ffffffff16565b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff16026009600082825401925050819055508063ffffffff166133718461334587613bf9565b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff16613c2490919063ffffffff16565b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1602600a600082825401925050819055505b85600860006101000a8154816dffffffffffffffffffffffffffff02191690836dffffffffffffffffffffffffffff160217905550846008600e6101000a8154816dffffffffffffffffffffffffffff02191690836dffffffffffffffffffffffffffff160217905550816008601c6101000a81548163ffffffff021916908363ffffffff1602179055507f1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1600860009054906101000a90046dffffffffffffffffffffffffffff166008600e9054906101000a90046dffffffffffffffffffffffffffff1660405180836dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff168152602001826dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff1681526020019250505060405180910390a1505050505050565b80600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040518082815260200191505060405180910390a3505050565b61362781600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546130e990919063ffffffff16565b600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055506136bc81600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054613c8490919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a3505050565b600080600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663017e7e586040518163ffffffff1660e01b815260040160206040518083038186803b1580156137d457600080fd5b505afa1580156137e8573d6000803e3d6000fd5b505050506040513d60208110156137fe57600080fd5b81019080805190602001909291905050509050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16141591506000600b5490508215613930576000811461392b576000613896613891866dffffffffffffffffffffffffffff16886dffffffffffffffffffffffffffff1661305490919063ffffffff16565b61394a565b905060006138a38361394a565b9050808211156139285760006138d66138c583856130e990919063ffffffff16565b60005461305490919063ffffffff16565b90506000613900836138f260058761305490919063ffffffff16565b613c8490919063ffffffff16565b9050600081838161390d57fe5b04905060008111156139245761392387826139ac565b5b5050505b50505b613942565b60008114613941576000600b819055505b5b505092915050565b6000600382111561399957819050600060016002848161396657fe5b040190505b818110156139935780915060028182858161398257fe5b04018161398b57fe5b04905061396b565b506139a7565b600082146139a657600190505b5b919050565b6139c181600054613c8490919063ffffffff16565b600081905550613a1981600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054613c8490919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b6000818310613ad55781613ad7565b825b905092915050565b613b3181600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546130e990919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550613b89816000546130e990919063ffffffff16565b600081905550600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b60006e010000000000000000000000000000826dffffffffffffffffffffffffffff16029050919050565b6000816dffffffffffffffffffffffffffff167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff16837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1681613c7b57fe5b04905092915050565b6000828284019150811015613d01576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f64732d6d6174682d6164642d6f766572666c6f7700000000000000000000000081525060200191505060405180910390fd5b9291505056fe556e697377617056323a20494e53554646494349454e545f4f55545055545f414d4f554e54556e697377617056323a20494e53554646494349454e545f494e5055545f414d4f554e54556e697377617056323a20494e53554646494349454e545f4c4951554944495459556e697377617056323a20494e53554646494349454e545f4c49515549444954595f4255524e4544556e697377617056323a20494e53554646494349454e545f4c49515549444954595f4d494e544544a265627a7a723158202bc620c9cc3b9963f45510afd96c2ed422863b62124b1f3c9d6c3b52002bb1bf64736f6c63430005100032454950373132446f6d61696e28737472696e67206e616d652c737472696e672076657273696f6e2c75696e7432353620636861696e49642c6164647265737320766572696679696e67436f6e747261637429',
  deployedBytecode:
    '0x608060405234801561001057600080fd5b50600436106101a95760003560e01c80636a627842116100f9578063ba9a7a5611610097578063d21220a711610071578063d21220a7146108c4578063d505accf1461090e578063dd62ed3e146109a7578063fff6cae914610a1f576101a9565b8063ba9a7a5614610818578063bc25cf7714610836578063c45a01551461087a576101a9565b80637ecebe00116100d35780637ecebe001461067857806389afcb44146106d057806395d89b411461072f578063a9059cbb146107b2576101a9565b80636a627842146105aa57806370a08231146106025780637464fc3d1461065a576101a9565b806323b872dd116101665780633644e515116101405780633644e515146104ec578063485cc9551461050a5780635909c0d51461056e5780635a3d54931461058c576101a9565b806323b872dd1461042457806330adf81f146104aa578063313ce567146104c8576101a9565b8063022c0d9f146101ae57806306fdde031461025b5780630902f1ac146102de578063095ea7b3146103565780630dfe1681146103bc57806318160ddd14610406575b600080fd5b610259600480360360808110156101c457600080fd5b810190808035906020019092919080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019064010000000081111561021557600080fd5b82018360208201111561022757600080fd5b8035906020019184600183028401116401000000008311171561024957600080fd5b9091929391929390505050610a29565b005b610263611216565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156102a3578082015181840152602081019050610288565b50505050905090810190601f1680156102d05780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102e661124f565b60405180846dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff168152602001836dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff1681526020018263ffffffff1663ffffffff168152602001935050505060405180910390f35b6103a26004803603604081101561036c57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506112ac565b604051808215151515815260200191505060405180910390f35b6103c46112c3565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61040e6112e9565b6040518082815260200191505060405180910390f35b6104906004803603606081101561043a57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506112ef565b604051808215151515815260200191505060405180910390f35b6104b26114ba565b6040518082815260200191505060405180910390f35b6104d06114e1565b604051808260ff1660ff16815260200191505060405180910390f35b6104f46114e6565b6040518082815260200191505060405180910390f35b61056c6004803603604081101561052057600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506114ec565b005b6105766119c1565b6040518082815260200191505060405180910390f35b6105946119c7565b6040518082815260200191505060405180910390f35b6105ec600480360360208110156105c057600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506119cd565b6040518082815260200191505060405180910390f35b6106446004803603602081101561061857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611e7e565b6040518082815260200191505060405180910390f35b610662611e96565b6040518082815260200191505060405180910390f35b6106ba6004803603602081101561068e57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611e9c565b6040518082815260200191505060405180910390f35b610712600480360360208110156106e657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611eb4565b604051808381526020018281526020019250505060405180910390f35b6107376124a1565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561077757808201518184015260208101905061075c565b50505050905090810190601f1680156107a45780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6107fe600480360360408110156107c857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506124da565b604051808215151515815260200191505060405180910390f35b6108206124f1565b6040518082815260200191505060405180910390f35b6108786004803603602081101561084c57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506124f7565b005b6108826127d2565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6108cc6127f8565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6109a5600480360360e081101561092457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919080359060200190929190803560ff169060200190929190803590602001909291908035906020019092919050505061281e565b005b610a09600480360360408110156109bd57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050612b62565b6040518082815260200191505060405180910390f35b610a27612b87565b005b6001600c5414610aa1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260118152602001807f556e697377617056323a204c4f434b454400000000000000000000000000000081525060200191505060405180910390fd5b6000600c819055506000851180610ab85750600084115b610b0d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526025815260200180613d086025913960400191505060405180910390fd5b600080610b1861124f565b5091509150816dffffffffffffffffffffffffffff1687108015610b4b5750806dffffffffffffffffffffffffffff1686105b610ba0576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180613d516021913960400191505060405180910390fd5b6000806000600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690506000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690508173ffffffffffffffffffffffffffffffffffffffff168973ffffffffffffffffffffffffffffffffffffffff1614158015610c5957508073ffffffffffffffffffffffffffffffffffffffff168973ffffffffffffffffffffffffffffffffffffffff1614155b610ccb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260158152602001807f556e697377617056323a20494e56414c49445f544f000000000000000000000081525060200191505060405180910390fd5b60008b1115610ce057610cdf828a8d612e07565b5b60008a1115610cf557610cf4818a8c612e07565b5b6000888890501115610ddd578873ffffffffffffffffffffffffffffffffffffffff166310d1e85c338d8d8c8c6040518663ffffffff1660e01b8152600401808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001858152602001848152602001806020018281038252848482818152602001925080828437600081840152601f19601f8201169050808301925050509650505050505050600060405180830381600087803b158015610dc457600080fd5b505af1158015610dd8573d6000803e3d6000fd5b505050505b8173ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b158015610e5a57600080fd5b505afa158015610e6e573d6000803e3d6000fd5b505050506040513d6020811015610e8457600080fd5b810190808051906020019092919050505093508073ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b158015610f1457600080fd5b505afa158015610f28573d6000803e3d6000fd5b505050506040513d6020811015610f3e57600080fd5b810190808051906020019092919050505092505050600089856dffffffffffffffffffffffffffff16038311610f75576000610f8b565b89856dffffffffffffffffffffffffffff160383035b9050600089856dffffffffffffffffffffffffffff16038311610faf576000610fc5565b89856dffffffffffffffffffffffffffff160383035b90506000821180610fd65750600081115b61102b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526024815260200180613d2d6024913960400191505060405180910390fd5b600061106761104460038561305490919063ffffffff16565b6110596103e88861305490919063ffffffff16565b6130e990919063ffffffff16565b905060006110a561108260038561305490919063ffffffff16565b6110976103e88861305490919063ffffffff16565b6130e990919063ffffffff16565b90506110ef620f42406110e1896dffffffffffffffffffffffffffff168b6dffffffffffffffffffffffffffff1661305490919063ffffffff16565b61305490919063ffffffff16565b611102828461305490919063ffffffff16565b1015611176576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252600c8152602001807f556e697377617056323a204b000000000000000000000000000000000000000081525060200191505060405180910390fd5b50506111848484888861316c565b8873ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d82284848f8f6040518085815260200184815260200183815260200182815260200194505050505060405180910390a35050505050506001600c819055505050505050565b6040518060400160405280600a81526020017f556e69737761702056320000000000000000000000000000000000000000000081525081565b6000806000600860009054906101000a90046dffffffffffffffffffffffffffff1692506008600e9054906101000a90046dffffffffffffffffffffffffffff1691506008601c9054906101000a900463ffffffff169050909192565b60006112b93384846134ea565b6001905092915050565b600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60005481565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054146114a45761142382600260008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546130e990919063ffffffff16565b600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505b6114af8484846135d5565b600190509392505050565b7f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c960001b81565b601281565b60035481565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146115af576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f556e697377617056323a20464f5242494444454e00000000000000000000000081525060200191505060405180910390fd5b81600660006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600760006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061016773ffffffffffffffffffffffffffffffffffffffff1630600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16604051602401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001925050506040516020818303038152906040527f49146bde000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b6020831061178d578051825260208201915060208101905060208303925061176a565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d80600081146117ef576040519150601f19603f3d011682016040523d82523d6000602084013e6117f4565b606091505b50505061016773ffffffffffffffffffffffffffffffffffffffff1630600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16604051602401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001925050506040516020818303038152906040527f49146bde000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b602083106119535780518252602082019150602081019050602083039250611930565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d80600081146119b5576040519150601f19603f3d011682016040523d82523d6000602084013e6119ba565b606091505b5050505050565b60095481565b600a5481565b60006001600c5414611a47576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260118152602001807f556e697377617056323a204c4f434b454400000000000000000000000000000081525060200191505060405180910390fd5b6000600c81905550600080611a5a61124f565b50915091506000600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b158015611b0057600080fd5b505afa158015611b14573d6000803e3d6000fd5b505050506040513d6020811015611b2a57600080fd5b810190808051906020019092919050505090506000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b158015611bde57600080fd5b505afa158015611bf2573d6000803e3d6000fd5b505050506040513d6020811015611c0857600080fd5b810190808051906020019092919050505090506000611c40856dffffffffffffffffffffffffffff16846130e990919063ffffffff16565b90506000611c67856dffffffffffffffffffffffffffff16846130e990919063ffffffff16565b90506000611c758787613769565b90506000805490506000811415611cc957611cb56103e8611ca7611ca2868861305490919063ffffffff16565b61394a565b6130e990919063ffffffff16565b9850611cc460006103e86139ac565b611d2c565b611d29886dffffffffffffffffffffffffffff16611cf0838761305490919063ffffffff16565b81611cf757fe5b04886dffffffffffffffffffffffffffff16611d1c848761305490919063ffffffff16565b81611d2357fe5b04613ac6565b98505b60008911611d85576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526028815260200180613d9a6028913960400191505060405180910390fd5b611d8f8a8a6139ac565b611d9b86868a8a61316c565b8115611e1357611e0c6008600e9054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff16600860009054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff1661305490919063ffffffff16565b600b819055505b3373ffffffffffffffffffffffffffffffffffffffff167f4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f8585604051808381526020018281526020019250505060405180910390a250505050505050506001600c81905550919050565b60016020528060005260406000206000915090505481565b600b5481565b60046020528060005260406000206000915090505481565b6000806001600c5414611f2f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260118152602001807f556e697377617056323a204c4f434b454400000000000000000000000000000081525060200191505060405180910390fd5b6000600c81905550600080611f4261124f565b50915091506000600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690506000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905060008273ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b15801561201457600080fd5b505afa158015612028573d6000803e3d6000fd5b505050506040513d602081101561203e57600080fd5b8101908080519060200190929190505050905060008273ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b1580156120d057600080fd5b505afa1580156120e4573d6000803e3d6000fd5b505050506040513d60208110156120fa57600080fd5b810190808051906020019092919050505090506000600160003073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050600061215d8888613769565b905060008054905080612179868561305490919063ffffffff16565b8161218057fe5b049a5080612197858561305490919063ffffffff16565b8161219e57fe5b04995060008b1180156121b1575060008a115b612206576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526028815260200180613d726028913960400191505060405180910390fd5b6122103084613adf565b61221b878d8d612e07565b612226868d8c612e07565b8673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b1580156122a357600080fd5b505afa1580156122b7573d6000803e3d6000fd5b505050506040513d60208110156122cd57600080fd5b810190808051906020019092919050505094508573ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b15801561235d57600080fd5b505afa158015612371573d6000803e3d6000fd5b505050506040513d602081101561238757600080fd5b810190808051906020019092919050505093506123a685858b8b61316c565b811561241e576124176008600e9054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff16600860009054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff1661305490919063ffffffff16565b600b819055505b8b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d819364968d8d604051808381526020018281526020019250505060405180910390a35050505050505050506001600c81905550915091565b6040518060400160405280600681526020017f554e492d5632000000000000000000000000000000000000000000000000000081525081565b60006124e73384846135d5565b6001905092915050565b6103e881565b6001600c541461256f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260118152602001807f556e697377617056323a204c4f434b454400000000000000000000000000000081525060200191505060405180910390fd5b6000600c819055506000600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690506000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690506126c582846126c0600860009054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b15801561267757600080fd5b505afa15801561268b573d6000803e3d6000fd5b505050506040513d60208110156126a157600080fd5b81019080805190602001909291905050506130e990919063ffffffff16565b612e07565b6127c581846127c06008600e9054906101000a90046dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b15801561277757600080fd5b505afa15801561278b573d6000803e3d6000fd5b505050506040513d60208110156127a157600080fd5b81019080805190602001909291905050506130e990919063ffffffff16565b612e07565b50506001600c8190555050565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b42841015612894576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f556e697377617056323a2045585049524544000000000000000000000000000081525060200191505060405180910390fd5b60006003547f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c960001b898989600460008e73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000815480929190600101919050558a604051602001808781526020018673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200184815260200183815260200182815260200196505050505050506040516020818303038152906040528051906020012060405160200180807f190100000000000000000000000000000000000000000000000000000000000081525060020183815260200182815260200192505050604051602081830303815290604052805190602001209050600060018286868660405160008152602001604052604051808581526020018460ff1660ff1681526020018381526020018281526020019450505050506020604051602081039080840390855afa158015612a66573d6000803e3d6000fd5b505050602060405103519050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614158015612ada57508873ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16145b612b4c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601c8152602001807f556e697377617056323a20494e56414c49445f5349474e41545552450000000081525060200191505060405180910390fd5b612b578989896134ea565b505050505050505050565b6002602052816000526040600020602052806000526040600020600091509150505481565b6001600c5414612bff576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260118152602001807f556e697377617056323a204c4f434b454400000000000000000000000000000081525060200191505060405180910390fd5b6000600c81905550612dfd600660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b158015612ca957600080fd5b505afa158015612cbd573d6000803e3d6000fd5b505050506040513d6020811015612cd357600080fd5b8101908080519060200190929190505050600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b158015612d8357600080fd5b505afa158015612d97573d6000803e3d6000fd5b505050506040513d6020811015612dad57600080fd5b8101908080519060200190929190505050600860009054906101000a90046dffffffffffffffffffffffffffff166008600e9054906101000a90046dffffffffffffffffffffffffffff1661316c565b6001600c81905550565b600060608473ffffffffffffffffffffffffffffffffffffffff166040518060400160405280601981526020017f7472616e7366657228616464726573732c75696e743235362900000000000000815250805190602001208585604051602401808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200182815260200192505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b60208310612f345780518252602082019150602081019050602083039250612f11565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d8060008114612f96576040519150601f19603f3d011682016040523d82523d6000602084013e612f9b565b606091505b5091509150818015612fdb5750600081511480612fda5750808060200190516020811015612fc857600080fd5b81019080805190602001909291905050505b5b61304d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601a8152602001807f556e697377617056323a205452414e534645525f4641494c454400000000000081525060200191505060405180910390fd5b5050505050565b600080821480613071575082828385029250828161306e57fe5b04145b6130e3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f64732d6d6174682d6d756c2d6f766572666c6f7700000000000000000000000081525060200191505060405180910390fd5b92915050565b6000828284039150811115613166576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260158152602001807f64732d6d6174682d7375622d756e646572666c6f77000000000000000000000081525060200191505060405180910390fd5b92915050565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6dffffffffffffffffffffffffffff1684111580156131dc57507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff6dffffffffffffffffffffffffffff168311155b61324e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260138152602001807f556e697377617056323a204f564552464c4f570000000000000000000000000081525060200191505060405180910390fd5b6000640100000000428161325e57fe5b06905060006008601c9054906101000a900463ffffffff168203905060008163ffffffff161180156132a157506000846dffffffffffffffffffffffffffff1614155b80156132be57506000836dffffffffffffffffffffffffffff1614155b156133a0578063ffffffff16613303856132d786613bf9565b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff16613c2490919063ffffffff16565b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff16026009600082825401925050819055508063ffffffff166133718461334587613bf9565b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff16613c2490919063ffffffff16565b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1602600a600082825401925050819055505b85600860006101000a8154816dffffffffffffffffffffffffffff02191690836dffffffffffffffffffffffffffff160217905550846008600e6101000a8154816dffffffffffffffffffffffffffff02191690836dffffffffffffffffffffffffffff160217905550816008601c6101000a81548163ffffffff021916908363ffffffff1602179055507f1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1600860009054906101000a90046dffffffffffffffffffffffffffff166008600e9054906101000a90046dffffffffffffffffffffffffffff1660405180836dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff168152602001826dffffffffffffffffffffffffffff166dffffffffffffffffffffffffffff1681526020019250505060405180910390a1505050505050565b80600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040518082815260200191505060405180910390a3505050565b61362781600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546130e990919063ffffffff16565b600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055506136bc81600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054613c8490919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a3505050565b600080600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663017e7e586040518163ffffffff1660e01b815260040160206040518083038186803b1580156137d457600080fd5b505afa1580156137e8573d6000803e3d6000fd5b505050506040513d60208110156137fe57600080fd5b81019080805190602001909291905050509050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16141591506000600b5490508215613930576000811461392b576000613896613891866dffffffffffffffffffffffffffff16886dffffffffffffffffffffffffffff1661305490919063ffffffff16565b61394a565b905060006138a38361394a565b9050808211156139285760006138d66138c583856130e990919063ffffffff16565b60005461305490919063ffffffff16565b90506000613900836138f260058761305490919063ffffffff16565b613c8490919063ffffffff16565b9050600081838161390d57fe5b04905060008111156139245761392387826139ac565b5b5050505b50505b613942565b60008114613941576000600b819055505b5b505092915050565b6000600382111561399957819050600060016002848161396657fe5b040190505b818110156139935780915060028182858161398257fe5b04018161398b57fe5b04905061396b565b506139a7565b600082146139a657600190505b5b919050565b6139c181600054613c8490919063ffffffff16565b600081905550613a1981600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054613c8490919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b6000818310613ad55781613ad7565b825b905092915050565b613b3181600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546130e990919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550613b89816000546130e990919063ffffffff16565b600081905550600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b60006e010000000000000000000000000000826dffffffffffffffffffffffffffff16029050919050565b6000816dffffffffffffffffffffffffffff167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff16837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1681613c7b57fe5b04905092915050565b6000828284019150811015613d01576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f64732d6d6174682d6164642d6f766572666c6f7700000000000000000000000081525060200191505060405180910390fd5b9291505056fe556e697377617056323a20494e53554646494349454e545f4f55545055545f414d4f554e54556e697377617056323a20494e53554646494349454e545f494e5055545f414d4f554e54556e697377617056323a20494e53554646494349454e545f4c4951554944495459556e697377617056323a20494e53554646494349454e545f4c49515549444954595f4255524e4544556e697377617056323a20494e53554646494349454e545f4c49515549444954595f4d494e544544a265627a7a723158202bc620c9cc3b9963f45510afd96c2ed422863b62124b1f3c9d6c3b52002bb1bf64736f6c63430005100032',
  linkReferences: {},
  deployedLinkReferences: {},
};

export default PairV2;
