import React, { useCallback } from 'react'
import useFarming from '../../../hooks/useFarming'
import BigNumber from 'bignumber.js'
import useVelo from 'hooks/useVelo'

import { useWallet } from 'use-wallet'
import numeral from 'numeral'

interface Props {
  value?: any,
}

const TotalSupply: React.FC<Props> = ({ value }) => {

  // Init wallet
  const { reset } = useWallet()

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
      {! totalSupply ? numeral(value).format('0.00a') : getDisplayBalance(totalSupply)}
    </div>
  )
}

export default TotalSupply
