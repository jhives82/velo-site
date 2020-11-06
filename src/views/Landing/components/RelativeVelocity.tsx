import React from 'react'
import useFarming from '../../../hooks/useFarming'
import BigNumber from 'bignumber.js'
import useVelo from 'hooks/useVelo'

import { bnToDec } from 'utils'
import { useWallet } from 'use-wallet'
import numeral from 'numeral'

const RelativeVelocity: React.FC = () => {

  // Init wallet
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
