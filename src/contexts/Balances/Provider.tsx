import React, { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import {
  pump as pumpAddress,
  velo as veloAddress,
  dai as daiAddress,
  ycrv as ycrvAddress,
  addresses
} from 'constants/tokenAddresses'
import { getBalance } from 'utils'

import Context from './Context'

interface Balances {
  [key: string]: BigNumber;
}

const Provider: React.FC = ({ children }) => {
  const { account, ethereum }: { account: string | null, ethereum: provider } = useWallet()

  // State variables
  const [balance, setBalance] = useState<Balances>({})

  // Local variables
  let balances: {
    [poolName: string]: BigNumber
  } = {};

  // Function that fetches balances
  const fetchBalances = useCallback(async (userAddress: string, provider: provider) => {
    // Look token addresses, get balance
    for(let tokenName in addresses) {
      const tokenAddress = addresses[tokenName];
      const balanceInSatoshis = await getBalance(provider, tokenAddress, userAddress);
      balances[tokenName] = new BigNumber(balanceInSatoshis).dividedBy(new BigNumber(10).pow(18))
    }
    // Set state
    setBalance(balances)
  }, [
    setBalance
  ])

  useEffect(() => {
    if (account && ethereum) {
      fetchBalances(account, ethereum)
      const twoMinutes = 10000*12;
      const refreshInterval = setInterval(() => fetchBalances(account, ethereum), twoMinutes)
      return () => clearInterval(refreshInterval)
    }
  }, [
    account,
    ethereum,
    fetchBalances,
  ])

  return (
    <Context.Provider value={{
      balance,
    }}>
      {children}
    </Context.Provider>
  )
}

export default Provider