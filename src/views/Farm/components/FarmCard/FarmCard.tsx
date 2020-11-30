import React, { useCallback, useMemo, useState, useEffect } from 'react'
import useFarming from '../../../../hooks/useFarming'
import Countdown, { CountdownRenderProps} from 'react-countdown'
import numeral from 'numeral'
import BigNumber from 'bignumber.js'
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardIcon,
} from 'react-neu'
import Label from 'components/Label'
import Value from 'components/Value'

import { useWallet } from 'use-wallet'
import useApproval from 'hooks/useApproval'
import useVelo from 'hooks/useVelo'

import {
  bnToDec,
  veloCoinNameToCoinGeckoCoinName,
  getEmissionRatePerWeek_fromSeconds
} from 'utils'

import {
  getMisesLegacyPoolRewardRate
} from 'velo-sdk/utils'


import './FarmCard.css';

import StakeModal from './components/StakeModal'
import UnstakeModal from './components/UnstakeModal'

import {
  addresses,
} from 'constants/tokenAddresses'

// Import components
import Block from '../../../../components/Block/Block'
import Button from '../../../../components/Button/Button'
import Harvest from '../../../../views/Farm/components/Harvest/Harvest'

interface FarmCardProps {
  icon: string,
  emoticon?: string,
  title: string
  name: string,
  pct: number,
  disabled?: boolean,
  poolName?: string,
  coinName?: string
}

interface PoolStatus {
  isStaking: boolean,
  isUnstaking: boolean,
  isHarvesting: boolean
}

const FarmCard: React.FC<FarmCardProps> = ({
  title,
  emoticon,
  name,
  icon,
  pct,
  disabled,
  poolName,
  coinName
}) => {
  const [stakeModalIsOpen, setStakeModalIsOpen] = useState(false)
  const [unstakeModalIsOpen, setUnstakeModalIsOpen] = useState(false)
  const [farmCardIsExpanded, setFarmCardIsExpanded] = useState(false)
  const [misesLegacyPoolRewardRate, setMisesLegacyPoolRewardRate] = useState<BigNumber>(new BigNumber(0))

  const { velo } = useVelo()
  const { account, status } = useWallet()

  const {
    poolContracts,
    poolStatus,
    isStaking,
    isUnstaking,
    onStake,
    onUnstake,
    stakedBalance,
    earnedBalance,
    totalStakedForPool,
    price,
  } = useFarming()

  const getPoolName = () => {
    return poolName ? poolName : name.toLowerCase() + '_pool';
  }

  const poolAddress = velo
    ? velo.contracts[getPoolName()]
      ? velo.contracts[getPoolName()].options.address
      : ''
    : null;

  const { isApproved, isApproving, onApprove } = useApproval(
    addresses[coinName || 'pump'],// tokenAddress
    poolAddress,//spenderAddress
    () => {}
  )

  const hasStakedForPool = (poolName: string) => {
    if(! stakedBalance || ! stakedBalance[poolName]) return false;
    if(typeof(stakedBalance[poolName]) == 'string') return Number(stakedBalance[poolName]) > 0;
    return stakedBalance[poolName].toNumber() > 0
  }

  const fetchMisesLegacyPoolRewardRate = useCallback(async () => {
    if(! account || ! velo) return;
    const rate = await getMisesLegacyPoolRewardRate(velo, account);
    setMisesLegacyPoolRewardRate(rate);
  }, [
    account,
    velo
  ])

  useEffect(() => {
    fetchMisesLegacyPoolRewardRate()
  }, [
    velo,
    account
  ])

  const handleDismissStakeModal = useCallback(() => {
    setStakeModalIsOpen(false)
  }, [setStakeModalIsOpen])

  const handleDismissUnstakeModal = useCallback(() => {
    setUnstakeModalIsOpen(false)
  }, [setUnstakeModalIsOpen])

  const handleOnStake = useCallback((poolName: string, amount: string) => {
    onStake(poolName, amount)
    handleDismissStakeModal()
  }, [handleDismissStakeModal, onStake])

  const handleOnUnstake = useCallback((poolName: string, amount: any) => {
    onUnstake(poolName, amount)
    handleDismissUnstakeModal()
  }, [
    handleDismissUnstakeModal,
    onUnstake,
  ])

  const handleStakeClick = useCallback(() => {
    setStakeModalIsOpen(true)
  }, [setStakeModalIsOpen])

  const handleUnstakeClick = useCallback(() => {
    setUnstakeModalIsOpen(true)
  }, [setUnstakeModalIsOpen])

  const handleFarmCardToggle = useCallback(() => {
    setFarmCardIsExpanded(! farmCardIsExpanded)
  }, [
    farmCardIsExpanded,
    setFarmCardIsExpanded
  ])

  const getPoolStatus = () => {
    if(! poolStatus) return {isStaking: false, isUnstaking: false, isHarvesting: false};
    const lePoolStatus = poolStatus[getPoolName()];
    if(! lePoolStatus) return {isStaking: false, isUnstaking: false, isHarvesting: false};
    return {
      isStaking: lePoolStatus.isStaking || false,
      isUnstaking: lePoolStatus.isUnstaking || false,
      isHarvesting: lePoolStatus.isHarvesting || false
    }
  }

  const format = (value: any) => {
    return value > 0 ? numeral(value).format('0.00a') : '--';
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

  const getTotalStakedInTokens = useCallback(() => {
    let totalDeposited = 0;
    if(totalStakedForPool && totalStakedForPool[getPoolName()]) {
      totalDeposited = bnToDec(new BigNumber(totalStakedForPool[getPoolName()]));
    }
    return totalDeposited;
  }, [
    totalStakedForPool
  ])

  const getTotalDepositedInUsd = useCallback((price: any, coinName: string) => {
    const coinPriceInUsd = getPrice(price, coinName);
    let totalDeposited = getTotalStakedInTokens();
    if(! coinPriceInUsd || ! totalDeposited) return 0;
    return Number(coinPriceInUsd) * Number(totalDeposited);
  }, [
    price, totalStakedForPool
  ])

  const StakeButton = useMemo(() => {
    if (status !== 'connected') {
      return (
        <Button
          disabled
          full
          variant="secondary"
          classes="FarmCard-stakeButton flex-1 ml-1"
        >
          Stake
        </Button>
      )
    }
    if (getPoolStatus().isStaking) {
      return (
        <Button
          disabled
          full
          variant="secondary"
          classes="FarmCard-stakeButton flex-1 ml-1"
        >
          Staking...
        </Button>
      )
    }
    if (! isApproved) {
      return (
        <Button
          disabled={isApproving}
          full
          onClick={onApprove}
          variant={isApproving || status !== 'connected' ? 'secondary' : 'default'}
          classes="FarmCard-stakeButton flex-1 ml-1"
        >
          {!isApproving ? "Unlock" : "Unlocking..."}
        </Button>
      )
    }

    if (isApproved) {
      return (
        <Button
          full
          onClick={handleStakeClick}
          classes="FarmCard-stakeButton flex-1 ml-1"
        >
          Stake
        </Button>
      )
    }
  }, [
    // countdown,
    handleStakeClick,
    isApproving,
    onApprove,
    status,
  ])

  const UnstakeButton = useMemo(() => {
    const hasStaked = hasStakedForPool(getPoolName())
    if (status !== 'connected' || !hasStaked) {
      return (
        <Button
          disabled
          full
          variant="secondary"
          classes="FarmCard-unstakeButton flex-1 mr-1"
        >
          Unstake
        </Button>
      )
    }
    if (getPoolStatus().isUnstaking) {
      return (
        <Button
          disabled
          full
          variant="secondary"
          classes="FarmCard-unstakeButton flex-1 mr-1"
        >
          Unstaking...
        </Button>
      )
    }
    return (
      <Button
        full
        onClick={handleUnstakeClick}
        variant="secondary"
        classes="FarmCard-unstakeButton flex-1 mr-1"
      >
        Unstake
      </Button>
    )
  }, [
    handleUnstakeClick,
    isApproving,
    onApprove,
    status,
  ])

  const getBalance = (balance: any) => {
    if (balance && balance[getPoolName()]) {
      return bnToDec(new BigNumber(balance[getPoolName()]));
    }
    return 0;
  }

  const formattedStakedBalance = (stakedBalance: any) => {
    if (stakedBalance && stakedBalance[getPoolName()]) {
      // return bnToDec(new BigNumber(stakedBalance[getPoolName()])).toFixed(2)
      const formatted = numeral(bnToDec(new BigNumber(stakedBalance[getPoolName()]))).format('0.00a');
      return isNaN(Number(formatted)) ? 0 : formatted;
    } else {
      return '--'
    }
  }

  const formattedEarnedBalance = (balance: any) => {
    if (balance && balance[getPoolName()]) {
      // return bnToDec(new BigNumber(balance[getPoolName()])).toFixed(2)
      const formatted = Number(bnToDec(new BigNumber(balance[getPoolName()]))).toFixed(2);
      return isNaN(Number(formatted)) ? 0 : formatted;
    } else {
      return '--'
    }
  }

  const didStake = (stakedBalance: any) => {
    const balance = getBalance(stakedBalance);
    return balance;
  }

  const hasEarned = (earnedBalance: any) => {
    const earned = getBalance(earnedBalance);
    return earned;
  }

  const getEmissionRatePerWeek = (poolName: string) => {
    if(poolName == 'dai_pool' || poolName == 'ycrv_pool') return 5000000;
    if(poolName == 'velo_eth_uni_pool') return 15000000;
    if(poolName == 'velo_eth_blp_pool') return 5000000;
    if(poolName == 'velo_eth_dai_pool' || poolName == 'velo_eth_usdc_pool' || poolName == 'velo_eth_usd_pool' || poolName == 'velo_eth_wbtc_pool') return 3000000;
    if(poolName == 'velo_eth_uni_legacy_pool') return getEmissionRatePerWeek_fromSeconds(
      new BigNumber(misesLegacyPoolRewardRate).dividedBy(new BigNumber(10).pow(18)).toNumber()
    ).toFixed(0);
    return 2000000;
  }

  const expandedFarmCard = hasStakedForPool(getPoolName()) || hasEarned(earnedBalance) || farmCardIsExpanded;

  const getStakedTokensForUser = () => {
    if(! stakedBalance || ! getPoolName() || ! stakedBalance[getPoolName()]) return;
    return bnToDec(new BigNumber(stakedBalance[getPoolName()]))
  }

  const getUsdValueStakedForUser = () => {
    if(! coinName) return 0;
    if(! price || ! price[veloCoinNameToCoinGeckoCoinName(coinName)]) return 0;
    return (getStakedTokensForUser()||0) * Number(price[veloCoinNameToCoinGeckoCoinName(coinName)]);
  }

  const getAPR = () => {
    const defaultReturnValue = false;
    // Params validation
    if(! coinName) return defaultReturnValue;
    if(! price || ! price[veloCoinNameToCoinGeckoCoinName(coinName)]) return defaultReturnValue;

    const stakedInTotal = getTotalStakedInTokens();
    const stakedUsdInTotal = getTotalDepositedInUsd(price, coinName || '')||0;
    const stakedByUser = getStakedTokensForUser()||0;

    if(! stakedUsdInTotal || stakedUsdInTotal <= 0) {
      return defaultReturnValue;
    }

    const percentageStaked = (100000 / stakedUsdInTotal)
    const weeklyVloRate = getEmissionRatePerWeek(getPoolName())
    const vloPrice = price['vlo'];
    const usdValueStakedByUser = getUsdValueStakedForUser();

    // if(coinName == 'velo_eth_dai')
    //   console.log(stakedUsdInTotal, "((Number(percentageStaked) * Number(weeklyVloRate) * Number(vloPrice) * 52) / 100000) * 100", percentageStaked, weeklyVloRate, vloPrice)
    // formula: APR = (((100000/tvl_pool_in_usd)*weekly_rate_in_usd * 52) / 100000) * 100
    // formula: APR = (((100000/tvl_pool_in_usd)*weekly_rate_in_usd * 52) / 100000) * 100
    const APR = ((Number(percentageStaked) * Number(weeklyVloRate) * Number(vloPrice) * 52) / 100000) * 100;

    // Convert to percentages, therefor times 100. I.e. 0.2 -> 20%
    return APR;
  }

  // You use the APR, which is based on 100K USD, but instead of yearly, you calculate it daily, then you compound it 356 times. So for example: per day, based on 100K one can make a 0.26% APR per day. The APY becomes: (1+0.0026)^365
  // But to calculate the APY you need the DPR
  // Daily rate not the weekly rate. This is without th *7.
  // And use the formula as discussed before to compound the yield.

  const getDPR = () => {
    const defaultReturnValue = false;
    // Params validation
    if(! coinName) return defaultReturnValue;
    if(! price || ! price[veloCoinNameToCoinGeckoCoinName(coinName)]) return defaultReturnValue;

    const stakedInTotal = getTotalStakedInTokens();
    const stakedUsdInTotal = getTotalDepositedInUsd(price, coinName || '')||0;
    const stakedByUser = getStakedTokensForUser()||0;

    const weeklyVloRate = getEmissionRatePerWeek(getPoolName())
    const vloPrice = price['vlo'];

    // When tvl_pool_in_usd = 0, you will always get 100% of the pool as such the projected DPR simplifies to: (daily_rate_in_usd * current_price_of_velo) / 100_000
    if(! stakedUsdInTotal || stakedUsdInTotal <= 0) {
      return ((Number(weeklyVloRate)/7) * Number(vloPrice)) / 100000;
    }

    const percentageStaked = Math.min(100000 / stakedUsdInTotal, 1)
    const usdValueStakedByUser = getUsdValueStakedForUser();

    // formula: DPR = (min(1, (100_000 / tvl_pool_in_usd))*daily_rate_in_usd * current_price_of_velo) / 100_000
    const DPR = ((Number(percentageStaked) * (Number(weeklyVloRate)/7) * Number(vloPrice)) / 100000);

    return DPR;
  }

  const getAPY = () => {
    const APY = (Math.pow(1 + (getDPR() || 0), 365) - 1) * 100;
    return APY;
  }

  // const isFoundationPool = poolName == 'velo_eth_uni_pool' || poolName == 'velo_eth_blp_pool'
  const isEvilMisesPool = poolName == 'velo_eth_blp_pool'
  const isDoubleReturnName = poolName == 'velo_eth_dai_pool' || poolName == 'velo_eth_usdc_pool' || poolName == 'velo_eth_usd_pool' || poolName == 'velo_eth_wbtc_pool'
  const isLegacyPool = poolName == 'velo_eth_uni_legacy_pool'

  return (
    <div>
      <Block classes={`
        FarmCard
        ${disabled ? 'disabled' : ''}
        ${(didStake(stakedBalance) || earnedBalance) ? ' is-glowing' : ''}
        Block-expandable
      `} style={{
        borderColor: poolName == 'velo_eth_uni_pool' || poolName == 'velo_eth_uni_legacy_pool' ? '#fd027c' : '#fff'
      }}>
        <img src={icon} alt="Coin icon" className="FarmCard-icon mt-1" style={{marginTop: '50px'}}/>
        <h1 className="FarmCard-title my-2 mt-4">
          <span>{title}</span> {emoticon}
        </h1>
        <h2 className="FarmCard-name my-2">
          Deposit {name}, earn VLO
        </h2>
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          marginBottom: '60px'
        }}>
          {poolName == 'velo_eth_blp_pool' && <div>
            <div className="FarmCard-value-locked my-4">
               Total deposited: {format(getTotalStakedInTokens())} tokens
            </div>
          </div>}
          {getTotalDepositedInUsd(price, coinName || '') > 0 && <div className="FarmCard-value-locked my-4">
            Total deposited: 
              $ {format(getTotalDepositedInUsd(price, coinName || ''))}
          </div>}
          <div className="FarmCard-value-locked my-4">
            VLO release/week: {getEmissionRatePerWeek(getPoolName())}
          </div>
          {poolName != 'velo_eth_uni_legacy_pool' && ! isEvilMisesPool && ! disabled && getAPR() && <div
            className="FarmCard-value-locked my-4 text-center"
            >
            APR = {Number(getAPR()).toFixed(1)} %
          </div>}
          {poolName == 'velo_eth_uni_legacy_pool' && getDPR() && <div
            className="FarmCard-value-locked my-4 text-center"
            >
            APY = {Number(getAPY()).toFixed(1)} %
          </div>}
        </div>
        {(! expandedFarmCard && poolAddress) && <div className={`FarmCard-contract p-2 -ml-4 -mr-4 ${! expandedFarmCard ? '' : ''}`}>
          <a href={`https://etherscan.io/address/${poolAddress}`} target="_blank" rel="external" className="FarmCard-contract-link">
            contract link
          </a>
        </div>}

        {expandedFarmCard && <div className="mb-4 relative">
          <div className="FarmCard-value-locked my-4">
            VLO earned: {formattedEarnedBalance(earnedBalance)}
          </div>
          {! isLegacyPool && <div className="FarmCard-value-locked my-4">
            Total staked: {formattedStakedBalance(stakedBalance)}
          </div>}
          {! isEvilMisesPool && <div className="FarmCard-value-locked my-4">
            Total staked USD: $ {format(getUsdValueStakedForUser())}
          </div>}

          <div className="
            flex justify-between mt-2
          ">
            {didStake(stakedBalance) ? UnstakeButton : ''}
            {! disabled && StakeButton}
          </div>
          {earnedBalance && <div className="mt-4">
            <Harvest
              poolName={getPoolName()}
              />
          </div>}
          {(disabled && ! isApproved) &&
            <div className="absolute top-0 right-0 bottom-0 left-0" />
          }
        </div>}

        {! expandedFarmCard && <div className="Block-expendable-toggle arrow-down py-2 -mb-2 -mx-4" onClick={handleFarmCardToggle}>
          
        </div>}

        {(expandedFarmCard && poolAddress) && <div className={`FarmCard-contract p-2 -ml-4 -mr-4 ${! expandedFarmCard ? '' : ''}`}>
          <a href={`https://etherscan.io/address/${poolAddress}`} target="_blank" rel="external" className="FarmCard-contract-link">
            contract link
          </a>
        </div>}

        {(expandedFarmCard && ! hasStakedForPool(getPoolName())) && <div className="Block-expendable-toggle arrow-up py-2 -mb-2 -mx-4" onClick={handleFarmCardToggle}>
          
        </div>}

      </Block>
      <StakeModal
        coinName={coinName || ''}
        poolName={getPoolName()}
        isOpen={stakeModalIsOpen}
        onDismiss={handleDismissStakeModal}
        onStake={handleOnStake}
      />
      <UnstakeModal
        coinName={coinName || ''}
        poolName={getPoolName()}
        isOpen={unstakeModalIsOpen}
        onDismiss={handleDismissUnstakeModal}
        onUnstake={handleOnUnstake}
      />
    </div>
  )
}

export default FarmCard
