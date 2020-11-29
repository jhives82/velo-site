import React, { useCallback } from 'react'
import useFarming from '../../../hooks/useFarming'
import BigNumber from 'bignumber.js'
import useVelo from 'hooks/useVelo'

import { useWallet } from 'use-wallet'
import numeral from 'numeral'
import {
  bnToDec,
  veloCoinNameToCoinGeckoCoinName
} from 'utils'

interface Props {
  value?: any,
}

const TotalLockedValue: React.FC<Props> = ({ value }) => {

  // Init wallet
  const { velo } = useVelo()
	
  const { status, connect } = useWallet()

  const {
    price,
    totalStakedForPool,
    totalStakedBalance
  } = useFarming()

  const getValueInTokens = (number: BigNumber, decimals = 18) => {
    return Number(number) / Math.pow(10, decimals)
  }

  const format = (value: any) => {
    return numeral(value).format('0.00a');
  }

  const getPrice = useCallback((price: any, coinName: string) => {
    // Return 0 if prices are not loaded yet
    if(! price) return 0;
    // Get price of our coin, denominated in ETH
    const coinPrice = price[veloCoinNameToCoinGeckoCoinName(coinName)];
    // Return if price was found
    if(coinPrice) {
      return Number(coinPrice);
    }
    // Return 0 if no price was found
    return 0;
  }, [price])

  const getTotalDeposited = useCallback((price: any) => {
    const daiPriceInDai = getPrice(price, 'dai');
    const ycrvPriceInDai = getPrice(price, 'ycrv');
    let totalDeposited = 0;
    if(totalStakedForPool && totalStakedForPool['dai_pool']) {
      totalDeposited += (daiPriceInDai * bnToDec(new BigNumber(totalStakedForPool['dai_pool'])));
    }
    if(totalStakedForPool && totalStakedForPool['ycrv_pool']) {
      totalDeposited += (ycrvPriceInDai * bnToDec(new BigNumber(totalStakedForPool['ycrv_pool'])));
    }
    if(totalStakedForPool && totalStakedForPool['velo_eth_uni_pool']) {
      totalDeposited += (getPrice(price, 'velo_eth_uni') * bnToDec(new BigNumber(totalStakedForPool['velo_eth_uni_pool'])));
    }
    if(totalStakedForPool && totalStakedForPool['velo_eth_dai_pool']) {
      totalDeposited += (getPrice(price, 'velo_eth_dai') * bnToDec(new BigNumber(totalStakedForPool['velo_eth_dai_pool'])));
    }
    if(totalStakedForPool && totalStakedForPool['velo_eth_usdc_pool']) {
      totalDeposited += (getPrice(price, 'velo_eth_usdc') * bnToDec(new BigNumber(totalStakedForPool['velo_eth_usdc_pool'])));
    }
    if(totalStakedForPool && totalStakedForPool['velo_eth_usd_pool']) {
      totalDeposited += (getPrice(price, 'velo_eth_usd') * bnToDec(new BigNumber(totalStakedForPool['velo_eth_usd_pool'])));
    }
    if(totalStakedForPool && totalStakedForPool['velo_eth_wbtc_pool']) {
      totalDeposited += (getPrice(price, 'velo_eth_wbtc') * bnToDec(new BigNumber(totalStakedForPool['velo_eth_wbtc_pool'])));
    }

    const poolsDeFiLinkUp = [
      'comp_pool',
      'aave_pool',
      'link_pool',
      'snx_pool',
      'sushi_pool',
      'pickle_pool',
      'dough_pool',
      'yfi_pool',
    ]

    for(let key in poolsDeFiLinkUp) {
      const pool = poolsDeFiLinkUp[key];
      if(totalStakedForPool && totalStakedForPool[pool]) {
        totalDeposited += (getPrice(price, pool.replace('_pool', '')) * bnToDec(new BigNumber(totalStakedForPool[pool])));
      }
    }

    if(totalStakedForPool && totalStakedForPool['velo_eth_uni_legacy_pool']) {
      totalDeposited += (getPrice(price, 'velo_eth_uni') * bnToDec(new BigNumber(totalStakedForPool['velo_eth_uni_legacy_pool'])));
    }

    if(! daiPriceInDai || ! ycrvPriceInDai || ! totalDeposited) return 0;
    return totalDeposited;
  }, [price, totalStakedForPool])

  // {totalStakedBalance ? format(totalStakedBalance) : '--'}

  return (
    <div className="TotalLockedValue inline-block">
	    {status != 'connected' && value && <div>
        $ {format(value)}
      </div>}
      {status == 'connected' && price && <div>
        $ {(getTotalDeposited(price) && getTotalDeposited(price) > 0) ? format(getTotalDeposited(price)) : '--'}
      </div>}
    </div>
  )
}

export default TotalLockedValue
