import React, { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { bnToDec, decToBn } from 'utils'
import { ChainId, Token, WETH, Fetcher, Route } from '@uniswap/sdk'

import ConfirmTransactionModal from 'components/ConfirmTransactionModal'
import useApproval from 'hooks/useApproval'
import useVelo from 'hooks/useVelo'

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
  getPoolBalance
} from 'velo-sdk/utils'

import {
  getUniswapPrice
} from 'utils';

import Context from './Context'

const farmingStartTime = 1600545500*1000

interface EarnedBalance {
  [key: string]: BigNumber;
}

interface StakedBalance {
  [key: string]: BigNumber;
}

interface TotalStakedForPool {
  [key: string]: BigNumber;
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
    balance: number
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
  const [poolContracts, setPoolContracts] = useState<Object>()
  const [poolStatus, setPoolStatus] = useState<PoolStatus>({})
  const [poolInfo, setPoolInfo] = useState<PoolInfo>({})

  const [relativeVelocity, setRelativeVelocity] = useState<BigNumber>()
  const [totalSupply, setTotalSupply] = useState<BigNumber>()
  const [price, setPrice] = useState<Price>({})

  const velo = useVelo()
  const { account } = useWallet()

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
      balance: number
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
    if (!account || !velo) return
    for(let poolName in poolContracts) {
      const balance = await getEarned(velo, velo.contracts[poolName], account)
      if(balance) {
        earnedBalances[poolName] = balance;
      }
    }
   
    setEarnedBalance(earnedBalances)
  }, [
    account,
    setEarnedBalance,
    earnedBalance,
    earnedBalances,
    velo
  ])

  // Get total staked balance (of all addresses)
  const fetchTotalStakedBalance = useCallback(async () => {
    if (! velo) return;
    let total = 0;
    for(let poolName in poolContracts) {
      const totalStaked = await getTotalStakedForPool(velo, velo.contracts[poolName])
      if(totalStaked) {
        totalStakedForPools[poolName] = totalStaked;
        if(poolName == 'dai_pool') total += bnToDec(totalStaked);
      }
    }
    setTotalStakedBalance(decToBn(total));
    setTotalStakedForPool(totalStakedForPools);
  }, [
    account,
    setTotalStakedBalance,
    poolContracts,
    setTotalStakedForPool,
    totalStakedForPools,
    velo
  ])

  const fetchStakedBalance = useCallback(async (poolContracts: any) => {
    if (!account || !velo) return

    for(let poolName in poolContracts) {
      const balance = await getStaked(velo, velo.contracts[poolName], account)
      if(balance) {
        stakedBalances[poolName] = balance;
      }
    }

    setStakedBalance(stakedBalances)
  }, [
    account,
    stakedBalance,
    stakedBalances,
    setStakedBalance,
    velo
  ])

  const fetchRelativeVelocity = useCallback(async () => {
    if (! velo) return;
    const relativeVelocity = await getRelativeVelocity(velo)
    setRelativeVelocity(relativeVelocity);
  }, [
    velo,
    setRelativeVelocity
  ])

  const handleApprove = useCallback(() => {
    setConfirmTxModalIsOpen(true)
    // onApprove()
  }, [
    // onApprove,
    setConfirmTxModalIsOpen,
  ])

  // Get total supply
  const fetchTotalSupply = useCallback(async () => {
    if (! velo) return;
    const totalSupply = await getTotalSupply(velo)
    setTotalSupply(totalSupply);
  }, [
    velo,
    setTotalSupply
  ])

  const fetchPrices = useCallback(async () => {
    // VLO price in ETH
    const VLO_WETH: any = await getUniswapPrice(
      WETH[ChainId.MAINNET],
      new Token(ChainId.MAINNET, '0x98ad9B32dD10f8D8486927D846D4Df8BAf39Abe2', 18),// VLO
      new Token(ChainId.MAINNET, '0x98ad9B32dD10f8D8486927D846D4Df8BAf39Abe2', 18) // VLO
    );
    const YCRV_WETH: any = await getUniswapPrice(
      WETH[ChainId.MAINNET],
      new Token(ChainId.MAINNET, '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8', 18),// YCRV-LP
      new Token(ChainId.MAINNET, '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8', 18),// YCRV-LP
    );
    const WETH_DAI: any = await getUniswapPrice(
      WETH[ChainId.MAINNET],
      new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18),// DAI
      WETH[ChainId.MAINNET]
    );

    if(VLO_WETH) prices['VLO_WETH'] = VLO_WETH;
    if(WETH_DAI) prices['WETH_DAI'] = WETH_DAI;
    if(WETH_DAI) prices['YCRV_WETH'] = YCRV_WETH;

    setPrice(prices)
  }, [
    prices,
    setPrice,
    getUniswapPrice,
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
    await unstake(velo, poolName, amount, account, () => {
      setConfirmTxModalIsOpen(false)
      poolStatuses[poolName].isUnstaking = true;
      setPoolStatus(poolStatuses)
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
    if (!velo || !account) return;

    for(let poolName in poolContracts) {
      const startTime = await getStartTime(velo, poolName)
      const balance = await getPoolBalance(velo, poolName)
      // const duration = await getPoolDuration(velo, poolName)
      const duration = 0
      if(startTime) {
        if(! poolInfos[poolName] ) {
          poolInfos[poolName] = {
            startTime: 0,
            duration: 0,
            balance: 0,
          };
        }
        poolInfos[poolName].startTime = startTime;
        poolInfos[poolName].duration = duration;
        poolInfos[poolName].balance = balance;
      }
    }

    setPoolInfo(poolInfos)
  }, [
    setPoolInfo,
    poolInfos,
    velo,
    account
  ])

  useEffect(() => {
    fetchPoolContracts()
    return () => {}
  }, [
    fetchPoolContracts
  ])

  useEffect(() => {
    const fetchBalances = () => {
      fetchStakedBalance(poolContracts);
      fetchEarnedBalance(poolContracts);
      // Fetch total staked balance (for all accounts)
      fetchPoolInfo()
      fetchTotalStakedBalance();
      fetchPrices()
    }
    fetchBalances();
    let refreshInterval = setInterval(() => fetchBalances(), account ? 20000 : 120000)
    return () => clearInterval(refreshInterval)
  }, [poolContracts, account])

  // useEffect(() => {
  //   fetchPrices();
  //   const refreshInterval = setInterval(() => {
  //     fetchPrices()
  //   }, account ? 1000*60*3 : 1000*60*120)
  //   return () => clearInterval(refreshInterval)
  // }, [account])

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
      farmingStartTime,
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
    }}>
      {children}
      <ConfirmTransactionModal isOpen={confirmTxModalIsOpen} />
    </Context.Provider>
  )
}

export default Provider