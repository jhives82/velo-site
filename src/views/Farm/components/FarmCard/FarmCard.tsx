import React, { useCallback, useMemo, useState } from 'react'
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
  veloCoinNameToCoinGeckoCoinName
} from 'utils'

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

  const { velo } = useVelo()
  const { status } = useWallet()

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
    // if(coinName == 'velo_eth_uni') {
    //   console.log('price', price, coinName, 'coinPriceInUsd', coinPriceInUsd)
    // }
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

  const formattedStakedBalance = (stakedBalance: any) => {
    if (stakedBalance && stakedBalance[getPoolName()]) {
      return numeral(bnToDec(new BigNumber(stakedBalance[getPoolName()]))).format('0.00a')
    } else {
      return '--'
    }
  }

  const didStake = (stakedBalance: any) => {
    const balance = formattedStakedBalance(stakedBalance);
    return (balance != '0.00' && balance != '--');
  }

  const getEmissionRatePerWeek = (poolName: string) => {
    if(poolName == 'dai_pool' || poolName == 'ycrv_pool') return 5000000;
    if(poolName == 'velo_eth_uni_pool') return 15000000;
    if(poolName == 'velo_eth_blp_pool') return 5000000;
    if(poolName == 'velo_eth_dai_pool' || poolName == 'velo_eth_usdc_pool' || poolName == 'velo_eth_usd_pool' || poolName == 'velo_eth_wbtc_pool') return 3000000;
    return 2000000;
  }

  const expandedFarmCard = hasStakedForPool(getPoolName()) || farmCardIsExpanded;

  const getStakedTokensForUser = () => {
    if(! stakedBalance || ! getPoolName() || ! stakedBalance[getPoolName()]) return;
    return bnToDec(new BigNumber(stakedBalance[getPoolName()]))
  }

  const getUsdValueStakedForUser = () => {
    if(! coinName) return;
    if(! price || ! price[veloCoinNameToCoinGeckoCoinName(coinName)]) return;
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

    const percentageStaked = (100000 / stakedUsdInTotal)
    const weeklyVloRate = getEmissionRatePerWeek(getPoolName())
    const vloPrice = price['vlo'];
    const usdValueStakedByUser = getUsdValueStakedForUser();

    // if(coinName == 'velo_eth_uni')
    //   console.log(stakedUsdInTotal, "((Number(percentageStaked) * Number(weeklyVloRate) * Number(vloPrice) * 52) / 100000) * 100", percentageStaked, weeklyVloRate, vloPrice)
    // formula: APR = (((100000/tvl_pool_in_usd)*weekly_rate_in_usd * 52) / 100000) * 100
    // formula: APR = (((100000/tvl_pool_in_usd)*weekly_rate_in_usd * 52) / 100000) * 100
    const APR = ((Number(percentageStaked) * Number(weeklyVloRate) * Number(vloPrice) * 52) / 100000) * 100;

    // Convert to percentages, therefor times 100. I.e. 0.2 -> 20%
    return APR;
  }

  const isFoundationPool = poolName == 'velo_eth_uni_pool' || poolName == 'velo_eth_blp_pool'
  const isEvilMisesPool = poolName == 'velo_eth_blp_pool'

  return (
    <div>
      <Block classes={`
        FarmCard
        ${disabled ? 'disabled' : ''}
        ${didStake(stakedBalance) ? ' is-glowing' : ''}
        Block-expandable
      `} style={{
        borderColor: poolName == 'velo_eth_uni_pool' ? '#fd027c' : '#fff'
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
          <div className="FarmCard-value-locked my-4">
            Total deposited: {getTotalDepositedInUsd(price, coinName || '') > 0 ? <span>
              $ {format(getTotalDepositedInUsd(price, coinName || ''))}
            </span> : <span>
              {format(getTotalStakedInTokens())} tokens
            </span>}
          </div>
          <div className="FarmCard-value-locked my-4">
            VLO release/week: {getEmissionRatePerWeek(getPoolName())}
          </div>
          {! isEvilMisesPool && getAPR() && <div
            className="FarmCard-value-locked my-4 text-center"
            >
            APR = {Number(getAPR()).toFixed(1)} %
          </div>}
        </div>
        {(! expandedFarmCard && poolAddress) && <div className={`FarmCard-contract p-2 -ml-4 -mr-4 ${! expandedFarmCard ? '' : ''}`}>
          <a href={`https://etherscan.io/address/${poolAddress}`} target="_blank" rel="external" className="FarmCard-contract-link">
            contract link
          </a>
        </div>}

        {expandedFarmCard && <div className="mb-4 relative">
          <div className="FarmCard-value-locked my-4">
            VLO earned: {formattedStakedBalance(earnedBalance)}
          </div>
          <div className="FarmCard-value-locked my-4">
            Total staked: {formattedStakedBalance(stakedBalance)}
          </div>
          {! isEvilMisesPool && <div className="FarmCard-value-locked my-4">
            Total staked USD: $ {format(getUsdValueStakedForUser())}
          </div>}

          <div className="
            flex justify-between mt-2
          ">
            {didStake(stakedBalance) && UnstakeButton}
            {StakeButton}
          </div>
          {earnedBalance && <div className="mt-4">
            <Harvest
              poolName={getPoolName()}
              />
          </div>}
          {disabled &&
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
