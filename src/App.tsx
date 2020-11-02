import React, { useCallback, useMemo, useState } from 'react'
import { Web3ReactProvider, useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import { createTheme, ThemeProvider } from 'react-neu'
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'
import { UseWalletProvider } from 'use-wallet'

import { BalancesProvider } from 'contexts/Balances'
import { FarmingProvider } from 'contexts/Farming'
import VeloProvider from 'contexts/VeloProvider'
import { Web3Provider } from '@ethersproject/providers'

import { NetworkConnector } from '@web3-react/network-connector'

import useLocalStorage from 'hooks/useLocalStorage'

import Farm from 'views/Farm'
import FAQ from 'views/FAQ'
import Stats from 'views/Home/components/Stats'
import Rebase from 'views/Home/components/Rebase'
import Landing from 'views/Landing'
import WalletButton from 'components/TopBar/components/WalletButton'
import AppFooter from 'components/AppFooter/AppFooter'

import './App.css'

const App: React.FC = () => {
  const [mobileMenu, setMobileMenu] = useState(false)

  const handleDismissMobileMenu = useCallback(() => {
    setMobileMenu(false)
  }, [setMobileMenu])
  
  const handlePresentMobileMenu = useCallback(() => {
    setMobileMenu(true)
  }, [setMobileMenu])

  return (
    <Router>
      <Providers>
        <div className={`App-bg`} />
        <div className="App-stars-wrapper">
          <div id='stars'></div>
          <div id='stars2'></div>
          <div id='stars3'></div>
        </div>
        <div style={{
          position: 'relative',
          minHeight: '100%',
          background: 'rgba(0,0,0,0.5)'
        }}>
          <Switch>
            <Route exact path="/">
              <Landing />
            </Route>
          </Switch>
          <AppFooter />
        </div>
      </Providers>
    </Router>
  )
}

const getWalletProviderConfig = () => {
  // Find chainIDs at
  // https://github.com/aragon/use-wallet/blob/master/src/utils.js#L1
  let chainId: number, rpcUrl: string;
  if(true) {
    chainId = 1;
    rpcUrl = 'https://mainnet.infura.io/v3/e508c065786d4624a93f30b6e5c4bbee';
  }

  else if(false) {
    chainId = 5;
    rpcUrl = 'https://rpc.slock.it/goerli/';
  }

  else if(false) {
    chainId = 1337;//Local
    rpcUrl = 'http://localhost:7545';
  }

  // Kovan
  else {
    chainId = 42;
    rpcUrl = 'https://kovan.infura.io/v3/e508c065786d4624a93f30b6e5c4bbee';
  }

  return {
    chainId: chainId,
    rpcUrl: rpcUrl
  }
}

const Providers: React.FC = ({ children }) => {
  const [darkModeSetting] = useLocalStorage('darkMode', false)
  const { dark: darkTheme, light: lightTheme } = useMemo(() => {
    return createTheme({
      baseColor: { h: 338, s: 100, l: 41 },
      baseColorDark: { h: 339, s: 89, l: 49 },
      borderRadius: 28,
    })
  }, [])
  const walletProviderConfig = getWalletProviderConfig()

  return (
    <ThemeProvider
      darkModeEnabled={darkModeSetting}
      darkTheme={darkTheme}
      lightTheme={lightTheme}
    >
      <UseWalletProvider
        chainId={walletProviderConfig.chainId}
        connectors={{
          walletconnect: {
            rpcUrl: walletProviderConfig.rpcUrl
          }
        }}
      >
        <VeloProvider>
          <BalancesProvider>
            <FarmingProvider>
              {children}
            </FarmingProvider>
          </BalancesProvider>
        </VeloProvider>
      </UseWalletProvider>
    </ThemeProvider>
  )
}

export default App
