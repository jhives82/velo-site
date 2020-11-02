import React, { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import {
  velo as veloAddress,
  dai as daiAddress,
  ycrv as ycrvAddress,
} from 'constants/tokenAddresses'
import { getBalance } from 'utils'

import Context from './Context'

const Provider: React.FC = ({ children }) => {
  const [veloBalance, setVeloBalance] = useState<BigNumber>()
  const [daiBalance, setDaiBalance] = useState<BigNumber>()
  const [ycrvBalance, setYcrvBalance] = useState<BigNumber>()

  const { account, ethereum }: { account: string | null, ethereum: provider } = useWallet()

  const fetchBalances = useCallback(async (userAddress: string, provider: provider) => {
    const balances = await Promise.all([
      await getBalance(provider, veloAddress, userAddress),
      await getBalance(provider, daiAddress, userAddress),
      await getBalance(provider, ycrvAddress, userAddress)
    ])
    setVeloBalance(new BigNumber(balances[0]).dividedBy(new BigNumber(10).pow(18)));
    setDaiBalance(new BigNumber(balances[1]).dividedBy(new BigNumber(10).pow(18)));
    setYcrvBalance(new BigNumber(balances[2]).dividedBy(new BigNumber(10).pow(18)));
  }, [
    setVeloBalance,
    setDaiBalance,
    setYcrvBalance,
  ])

  // useEffect(() => {
  //   if (account && ethereum) {
  //     fetchBalances(account, ethereum)
  //   }
  // }, [
  //   account,
  //   ethereum,
  //   fetchBalances,
  // ])

  useEffect(() => {
    if (account && ethereum) {
      fetchBalances(account, ethereum)
      let refreshInterval = setInterval(() => fetchBalances(account, ethereum), 10000*2)
      return () => clearInterval(refreshInterval)
    }
  }, [
    account,
    ethereum,
    fetchBalances,
  ])

  return (
    <Context.Provider value={{
      veloBalance,
      daiBalance,
      ycrvBalance
    }}>
      {children}
    </Context.Provider>
  )
}

export default Provider