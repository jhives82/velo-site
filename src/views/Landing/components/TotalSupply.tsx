import React, { useCallback, useEffect, useState } from 'react'
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

import Rebase from 'views/Home/components/Rebase'

import useBalances from 'hooks/useBalances'
import useVesting from 'hooks/useVesting'

const TotalSupply: React.FC = () => {

  // Init wallet
  const { reset } = useWallet()
  const velo = useVelo()

  const {
    totalSupply
  } = useFarming()

  const getValueInTokens = (number: BigNumber, decimals = 18) => {
    return Number(number) / Math.pow(10, decimals)
  }

  const getDisplayBalance = useCallback((value?: BigNumber) => {
    if (value) {
      return numeral(getValueInTokens(value)).format('0.00a')
    } else {
      return numeral(100000000).format('0.00a')
    }
  }, [])

  return (
    <div className="TotalSupply inline-block">
      {getDisplayBalance(totalSupply)}
    </div>
  )
}

export default TotalSupply
