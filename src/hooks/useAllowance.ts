import { useCallback, useEffect, useState } from 'react'
import { getCache, setCache, getDiffInSeconds } from 'utils/cache'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import { getAllowance } from 'utils'

const useAllowance = (tokenAddress?: string, spenderAddress?: string) => {
  const [allowance, setAllowance] = useState<BigNumber>()
  const { account, ethereum }: { account: string | null, ethereum?: provider} = useWallet()

  const fetchAllowance = useCallback(async (userAddress: string, provider: provider) => {
    if (!spenderAddress || !tokenAddress) {
      return
    }

    // Get value from cache first
    // const cacheKey = `allowance_${spenderAddress.substring(0, 6)}_${tokenAddress.substring(0, 6)}`;
    // const allowanceFromCache = getCache(cacheKey)
    // const diffInSeconds = getDiffInSeconds(allowanceFromCache.timestamp)
    // if(allowanceFromCache && allowanceFromCache.timestamp && diffInSeconds <= 60*5) {
    //   setAllowance(new BigNumber(allowanceFromCache.data));
    //   return allowanceFromCache.data;
    // }

    const allowance = await getAllowance(userAddress, spenderAddress, tokenAddress, provider)
    setAllowance(new BigNumber(allowance))
    // Store allowance in cache
    // setCache(cacheKey, new BigNumber(allowance));
  }, [setAllowance, spenderAddress, tokenAddress])

  useEffect(() => {
    if (account && ethereum && spenderAddress && tokenAddress) {
      fetchAllowance(account, ethereum)
    }
    let refreshInterval = setInterval(fetchAllowance, 15000)
    return () => clearInterval(refreshInterval)
  }, [account, ethereum, spenderAddress, tokenAddress])

  return allowance
}

export default useAllowance