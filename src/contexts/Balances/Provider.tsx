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

const veloEthUniAddress = addresses.velo_eth_uni;
const veloEthBlpAddress = addresses.velo_eth_blp;

const Provider: React.FC = ({ children }) => {
  const [veloBalance, setVeloBalance] = useState<BigNumber>()
  const [daiBalance, setDaiBalance] = useState<BigNumber>()
  const [ycrvBalance, setYcrvBalance] = useState<BigNumber>()
  const [veloEthBlpBalance, setVeloEthBlpBalance] = useState<BigNumber>()
  const [veloEthUniBalance, setVeloEthUniBalance] = useState<BigNumber>()
  const [pumpBalance, setPumpBalance] = useState<BigNumber>()

  const { account, ethereum }: { account: string | null, ethereum: provider } = useWallet()

  const fetchBalances = useCallback(async (userAddress: string, provider: provider) => {
    const balances = await Promise.all([
      await getBalance(provider, veloAddress, userAddress),
      await getBalance(provider, daiAddress, userAddress),
      await getBalance(provider, ycrvAddress, userAddress),
      await getBalance(provider, veloEthBlpAddress, userAddress),
      await getBalance(provider, veloEthUniAddress, userAddress),
      await getBalance(provider, pumpAddress, userAddress)
    ])
    setVeloBalance(new BigNumber(balances[0]).dividedBy(new BigNumber(10).pow(18)));
    setDaiBalance(new BigNumber(balances[1]).dividedBy(new BigNumber(10).pow(18)));
    setYcrvBalance(new BigNumber(balances[2]).dividedBy(new BigNumber(10).pow(18)));
    setVeloEthBlpBalance(new BigNumber(balances[3]).dividedBy(new BigNumber(10).pow(18)));
    setVeloEthUniBalance(new BigNumber(balances[4]).dividedBy(new BigNumber(10).pow(18)));
    setPumpBalance(new BigNumber(balances[5]).dividedBy(new BigNumber(10).pow(18)));
  }, [
    setVeloBalance,
    setDaiBalance,
    setYcrvBalance,
    setVeloEthBlpBalance,
    setVeloEthUniBalance,
    setPumpBalance,
  ])

  useEffect(() => {
    if (account && ethereum) {
      fetchBalances(account, ethereum)
      let refreshInterval = setInterval(() => fetchBalances(account, ethereum), 10000*12)
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
      ycrvBalance,
      veloEthBlpBalance,
      veloEthUniBalance
    }}>
      {children}
    </Context.Provider>
  )
}

export default Provider