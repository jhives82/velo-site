import React, { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import {
  getVeloInCirculation,
} from 'velo-sdk/utils'
import useVelo from 'hooks/useVelo'

import {
  Container,
  Spacer,
  useTheme,
} from 'react-neu'
import { useWallet } from 'use-wallet'
import numeral from 'numeral'

import useBalances from 'hooks/useBalances'
import useVesting from 'hooks/useVesting'

const VeloInCirculation: React.FC = () => {

  // Init wallet
  const { reset } = useWallet()
  const velo = useVelo()

  // Get total supply
  const [veloInCirculation, setVeloInCirculation] = useState<BigNumber>()
  const fetchVeloInCirculation = useCallback(async () => {
    if (! velo) return
    const veloInCirculation = await getVeloInCirculation(velo)
    setVeloInCirculation(veloInCirculation);
  }, [
    velo,
    setVeloInCirculation
  ])
  // fetchVeloInCirculation();

  const getDisplayPercentage = useCallback((value?: BigNumber) => {
    if (value) {
      return value + '%'
    } else {
      return '--'
    }
  }, [])

  return (
    <div className="VeloInCirculation inline-block">
      {getDisplayPercentage(new BigNumber(20))}
    </div>
  )
}

export default VeloInCirculation
