import {
	getDefaultProvider,
	getNetwork,
	EtherscanProvider,
	InfuraProvider,
	AlchemyProvider
} from '@ethersproject/providers'

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
		// rpcUrl: null,
		rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/t972NXo6MXqBNTxF3VGrBpvwlx9_roXk',
		// rpcUrl: 'https://mainnet.infura.io/v3/e508c065786d4624a93f30b6e5c4bbee',
		ethereumProvider: new AlchemyProvider('homestead', 't972NXo6MXqBNTxF3VGrBpvwlx9_roXk')
		// ethereumProvider: new InfuraProvider('homestead', 'e508c065786d4624a93f30b6e5c4bbee')
	}
}

export default config;
