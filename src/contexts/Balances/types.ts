import BigNumber from 'bignumber.js'

interface Balances {
  [key: string]: BigNumber;
}

export interface ContextValues {
  balance: Balances,
}
