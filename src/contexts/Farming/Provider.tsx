import React, { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { provider } from 'web3-core'
import { useWallet } from 'use-wallet'
import { bnToDec, decToBn } from 'utils'
import { resetUserSpecificCache, getCache, setCache, getDiffInSeconds, giveCacheToApp } from 'utils/cache'
import { ChainId, Token, WETH, Fetcher, Route } from '@uniswap/sdk'
import moment from 'moment'
import {addresses} from 'constants/tokenAddresses'

import ConfirmTransactionModal from 'components/ConfirmTransactionModal'
import useApproval from 'hooks/useApproval'
import useVelo from 'hooks/useVelo'

import config from 'config'

import {
  getEarned,
  getStaked,
  getTotalStakedForPool,
  getTotalSupply,
  harvest,
  redeem,
  stake,
  unstake,
  getPoolContracts,
  getStartTime,
  getPoolDuration,
  getRelativeVelocity,
  getPoolBalance,
  getDelegatedBalance,
  getVloBalanceForPool,
  getLastRebaseTimestamp,
  getNextRebaseTimestamp,
  getNextRebaseInSecondsRemaining,
  getReserves,
  getTotalSupplyForLpContract
} from 'velo-sdk/utils'

import {
  getUniswapPrice,
  getCoinGeckoPrices,
  getBalance,
} from 'utils';

import Context from './Context'

// Cache duration in seconds
const cacheDuration: {
  [key: string]: Number
} = {
  relativeVelocity: 60*10,
  totalSupply: 60*5,
  prices: 60*5,
  poolInfos: 60*5,
  stakedBalance: 50
}

interface EarnedBalance {
  [key: string]: BigNumber;
}

interface StakedBalance {
  [key: string]: BigNumber;
}

interface TotalStakedForPool {
  [key: string]: BigNumber;
}

interface PoolContract {
  [key: string]: any;
}

interface PoolStatus {
  [key: string]: {
    isStaking: boolean,
    isUnstaking: boolean,
    isHarvesting: boolean
  }
}

interface PoolInfo {
  [key: string]: {
    startTime: number,
    duration: number,
    balance: number,
    vloBalance: number
  }
}

interface Price {
  [key: string]: Number
}

const Provider: React.FC = ({ children }) => {
  const [confirmTxModalIsOpen, setConfirmTxModalIsOpen] = useState(false)
  const [countdown, setCountdown] = useState<number>()
  const [isHarvesting, setIsHarvesting] = useState(false)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)

  const [earnedBalance, setEarnedBalance] = useState<EarnedBalance>({})
  const [stakedBalance, setStakedBalance] = useState<StakedBalance>({})
  const [totalStakedForPool, setTotalStakedForPool] = useState<TotalStakedForPool>()
  const [totalStakedBalance, setTotalStakedBalance] = useState<BigNumber>()
  const [poolContracts, setPoolContracts] = useState<PoolContract>({})
  const [poolStatus, setPoolStatus] = useState<PoolStatus>({})
  const [poolInfo, setPoolInfo] = useState<PoolInfo>({})
  const [lastRebaseTimestamp, setLastRebaseTimestamp] = useState(0);
  const [nextRebaseTimestamp, setNextRebaseTimestamp] = useState(0);

  const [relativeVelocity, setRelativeVelocity] = useState<BigNumber>()
  const [totalSupply, setTotalSupply] = useState<BigNumber>()
  const [price, setPrice] = useState<Price>({})

  const { velo } = useVelo()
  const { account, ethereum }: { account: string | null, ethereum: provider } = useWallet()

  let stakedBalances: {
    [poolName: string]: BigNumber
  } = {};

  let totalStakedForPools: {
    [poolName: string]: BigNumber
  } = {};

  let earnedBalances: {
    [poolName: string]: BigNumber
  } = {};

  let prices: {
    [poolName: string]: Number
  } = {};

  let poolStatuses: {
    [poolName: string]: {
      isStaking: boolean,
      isUnstaking: boolean,
      isHarvesting: boolean
    }
  } = {};

  let poolInfos: {
    [poolName: string]: {
      startTime: number,
      duration: number,
      balance: number,
      vloBalance: any
    }
  } = {};

  const daiPoolAddress = velo ? velo.contracts.dai_pool.options.address : ''

  const fetchPoolContracts = useCallback(async () => {
    if (!velo) return
    const pools = await getPoolContracts(velo)
    setPoolContracts(pools)
    return pools;
  }, [
    setPoolContracts,
    velo
  ])

  const fetchEarnedBalance = useCallback(async (poolContracts: any) => {
    // If no account is set, don't show earned balance
    // Otherwise it could be misleading if it's not the realtime value
    if(! account) return;

    const earnedBalanceFromCache = getCache('earnedBalance')
    const diffInSeconds1 = getDiffInSeconds(earnedBalanceFromCache.timestamp)
    if(earnedBalanceFromCache && earnedBalanceFromCache.timestamp) {
      setEarnedBalance(earnedBalanceFromCache.data);
      if(diffInSeconds1 <= 60*2) return;
    }

    if (!account || !velo) return
    for(let poolName in poolContracts) {
      console.log('poolName', poolName)
      const balance = await getEarned(velo, velo.contracts[poolName], account)
      if(balance) {
        earnedBalances[poolName] = balance;
      }
    }
   
    setEarnedBalance(earnedBalances)
    setCache('earnedBalance', earnedBalances)
  }, [
    account,
    setEarnedBalance,
    earnedBalance,
    earnedBalances,
    velo
  ])

  // Get total staked balance (of all addresses)
  const fetchTotalStakedBalance = useCallback(async () => {
    const totalStakedBalanceFromCache = getCache('totalStakedBalance')
    const diffInSeconds1 = getDiffInSeconds(totalStakedBalanceFromCache.timestamp)
    if(totalStakedBalanceFromCache && totalStakedBalanceFromCache.timestamp && diffInSeconds1 <= 60*5) {
      setTotalStakedBalance(new BigNumber(totalStakedBalanceFromCache.data));
    }

    const totalStakedForPoolFromCache = getCache('totalStakedForPool')
    const diffInSeconds2 = getDiffInSeconds(totalStakedForPoolFromCache.timestamp)
    if(totalStakedForPoolFromCache && totalStakedForPoolFromCache.timestamp && totalStakedForPoolFromCache.data && totalStakedForPoolFromCache.data['dai_pool']) {
      setTotalStakedForPool(totalStakedForPoolFromCache.data);
      if(diffInSeconds2 <= 60*5) return;
    }

    // Don't fetch if no account is set
    if (! velo || ! account) return;

    // Only check pools that are active atm
    const poolsToInclude = config.activePools;

    let total = 0;
    for(let poolName in poolContracts) {
      if(poolsToInclude.indexOf(poolName) <= -1) continue;
      const totalStaked = await getTotalStakedForPool(velo, velo.contracts[poolName])
      if(totalStaked) {
        totalStakedForPools[poolName] = totalStaked;
        if(poolName == 'dai_pool') total += bnToDec(totalStaked);
      }
    }

    setTotalStakedBalance(decToBn(total));
    setCache('totalStakedBalance', decToBn(total))
    setTotalStakedForPool(totalStakedForPools);
    setCache('totalStakedForPool', totalStakedForPools)
  }, [
    account,
    setTotalStakedBalance,
    poolContracts,
    setTotalStakedForPool,
    totalStakedForPools,
    velo
  ])

  const fetchStakedBalance = useCallback(async (poolContracts: any) => {
    const fromCache = getCache('stakedBalance')
    const diffInSeconds = getDiffInSeconds(fromCache.timestamp)
    if(fromCache && fromCache.timestamp && diffInSeconds <= cacheDuration['stakedBalance']) {
      if(fromCache && fromCache.data && fromCache.data['dai_pool']) {
        setStakedBalance(fromCache.data);
        return;
      }
    }

    if (!account || !velo) return;

    // Only check pools that are active atm
    const poolsToInclude = config.activePools;

    for(let poolName in poolContracts) {
      if(poolsToInclude.indexOf(poolName) <= -1) continue;
      const balance = await getStaked(velo, velo.contracts[poolName], account)
      stakedBalances[poolName] = balance || new BigNumber(0);
    }

    setStakedBalance(stakedBalances)
    setCache('stakedBalance', stakedBalances);
  }, [
    account,
    // stakedBalance,
    // stakedBalances,
    // setStakedBalance,
    velo
  ])

  const fetchRelativeVelocity = useCallback(async () => {
    const cacheSet = giveCacheToApp('relativeVelocity', cacheDuration['relativeVelocity'], setRelativeVelocity);
    if(cacheSet) return;

    // Don't fetch if no account is set
    if (! velo || !account) return;

    const relativeVelocity = await getRelativeVelocity(velo)
    setRelativeVelocity(relativeVelocity);
    setCache('relativeVelocity', relativeVelocity)
  }, [
    velo,
    account,
    setRelativeVelocity
  ])

  const handleApprove = useCallback(() => {
    console.log('approve?')
    setConfirmTxModalIsOpen(true)
    // onApprove()
  }, [
    // onApprove,
    setConfirmTxModalIsOpen,
  ])

  // Get total supply
  const fetchTotalSupply = useCallback(async () => {
    const cacheSet = giveCacheToApp('totalSupply', cacheDuration['totalSupply'], setTotalSupply);
    if(cacheSet) return;

    // Don't fetch prices if no account is set
    if (! velo || !account) return;

    const totalSupply = await getTotalSupply(velo)
    setTotalSupply(totalSupply);
    setCache('totalSupply', totalSupply);
  }, [
    velo,
    account,
    setTotalSupply
  ])

  const getVloPrice = (price: any) => {
    if(! price) return 0;
    if(price.VLO_WETH && price.WETH_DAI) {
      return Number(price.VLO_WETH) * Number(price.WETH_DAI);
    }
    return 0;
  }

  const fetchPricesFromUniswap = async () => {
    let pricePerCoin: any = [];

    // VLO price in ETH, based on Uniswap
    const VLO_WETH: any = await getUniswapPrice(
      WETH[ChainId.MAINNET],
      new Token(ChainId.MAINNET, '0x98ad9B32dD10f8D8486927D846D4Df8BAf39Abe2', 18),// VLO
      new Token(ChainId.MAINNET, '0x98ad9B32dD10f8D8486927D846D4Df8BAf39Abe2', 18) // VLO
    );
    const WETH_DAI: any = await getUniswapPrice(
      WETH[ChainId.MAINNET],
      new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18),// DAI
      WETH[ChainId.MAINNET]
    );

    if(VLO_WETH) pricePerCoin['VLO_WETH'] = VLO_WETH;
    if(WETH_DAI) pricePerCoin['WETH_DAI'] = WETH_DAI;

    return pricePerCoin;
  }

  const fetchPricesFromCoinGecko = async () => {
    let pricePerCoin: any = [];

    try {
      // Get prices from CoinGecko
      const coinGeckoPrices: any = await getCoinGeckoPrices();

      // If we got CoinGecko prices, store them
      if(coinGeckoPrices) {
        for(let coinName in coinGeckoPrices) {
          const priceData = coinGeckoPrices[coinName];
          pricePerCoin[`${coinName}`] = priceData.usd;
        };
      }
    } catch (e) {
      console.error('Error while getting CoinGecko prices', e)
    }

    return pricePerCoin;
  }

  const fetchPricesFromUniSwapPools = useCallback(async () => {
    let pricePerCoin: any = [];

    for(let key in config.uniPoolTokens) {
      const uniPoolTokenName = config.uniPoolTokens[key];

      const uniReservesInEth = await getReserves(ethereum, addresses[uniPoolTokenName]);
      const uniLpTokenBalance = await getTotalSupplyForLpContract(ethereum, addresses[uniPoolTokenName]);

      // Get reserve0 or reserve1, depends on pool
      const reserveKey = uniPoolTokenName == 'velo_eth_usd' ? 'reserve0' : 'reserve1'

      // Get UniLP token value in WETH
      if(uniLpTokenBalance && uniReservesInEth && uniReservesInEth[reserveKey]) {
        const lpTokens = uniLpTokenBalance / Math.pow(10, 18);
        const amountOfWeth = uniReservesInEth[reserveKey] / Math.pow(10, 18);
        pricePerCoin[uniPoolTokenName + '_token_value_in_weth'] = (amountOfWeth*2) / lpTokens;
      }
    }

    return pricePerCoin;
  }, [
    getReserves,
    ethereum,
  ])

  const fetchPrices = useCallback(async () => {
    const cacheSet = giveCacheToApp('prices', cacheDuration['prices'], setPrice);
    if(cacheSet && false) return;

    // Don't fetch prices if no account is set
    if (!velo || !account) return;

    const pricesFromCoinGecko = await fetchPricesFromCoinGecko();
    const pricesFromUniSwap = await fetchPricesFromUniswap();
    const pricesFromUniSwapPools: any = await fetchPricesFromUniSwapPools();

    const getVloPrice = (price: any) => {
      if(! price) return 0;
      if(price.VLO_WETH && price.WETH_DAI) {
        return Number(price.VLO_WETH) * Number(price.WETH_DAI);
      }
      return 0;
    }

    const getUniLpPrice = (price: any, ethValuePerToken: number) => {
      if(! price) return 0;
      if(price.WETH_DAI) {
        return Number(ethValuePerToken) * Number(price.WETH_DAI);
      }
      return 0;
    }

    let allPrices = Object.assign({},
      pricesFromCoinGecko,
      pricesFromUniSwap,
      pricesFromUniSwapPools
    );

    let uniPoolTokenPrices = [];
    for(let key in config.uniPoolTokens) {
      const uniPoolTokenName = config.uniPoolTokens[key];
      uniPoolTokenPrices[uniPoolTokenName] = getUniLpPrice(price, pricesFromUniSwapPools[uniPoolTokenName + '_token_value_in_weth'])
    }

    allPrices = Object.assign({},
      allPrices,
      uniPoolTokenPrices,
      {
        vlo: getVloPrice(price)
      }
    );

    setPrice(allPrices)
    setCache('prices', allPrices);
  }, [
    price,
    prices,
    setPrice,
    getUniswapPrice,
    account,
    velo
  ])

  const handleHarvest = useCallback(async (poolName: string) => {
    if (!velo) return;
    if(! poolStatuses[poolName]) {
      poolStatuses[poolName] = {
        isStaking: false,
        isUnstaking: false,
        isHarvesting: false
      }
    }
    setConfirmTxModalIsOpen(true)
    await harvest(velo, poolName, account, () => {
      setConfirmTxModalIsOpen(false)
      poolStatuses[poolName].isHarvesting = true;
      setPoolStatus(poolStatuses)
    })
    poolStatuses[poolName].isHarvesting = true;
    setPoolStatus(poolStatuses)
  }, [
    account,
    setConfirmTxModalIsOpen,
    setIsHarvesting,
    setPoolStatus,
    poolStatuses,
    velo
  ])

  const handleRedeem = useCallback(async () => {
    if (!velo) return
    setConfirmTxModalIsOpen(true)
    await redeem(velo, account, () => {
      setConfirmTxModalIsOpen(false)
      setIsRedeeming(true)
    })
    setIsRedeeming(false)
  }, [
    account,
    setConfirmTxModalIsOpen,
    setIsRedeeming,
    velo
  ])

  const handleStake = useCallback(async (poolName: string, amount: string) => {
    if (!velo) return
    if(! poolStatuses[poolName]) {
      poolStatuses[poolName] = {
        isStaking: false,
        isUnstaking: false,
        isHarvesting: false
      }
    }
    setConfirmTxModalIsOpen(true)
    await stake(velo, poolName, amount, account, () => {
      setConfirmTxModalIsOpen(false)
      poolStatuses[poolName].isStaking = true;
      setPoolStatus(poolStatuses)
    })
    poolStatuses[poolName].isStaking = false;
    setPoolStatus(poolStatuses)
  }, [
    account,
    setConfirmTxModalIsOpen,
    setPoolStatus,
    poolStatuses,
    velo
  ])

  const handleUnstake = useCallback(async (poolName: string, amount: string) => {
    if (!velo) return;
    if(! poolStatuses[poolName]) {
      poolStatuses[poolName] = {
        isStaking: false,
        isUnstaking: false,
        isHarvesting: false
      }
    }
    setConfirmTxModalIsOpen(true)
    console.log('Almost starting the unstake of ' + amount + ' for ' + poolName);
    await unstake(velo, poolName, amount, account, () => {
      console.log('unstake amount', amount)
      setConfirmTxModalIsOpen(false)
      poolStatuses[poolName].isUnstaking = true;
      setPoolStatus(poolStatuses)
      // After 120s, set unstaking to false again
      setTimeout(() => {
        poolStatuses[poolName].isUnstaking = false;
        setPoolStatus(poolStatuses)
      }, 120*1000)
    })
    poolStatuses[poolName].isUnstaking = false;
    setPoolStatus(poolStatuses)
  }, [
    account,
    setConfirmTxModalIsOpen,
    setIsUnstaking,
    poolStatuses,
    setPoolStatus,
    velo
  ])

  const fetchPoolInfo = useCallback(async () => {
    const cacheSet = giveCacheToApp('poolInfos', cacheDuration['poolInfos'], setPoolInfo);
    if(cacheSet) return;

    if (!velo || !account) return;

    for(let poolName in poolContracts) {
      const balance = await getPoolBalance(velo, poolName);
      const vloBalanceForPool = await getVloBalanceForPool(velo, ethereum, poolName);
      // const duration = await getPoolDuration(velo, poolName)
      const duration = 0
      if(! poolInfos[poolName] ) {
        poolInfos[poolName] = {
          startTime: 0,
          duration: 0,
          balance: 0,
          vloBalance: 0
        };
        poolInfos[poolName].duration = duration;
        poolInfos[poolName].balance = balance;
        poolInfos[poolName].vloBalance = vloBalanceForPool;
      }
    }

    setPoolInfo(poolInfos)
    setCache('poolInfos', poolInfos);
  }, [
    setPoolInfo,
    poolInfos,
    velo,
    account
  ])

  const fetchNextRebase = useCallback( async(velo) => {
    const fromCache = getCache('nextRebaseTimestamp')
    const diffInSeconds = getDiffInSeconds(fromCache.timestamp)
    if(fromCache && fromCache.timestamp && diffInSeconds <= 60*2) {
      setNextRebaseTimestamp(fromCache.data);
      return;
    }

    if (!velo) return;
    const nextRebaseTimestamp = await getNextRebaseTimestamp(velo);
    if (nextRebaseTimestamp) {
      setNextRebaseTimestamp(nextRebaseTimestamp)
      setCache('nextRebaseTimestamp', nextRebaseTimestamp);
    } else {
      setNextRebaseTimestamp(0)
    }

  }, [
    setNextRebaseTimestamp,
    velo
  ])

  const fetchLastRebase = useCallback( async(velo) => {
    const fromCache = getCache('lastRebase')
    const diffInSeconds = getDiffInSeconds(fromCache.timestamp)
    if(fromCache && fromCache.timestamp && diffInSeconds <= 60*2) {
      setLastRebaseTimestamp(fromCache.data);
      return;
    }

    if (!velo) return;
    const lastRebaseTimestamp = await getLastRebaseTimestamp(velo);
    if (lastRebaseTimestamp) {
      setLastRebaseTimestamp(lastRebaseTimestamp)
      setCache('lastRebase', lastRebaseTimestamp);
    } else {
      setLastRebaseTimestamp(0)
    }
  }, [
    setLastRebaseTimestamp,
    velo
  ])

  
  const fetchRebaseData = useCallback(async () => {
    if (! velo) return;
    fetchLastRebase(velo)
    fetchNextRebase(velo)
  }, [
    account,
    velo
  ])

  useEffect(() => {
    fetchRebaseData()
  }, [
    velo
  ])

  useEffect(() => {
    fetchPoolContracts()
    return () => {}
  }, [
    fetchPoolContracts
  ])

  useEffect(() => {
    // Only fetch if wallet is connected
    if(! account) return;

    const goFetch = () => {
      const accountFromCache = getCache('account')
      // Reset cache if account is changed
      if(accountFromCache.data && accountFromCache.data != account) {
        resetUserSpecificCache()
      }

      fetchStakedBalance(poolContracts);
      fetchEarnedBalance(poolContracts);
  
      setCache('account', account);
    }

    goFetch();

    let refreshInterval = setInterval(() => goFetch(), account ? 30000 : 120000)
    return () => clearInterval(refreshInterval)
  }, [poolContracts, account])

  useEffect(() => {
    const fetchBalances = () => {
      fetchPoolInfo()
      fetchTotalStakedBalance();
      fetchPrices()
    }
    fetchBalances();
    let refreshInterval = setInterval(() => fetchBalances(), account ? 50000 : 120000)
    return () => clearInterval(refreshInterval)
  }, [poolContracts, account])

  useEffect(() => {
    fetchRelativeVelocity()
    fetchTotalSupply()
    return () => {}
  }, [
    fetchRelativeVelocity,
    fetchTotalSupply
  ])

  return (
    <Context.Provider value={{
      countdown,
      earnedBalance,
      isHarvesting,
      isRedeeming,
      isStaking,
      isUnstaking,
      poolContracts,
      onApprove: handleApprove,
      onHarvest: handleHarvest,
      onRedeem: handleRedeem,
      onStake: handleStake,
      onUnstake: handleUnstake,
      stakedBalance,
      totalStakedBalance,
      totalStakedForPool,
      poolStatus,
      poolInfo,
      relativeVelocity,
      totalSupply,
      price,
      nextRebaseTimestamp,
      lastRebaseTimestamp,
    }}>
      {children}
      <ConfirmTransactionModal isOpen={confirmTxModalIsOpen} />
    </Context.Provider>
  )
}

export default Provider
