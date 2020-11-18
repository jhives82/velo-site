import React, { useCallback, useState, useMemo } from 'react'
import numeral from 'numeral'
import { bnToDec, decToBn } from 'utils'
import { getFullDisplayBalance } from 'utils'

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

import useBalances from 'hooks/useBalances'
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

  const {
    balance
  } = useBalances()

  const [val, setVal] = useState('')
  const [valueInSatoshis, setValueInSatoshis] = useState('')
  const { stakedBalance } = useFarming()

  const fullBalance = (stakedBalance: any) => {
    if (stakedBalance && stakedBalance[poolName]) {
      return stakedBalance[poolName];
    }
    return new BigNumber(0);
  }

  // const fullBalanceNew = useMemo(() => {
  //   if(balance && balance[coinName || '']) {
  //     return getFullDisplayBalance(balance[coinName || ''] || new BigNumber(0), 0);
  //   }
  //   return getFullDisplayBalance(new BigNumber(0), 0);
  // }, [
  //   balance
  // ])

  const displayFullBalance = (stakedBalance: any) => {
    if (stakedBalance && stakedBalance[poolName]) {
      const formatted = numeral(bnToDec(stakedBalance[poolName])).format('0.00a')
      return isNaN(Number(formatted)) ? bnToDec(stakedBalance[poolName]).toFixed(6) : formatted;
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
    setVal(fullBalanceInTokens.toFixed(100))
  }, [
    fullBalance,
    setVal,
    setValueInSatoshis
  ])

  const handleUnstakeClick = useCallback(() => {
    console.log('Going to unstake this valueInSatoshis: ', valueInSatoshis.toString())
    onUnstake(poolName, valueInSatoshis.toString())
  }, [
    onUnstake,
    val,
    valueInSatoshis
  ])

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