import React from 'react'
import useFarming from '../../../hooks/useFarming'
import BigNumber from 'bignumber.js'
import useVelo from 'hooks/useVelo'

import { bnToDec } from 'utils'
import { useWallet } from 'use-wallet'
import numeral from 'numeral'

interface Props {
  value?: any,
}

const RelativeVelocity: React.FC<Props> = ({ value }) => {

  // Init wallet
  const {
    relativeVelocity
  } = useFarming()

  return (
    <div className="RelativeVelocity inline-block">
      {(value && ! relativeVelocity) ? numeral(bnToDec(new BigNumber(value))).format('0.00a') + '%' : ''}
      {relativeVelocity ? numeral(bnToDec(new BigNumber(relativeVelocity))).format('0.00a') + '%' : ''}
    </div>
  )
}

export default RelativeVelocity
