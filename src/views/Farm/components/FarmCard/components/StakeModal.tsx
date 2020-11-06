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
    ycrvBalance,
    veloBalance,
    daiBalance,
    pumpBalance,
    veloEthBlpBalance,
    veloEthUniBalance,
  } = useBalances()

  const fullBalance = useMemo(() => {
    if(coinName == 'pump') {
      return getFullDisplayBalance(pumpBalance || new BigNumber(0), 0);
    } else if(coinName == 'ycrv') {
      return getFullDisplayBalance(ycrvBalance || new BigNumber(0), 0);
    } else if (coinName == 'dai') {
      return getFullDisplayBalance(daiBalance || new BigNumber(0), 0);
    } else if (coinName == 'velo_eth_blp') {
      return getFullDisplayBalance(veloEthBlpBalance || new BigNumber(0), 0);
    } else if (coinName == 'velo_eth_uni') {
      return getFullDisplayBalance(veloEthUniBalance || new BigNumber(0), 0);
    } else {
      return getFullDisplayBalance(new BigNumber(0), 0);
    }
  }, [ycrvBalance, daiBalance, veloEthBlpBalance, veloEthUniBalance])

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
    if(poolName == 'velo_eth_uni_pool') {
      return 'VELO/ETH UNI-V2';
    }
    if(poolName == 'velo_eth_blp_pool') {
      return 'BLP VELO/ETH';
    }
    return poolName.replace('_pool', '');
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