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
    price,
    totalStakedForPool,
    totalStakedBalance
  } = useFarming()

  const getValueInTokens = (number: BigNumber, decimals = 18) => {
    return Number(number) / Math.pow(10, decimals)
  }

  const format = (value: BigNumber) => {
    return numeral(getValueInTokens(value)).format('0.00a');
  }

  const getPrice = useCallback((price: any, coinName: string) => {
    // For DAI, 1 DAI = 1 USD
    if(coinName == 'dai') return 1;
    // Return 0 if prices are not loaded yet
    if(! price) return 0;
    // Get price of our coin, denominated in ETH
    const coinPrice = price[coinName.toUpperCase() + '_WETH'];
    // Return if price was found
    if(coinPrice && price.WETH_DAI) {
      return Number(coinPrice) * Number(price.WETH_DAI);
    }
    // Return 0 if no price was found
    return 0;
  }, [price])

  const getTotalDeposited = useCallback((price: any) => {
    const daiPriceInDai = getPrice(price, 'dai');
    const ycrvPriceInDai = getPrice(price, 'ycrv');
    let totalDeposited = 0;
    if(totalStakedForPool && totalStakedForPool['dai_pool']) {
      totalDeposited += (daiPriceInDai * bnToDec(totalStakedForPool['dai_pool']));
    }
    if(totalStakedForPool && totalStakedForPool['ycrv_pool']) {
      totalDeposited += (ycrvPriceInDai * bnToDec(totalStakedForPool['ycrv_pool']));
    }
    if(! daiPriceInDai || ! ycrvPriceInDai || ! totalDeposited) return 0;
    return totalDeposited;
  }, [price, totalStakedForPool])

  // {totalStakedBalance ? format(totalStakedBalance) : '--'}

  return (
    <div className="TotalLockedValue inline-block">
      {(getTotalDeposited(price) && getTotalDeposited(price) > 0) ? getTotalDeposited(price).toFixed(0) : '--'}
    </div>
  )
}

export default TotalLockedValue
