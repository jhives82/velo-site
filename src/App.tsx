import React, { useMemo } from 'react'
import { createTheme, ThemeProvider } from 'react-neu'
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'
import { UseWalletProvider } from 'use-wallet'
import config from './config';

import { BalancesProvider } from 'contexts/Balances'
import { FarmingProvider } from 'contexts/Farming'
import VeloProvider from 'contexts/VeloProvider'

import useLocalStorage from 'hooks/useLocalStorage'

import Landing from 'views/Landing'
import LandingMisesLegacy from 'views/LandingMisesLegacy'
import AppFooter from 'components/AppFooter/AppFooter'

import './App.css'

const App: React.FC = () => {
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
              <LandingMisesLegacy />
            </Route>
            <Route exact path="/closed">
              <Landing />
            </Route>
          </Switch>
          <AppFooter />
        </div>
      </Providers>
    </Router>
  )
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

  return (
    <ThemeProvider
      darkModeEnabled={darkModeSetting}
      darkTheme={darkTheme}
      lightTheme={lightTheme}
    >
      <UseWalletProvider
        chainId={config.chainId}
        connectors={{
          walletconnect: {
            rpcUrl: config.rpcUrl
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
