import { createContext } from 'react'

import { ContextValues } from './types'

const Context = createContext<ContextValues>({
  onApprove: () => {},
  onHarvest: () => {},
  onRedeem: () => {},
  onStake: () => {},
  onUnstake: () => {},
  nextRebaseTimestamp: 0,
  lastRebaseTimestamp: 0
})

export default Context