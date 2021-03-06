import React, { useCallback } from 'react'
import useFarming from '../../../hooks/useFarming'
import BigNumber from 'bignumber.js'
import useVelo from 'hooks/useVelo'

import {
  Container,
  Spacer,
  useTheme,
} from 'react-neu'
import { useWallet } from 'use-wallet'
import numeral from 'numeral'
import { bnToDec } from 'utils'

import Rebase from 'views/Home/components/Rebase'

import useBalances from 'hooks/useBalances'
import useVesting from 'hooks/useVesting'

const PendingHarvest: React.FC = () => {

  // Init wallet
  const { reset } = useWallet()
  const { velo } = useVelo()

  const {
    earnedBalance
  } = useFarming()

  const getValueInTokens = (number: BigNumber, decimals = 18) => {
    return Number(number) / Math.pow(10, decimals)
  }

  const getDisplayBalance = useCallback((value?: BigNumber) => {
    if (value) {
      return numeral(getValueInTokens(value)).format('0.00a');
    } else {
      return '--'
    }
  }, [])

  const formattedEarnedBalance = (earnedBalance: any) => {
    if (earnedBalance) {
      let totalVloBalance = 0;
      for(let key in earnedBalance) {
        totalVloBalance += bnToDec(new BigNumber(earnedBalance[key]));
      }
      return numeral(totalVloBalance).format('0.00a')
    } else {
      return '--'
    }
  }

  return (
    <div className="PendingHarvest inline-block">
      {formattedEarnedBalance(earnedBalance)}
    </div>
  )
}

export default PendingHarvest
