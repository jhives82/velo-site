import React, { useCallback, useEffect, useState } from 'react'
import useFarming from '../../../hooks/useFarming'
import BigNumber from 'bignumber.js'
import {
  getTotalSupply,
  getRelativeVelocity,
} from 'velo-sdk/utils'
import useVelo from 'hooks/useVelo'

import { bnToDec } from 'utils'

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

const RelativeVelocity: React.FC = () => {

  // Init wallet
  const { reset } = useWallet()
  const velo = useVelo()

  const {
    relativeVelocity
  } = useFarming()

  return (
    <div className="RelativeVelocity inline-block">
      {relativeVelocity ? numeral(bnToDec(new BigNumber(relativeVelocity))).format('0.00a') : '--'}%
    </div>
  )
}

export default RelativeVelocity
