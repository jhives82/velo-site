import React, { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import useVelo from 'hooks/useVelo'
import { 
  claimVested,
  currUnclaimedMigratorVesting,
  currUnclaimedDelegatorRewards,
  currVested,
} from 'velo-sdk/utils'

import ConfirmTransactionModal from 'components/ConfirmTransactionModal'

import Context from './Context'

const Provider: React.FC = ({ children }) => {
  const { account } = useWallet()
  const velo = useVelo()

  const [vestedBalance, setVestedBalance] = useState<BigNumber>()
  const [vestedDelegatorRewardBalance, setVestedDelegatorRewardBalance] = useState<BigNumber>()
  const [vestedMigratedBalance, setVestedMigratedBalance] = useState<BigNumber>()

  const [isClaiming, setIsClaiming] = useState(false)
  const [confirmTxModalIsOpen, setConfirmtxModalIsOpen] = useState(false)

  const fetchVestedBalances = useCallback(async () => {
    const vBal = await currVested(velo, account)
    const dRVBal = await currUnclaimedDelegatorRewards(velo, account)
    const mVBal = await currUnclaimedMigratorVesting(velo, account)
    setVestedBalance(vBal)
    setVestedDelegatorRewardBalance(dRVBal)
    setVestedMigratedBalance(mVBal)
  }, [
    account,
    setVestedBalance,
    setVestedDelegatorRewardBalance,
    setVestedMigratedBalance,
    velo,
  ])

  const handleClaimTxSent = useCallback(() => {
    setIsClaiming(true)
    setConfirmtxModalIsOpen(false)
  }, [
    setIsClaiming,
    setConfirmtxModalIsOpen
  ])

  const handleClaim = useCallback(async () => {
    setConfirmtxModalIsOpen(true)
    await claimVested(velo, account, handleClaimTxSent)
    setIsClaiming(false)
  }, [
    account,
    handleClaimTxSent,
    setConfirmtxModalIsOpen,
    setIsClaiming,
    velo
  ])

  useEffect(() => {
    if (account && velo) {
      fetchVestedBalances()
    }
  }, [
    account,
    fetchVestedBalances,
    velo,
  ])

  useEffect(() => {
    if (account && velo) {
      fetchVestedBalances()
      let refreshInterval = setInterval(fetchVestedBalances, 10000)
      return () => clearInterval(refreshInterval)
    }
  }, [
    account,
    velo,
    fetchVestedBalances,
  ])

  return (
    <Context.Provider value={{
      onClaim: handleClaim,
      isClaiming,
      vestedBalance,
      vestedDelegatorRewardBalance,
      vestedMigratedBalance,
    }}>
      {children}
      <ConfirmTransactionModal isOpen={confirmTxModalIsOpen} />
    </Context.Provider>
  )
}

export default Provider
