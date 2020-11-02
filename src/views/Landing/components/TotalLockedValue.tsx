import React, { useCallback, useEffect, useState } from 'react'
import useFarming from '../../../hooks/useFarming'
import BigNumber from 'bignumber.js'
import {
  getPendingVeloToHarvest
} from 'velo-sdk/utils'
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

const TotalLockedValue: React.FC = () => {

  // Init wallet
  const { reset } = useWallet()
  const velo = useVelo()

  const {
    totalStakedBalance
  } = useFarming()

  const getValueInTokens = (number: BigNumber, decimals = 18) => {
    return Number(number) / Math.pow(10, decimals)
  }

  const format = (value: BigNumber) => {
    return numeral(getValueInTokens(value)).format('0.00a');
  }

  return (
    <div className="TotalLockedValue inline-block">
      {totalStakedBalance ? format(totalStakedBalance) : '--'}
    </div>
  )
}

export default TotalLockedValue
