import React, { useCallback, useState } from 'react'
import numeral from 'numeral'
import { bnToDec, decToBn } from 'utils'

import BigNumber from 'bignumber.js'
import {
  ModalContent,
  ModalProps,
} from 'react-neu'
import Button from 'components/Button/Button'

import {
  Modal,
  ModalTitle
} from 'components/Modal/index'

import TokenInput from 'components/TokenInput'

import useFarming from 'hooks/useFarming'

interface UnstakeModalProps extends ModalProps {
  coinName: string,
  poolName: string,
  onUnstake: (poolName: string, amount: string) => void
}

const UnstakeModal: React.FC<UnstakeModalProps> = ({
  coinName,
  poolName,
  isOpen,
  onDismiss,
  onUnstake,
}) => {

  const [val, setVal] = useState('')
  const [valInSatoshis, setValueInSatoshis] = useState('')
  const { stakedBalance } = useFarming()

  const fullBalance = (stakedBalance: any) => {
    if (stakedBalance && stakedBalance[poolName]) {
      return stakedBalance[poolName];
    }
    return new BigNumber(0);
  }

  const displayFullBalance = (stakedBalance: any) => {
    if (stakedBalance && stakedBalance[poolName]) {
      return numeral(bnToDec(stakedBalance[poolName])).format('0.00a')
    }
    return '0';
  }

  const handleChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setVal(e.currentTarget.value)
    // setValueInSatoshis(decToBn(e.currentTarget.value))
    setValueInSatoshis(new BigNumber(e.currentTarget.value).times(new BigNumber(10).pow(18)).toString())
  }, [setVal])

  const handleSelectMax = useCallback(() => {
    const fullBalanceInSatoshis = fullBalance(stakedBalance)
    setValueInSatoshis(fullBalanceInSatoshis)
    const fullBalanceInTokens = bnToDec(fullBalanceInSatoshis)
    setVal(fullBalanceInTokens.toString())
  }, [
    fullBalance,
    setVal,
    setValueInSatoshis
  ])

  const handleUnstakeClick = useCallback(() => {
    onUnstake(poolName, valInSatoshis)
  }, [
    onUnstake,
    val,
    valInSatoshis
  ])

  const getSymbol = () => {
    if(poolName == 'velo_eth_uni_pool' || poolName == 'velo_eth_blp_pool') {
      return 'ETH';
    }
    return poolName.replace('_pool', '');
  }

  return (
    <Modal isOpen={isOpen}>
      <ModalTitle>
        Unstake
      </ModalTitle>
      <ModalContent>
        <TokenInput
          value={val}
          onSelectMax={handleSelectMax}
          onChange={handleChange}
          max={displayFullBalance(stakedBalance)}
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
          onClick={handleUnstakeClick}
          classes="btn-theme mr-2"
        >
          Unstake
        </Button>
      </div>
    </Modal>
  )
}

export default UnstakeModal