import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'
import { Velo } from 'velo-sdk/lib'

import {
  injected,
  network,
  walletconnect
} from './connectors'

export interface VeloContext {
  velo?: any
}

export const Context = createContext<VeloContext>({
  velo: undefined,
})

declare global {
  interface Window {
    velosauce: any
  }
}

const VeloProvider: React.FC = ({ children }) => {
  const { ethereum } = useWallet()
  const [velo, setVelo] = useState<any>()

  // const provider = ethereum;
  useEffect(() => {
    // const provider = ethereum;
    const provider = ethereum || 'https://mainnet.infura.io/v3/e508c065786d4624a93f30b6e5c4bbee';
    if (provider) {
      const veloLib = new Velo(
        provider,
        "1",
        false, {
          defaultAccount: "",
          defaultConfirmations: 1,
          autoGasMultiplier: 1.5,
          testing: false,
          defaultGas: "6000000",
          defaultGasPrice: "1000000000000",
          accounts: [],
          ethereumNodeTimeout: 10000
        }
      )

      setVelo(veloLib)
      window.velosauce = veloLib
    }
  }, [ethereum])

  return (
    <Context.Provider value={{ velo }}>
      {children}
    </Context.Provider>
  )
}

export default VeloProvider
