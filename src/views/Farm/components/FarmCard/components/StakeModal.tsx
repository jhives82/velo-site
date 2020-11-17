import React, { useCallback, useMemo, useState } from 'react'

import BigNumber from 'bignumber.js'
import {
  ModalActions,
  ModalContent,
  ModalProps,
} from 'react-neu'
import Button from 'components/Button/Button'
import {
  Modal,
  ModalTitle
} from 'components/Modal/index'

import TokenInput from 'components/TokenInput'
import useBalances from 'hooks/useBalances'
import { getFullDisplayBalance } from 'utils'

interface StakeModalProps extends ModalProps {
  coinName?: string,
  poolName: string,
  onStake: (poolName: string, amount: string) => void,
}

const StakeModal: React.FC<StakeModalProps> = ({
  coinName,
  poolName,
  isOpen,
  onDismiss,
  onStake,
}) => {

  const [val, setVal] = useState('')
  const {
    balance
  } = useBalances()

  const fullBalance = useMemo(() => {
    if(balance && balance[coinName || '']) {
      return getFullDisplayBalance(balance[coinName || ''] || new BigNumber(0), 0);
    }
    return getFullDisplayBalance(new BigNumber(0), 0);
  }, [
    balance
  ])

  const handleChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setVal(e.currentTarget.value)
  }, [setVal])

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance)
  }, [fullBalance, setVal])

  const handleStakeClick = useCallback(() => {
    onStake(poolName, val)
  }, [onStake, val])

  const getSymbol = () => {
    const poolNamesToConvert: any = {
      'velo_eth_uni_pool': 'VLO/ETH UNI-V2',
      'velo_eth_blp_pool': 'VLO/ETH BLP',
      'velo_eth_dai_pool': 'ETH/DAI UNI-V2',
      'velo_eth_usdc_pool': 'ETH/USDC UNI-V2',
      'velo_eth_usd_pool': 'ETH/USDT UNI-V2',
      'velo_eth_wbtc_pool': 'ETH/WBTC UNI-V2'
    }
    const converter = (poolName: string) => {
      return poolNamesToConvert[poolName] || poolName.replace('_pool', '');
    }
    return converter(poolName);
  }

  return (
    <Modal isOpen={isOpen}>
      <ModalTitle>
        Stake
      </ModalTitle>
      <ModalContent>
        <TokenInput
          value={val}
          onSelectMax={handleSelectMax}
          onChange={handleChange}
          max={fullBalance}
          symbol={getSymbol()}
        />
      </ModalContent>
      <div
        className="flex justify-end"
        style={{paddingRight: '24px', paddingLeft: '24px'}}
        >
        <Button
          onClick={onDismiss}
          classes="btn-theme mr-2"
        >
          Cancel
        </Button>
        <Button
          disabled={!val || !Number(val)}
          onClick={handleStakeClick}
          classes="btn-theme ml-2"
        >
          Stake
        </Button>
      </div>
    </Modal>
  )
}

export default StakeModal