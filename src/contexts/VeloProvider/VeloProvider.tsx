import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'
import { Velo } from 'velo-sdk/lib'

import config from 'config';

export interface VeloContext {
  velo?: any,
  walletStatus?: string
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
  const { ethereum, status } = useWallet()

  const [velo, setVelo] = useState<any>()
  const [walletStatus, setWalletStatus] = useState<string>()

  useEffect(() => {
    if(status) {
      setWalletStatus(status);
    }
  }, [status])

  useEffect(() => {
    let provider, randomBetween1And10 = Math.floor((Math.random() * 10) + 1);
    if(true || randomBetween1And10 > 5) {//6 7 8 9 10
      provider = ethereum || config.rpcUrl;
    } else {
      provider = ethereum;
    }
    // const provider = ethereum || 'https://mainnet.infura.io/v3/e508c065786d4624a93f30b6e5c4bbee';
    // const provider = ethereum || 'https://eth-kovan.alchemyapi.io/v2/HGgrm9x6IQ9fI4oa48gzP-YSNmyVqaRL';
    // const provider = ethereum || 'https://eth-mainnet.alchemyapi.io/v2/t972NXo6MXqBNTxF3VGrBpvwlx9_roXk';
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
    <Context.Provider value={{
      velo,
      walletStatus
    }}>
      {children}
    </Context.Provider>
  )
}

export default VeloProvider
