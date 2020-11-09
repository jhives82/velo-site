import React, { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import numeral from 'numeral'
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardIcon,
} from 'react-neu'
import { useWallet } from 'use-wallet'

import Label from 'components/Label'
import Value from 'components/Value'
import Button from 'components/Button/Button'

import useFarming from 'hooks/useFarming'

import { bnToDec } from 'utils'

interface HarvestProps {
  poolName: string,
}

interface PoolStatus {
  isStaking: boolean,
  isUnstaking: boolean,
  isHarvesting: boolean
}

const Harvest: React.FC<HarvestProps> = ({
  poolName
}) => {
  const {
    poolStatus,
    earnedBalance,
    isHarvesting,
    onHarvest,
  } = useFarming()

  const getPoolStatus = () => {
    if(! poolStatus) return {isStaking: false, isUnstaking: false, isHarvesting: false};
    const lePoolStatus = poolStatus[poolName];
    if(! lePoolStatus) return {isStaking: false, isUnstaking: false, isHarvesting: false};
    return {
      isStaking: lePoolStatus.isStaking || false,
      isUnstaking: lePoolStatus.isUnstaking || false,
      isHarvesting: lePoolStatus.isHarvesting || false
    }
  }

  const { status } = useWallet()

  const handleOnHarvest = useCallback(() => {
    onHarvest(poolName)
  }, [onHarvest])

  const HarvestAction = useMemo(() => {
    if (status !== 'connected') {
      return (
        <Button
          classes="FarmCard-stakeButton ml-1 w-full"
          disabled
        >
          Harvest
        </Button>
      )
    }
    if (!getPoolStatus().isHarvesting) {
      return (
        <Button
          classes="FarmCard-stakeButton ml-1 w-full"
          onClick={handleOnHarvest}
        >
          Harvest
        </Button>
      )
    }
    if (getPoolStatus().isHarvesting) {
      return (
        <Button
          classes="FarmCard-stakeButton ml-1 w-full"
          disabled
        >
          Harvesting...
        </Button>
      )
    }
  }, [
    isHarvesting,
    onHarvest,
  ])

  const formattedEarnedBalance = (earnedBalance: any) => {
    if (earnedBalance && earnedBalance[poolName]) {
      return numeral(bnToDec(new BigNumber(earnedBalance[poolName]))).format('0.00a')
    } else {
      return '--'
    }
  }

  const hasVloToHarvest = ! (
    formattedEarnedBalance(earnedBalance) == '0.00'
    || formattedEarnedBalance(earnedBalance) == '--'
  );

  // console.log('hasVloToHarvest', hasVloToHarvest, formattedEarnedBalance(earnedBalance))

  return <div>
    {hasVloToHarvest ? HarvestAction : ''}
  </div>

  return (
    <div className="flex justify-between mt-4 my-2">
      <div className="flex flex-col justify-center flex-1">
        <div className="text-sm">
          {formattedEarnedBalance(earnedBalance)} VLO harvested
        </div>
      </div>
      <div className="flex-1">
        {hasVloToHarvest ? HarvestAction : ''}
      </div>
    </div>
  )
}

export default Harvest
