import {
	getDefaultProvider,
	getNetwork,
	EtherscanProvider,
	InfuraProvider,
	AlchemyProvider
} from '@ethersproject/providers'

const providers = [
	{
		rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/t972NXo6MXqBNTxF3VGrBpvwlx9_roXk',
		ethereumProvider: new AlchemyProvider('homestead', 't972NXo6MXqBNTxF3VGrBpvwlx9_roXk')
	},
	{
		rpcUrl: 'https://mainnet.infura.io/v3/e508c065786d4624a93f30b6e5c4bbee',
		ethereumProvider: new InfuraProvider('homestead', 'e508c065786d4624a93f30b6e5c4bbee')
	}	
]
const randomProvider = providers[Math.floor((Math.random() * providers.length))];

let _env = 'prod';
let config: any = {};

if(_env == 'dev') {
	config = {
		_env: 'dev',
		chainId: 42,
		rpcUrl: 'https://kovan.infura.io/v3/e508c065786d4624a93f30b6e5c4bbee',
		ethereumProvider: new AlchemyProvider('kovan', 't972NXo6MXqBNTxF3VGrBpvwlx9_roXk')
	}
} else {
	config = {
		_env: 'prod',
		chainId: 1,
		rpcUrl: randomProvider.rpcUrl,
		ethereumProvider: randomProvider.ethereumProvider,
		activePools: [
	      'dai_pool',
	      'ycrv_pool',
	      'velo_eth_uni_pool',
	      'velo_eth_blp_pool',
	      // Farm coins stage 2 (Double Return Pools)
	      'velo_eth_dai_pool',
	      'velo_eth_usdc_pool',
	      'velo_eth_usd_pool',
	      'velo_eth_wbtc_pool',
	    ],
		uniPoolTokens: [
	      'velo_eth_uni',
	      // Farm coins stage 2 (Double Return Pools)
	      'velo_eth_dai',
	      'velo_eth_usdc',
	      'velo_eth_usd',
	      'velo_eth_wbtc',
	    ]
	}
}

export default config;
