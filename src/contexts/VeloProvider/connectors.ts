// Get providers
// see https://github.com/NoahZinsmeister/web3-react#quickstart for docs
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

const RPC_URLS: { [chainId: number]: string } = {
  1: 'https://mainnet.infura.io/v3/e508c065786d4624a93f30b6e5c4bbee',
  4: 'https://kovan.infura.io/v3/e508c065786d4624a93f30b6e5c4bbee',
  42: 'https://kovan.infura.io/v3/e508c065786d4624a93f30b6e5c4bbee'
}

export const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] })

export const network = new NetworkConnector({
  urls: { 1: RPC_URLS[1], 4: RPC_URLS[4], 42: RPC_URLS[42] },
  defaultChainId: 1
})

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1] },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true
})
