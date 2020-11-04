import BigNumber from 'bignumber.js'

interface PoolStatus {
  isStaking: boolean,
  isUnstaking: boolean,
  isHarvesting: boolean
}

interface PoolInfo {
  startTime: number,
  duration: number,
  balance: number,
  vloBalance: number
}

interface Price {
  [key: string]: Number
}

export interface ContextValues {
  countdown?: number,
  poolContracts?: object,
  farmingStartTime: number,
  // isApproved?: boolean,
  // isApproving?: boolean,
  isHarvesting?: boolean,
  isRedeeming?: boolean,
  isStaking?: boolean,
  isUnstaking?: boolean,
  onApprove: () => void,
  onHarvest: (poolName: string) => void,
  onRedeem: () => void,
  onStake: (poolName: string, amount: string) => void,
  onUnstake: (poolName: string, amount: string) => void,
  earnedBalance?: { [key: string]: BigNumber },
  stakedBalance?: { [key: string]: BigNumber },
  poolStatus?: { [key: string]: PoolStatus },
  poolInfo?: { [key: string]: PoolInfo },
  totalStakedBalance?: BigNumber,
  totalStakedForPool?: { [key: string]: BigNumber },
  totalSupply?: BigNumber,
  relativeVelocity?: BigNumber,
  price?: Price,
}
