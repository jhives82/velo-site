import React, { useCallback, useEffect, useState } from 'react'
import moment from 'moment';

import Countdown, { CountdownRenderProps} from 'react-countdown'
import { getCache, setCache, getDiffInSeconds } from 'utils/cache'
import {
  Box,
  Card,
  CardContent,
  CardIcon,
  ModalContent,
  ModalActions,
  Spacer,
} from 'react-neu'
import {
  Modal,
  ModalTitle
} from 'components/Modal';
import Button from 'components/Button/Button'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'

import Dial from 'components/Dial'
import Label from 'components/Label'

import UnlockWalletModal from 'components/UnlockWalletModal'
import WalletModal from 'components/WalletModal'

import useVelo from 'hooks/useVelo'
import useFarming from 'hooks/useFarming'

import './Rebase.css'

import { getLastRebaseTimestamp, getNextRebaseTimestamp, getNextRebaseInSecondsRemaining } from 'velo-sdk/utils'

const Rebase: React.FC = () => {
  const { velo } = useVelo()
  const { account } = useWallet()

  const {
    nextRebaseTimestamp,
    lastRebaseTimestamp,
  } = useFarming()

  const [walletModalIsOpen, setWalletModalIsOpen] = useState(false)
  const [unlockModalIsOpen, setUnlockModalIsOpen] = useState(false)

  const [rebaseWarningModal, setRebaseWarningModal] = useState(false)
  const [time, setTime] = useState(0)

  const handleDismissUnlockModal = useCallback(() => {
    setUnlockModalIsOpen(false)
  }, [setUnlockModalIsOpen])

  const handleDismissWalletModal = useCallback(() => {
    setWalletModalIsOpen(false)
  }, [setWalletModalIsOpen])

  const handleUnlockWalletClick = useCallback(() => {
    setUnlockModalIsOpen(true)
  }, [setUnlockModalIsOpen])

  // Reload every .5 second
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      setTime(Date.now());
    }, 500)
    return () => clearInterval(refreshInterval)
  }, [setTime])

  const handleRebaseClick = useCallback(async () => {
    if (!velo) return
    await velo.contracts.rebaser.methods.rebase().send({
      from: account, gas: 500000
    })
    // Hide modal
    setRebaseWarningModal(false)
  }, [account, velo])

  const renderer = (countdownProps: CountdownRenderProps) => {
    const { hours, minutes, seconds } = countdownProps
    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const paddedHours = hours < 10 ? `0${hours}` : hours
    return (
      <span>{paddedHours}:{paddedMinutes}:{paddedSeconds}</span>
    )
  }

  const renderCountdown = (nextRebaseTimestamp: any) => {
    const remainingDays = moment.unix(nextRebaseTimestamp).diff(moment(), 'days')
    const remainingHours = moment.unix(nextRebaseTimestamp).diff(moment(), 'hours') - (remainingDays * 24);
    const remainingMinutes = moment.unix(nextRebaseTimestamp).diff(moment(), 'minutes') - (remainingDays * 24 * 60) - (remainingHours * 60);
    const remainingSeconds = moment.unix(nextRebaseTimestamp).diff(moment(), 'seconds') - (remainingDays * 24 * 60 * 60) - (remainingHours * 60 * 60) - (remainingMinutes * 60);

    const paddedHours = remainingHours < 10 ? `0${remainingHours}` : remainingHours
    const paddedMinutes = remainingMinutes < 10 ? `0${remainingMinutes}` : remainingMinutes
    const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds

    if(nextRebaseTimestamp < moment().unix()) {
      return <div>
        00<div className="colon">&nbsp;:&nbsp;</div>00<div className="colon">&nbsp;:&nbsp;</div>00
      </div>
    }

    if(remainingDays == 1) {
      return (
        <div>
          {Number(paddedHours)+24}<div className="colon">&nbsp;:&nbsp;</div>{paddedMinutes}<div className="colon">&nbsp;:&nbsp;</div>{paddedSeconds}
        </div>
      )
    }

    return (
      <div>
        {paddedHours}<div className="colon">&nbsp;:&nbsp;</div>{paddedMinutes}<div className="colon">&nbsp;:&nbsp;</div>{paddedSeconds}
      </div>
    )
  }

  return (
    <div className="Rebase">
      <div className="Rocket-rebase-button">

        {<div
          className="
            Rocket-rebase-button--click-area
          "
          onClick={() => {
            if(account) {
              setRebaseWarningModal(true)
            } else {
              handleUnlockWalletClick()
            }
          }}
          style={{
            height: '100%',
            cursor: 'pointer'
          }}
          />} 
        <Modal isOpen={rebaseWarningModal}>
          <div className="my-4 px-4">
            {nextRebaseTimestamp > moment().unix() && <p>
              Easy tiger... let's wait until this countdown has finished,<br />shall we?
            </p>}
            {nextRebaseTimestamp < moment().unix() && <p>
              You can now rebase. Rebasing is possible once in the 12 hours. Use your power wisely.
            </p>}
            <div className="Rocket-rebase-countdown">
              {nextRebaseTimestamp > 0 && renderCountdown(nextRebaseTimestamp)}
            </div>
          </div>
          <div
            className="flex justify-center"
            style={{paddingRight: '24px', paddingLeft: '24px'}}
            >
            <Button
              onClick={() => setRebaseWarningModal(false)}
              classes="btn-theme mr-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRebaseClick}
              classes={`btn-theme ml-2 ${nextRebaseTimestamp < moment().unix() ? 'block': 'hidden'}`}
            >
              Confirm rebase
            </Button>
          </div>
        </Modal>

      </div>
      <div className="Rocket-rebase-countdown">
        {nextRebaseTimestamp > 0 && renderCountdown(nextRebaseTimestamp)}
        {nextRebaseTimestamp <= 0 && (<div>00<div className="colon">&nbsp;:&nbsp;</div>00<div className="colon">&nbsp;:&nbsp;</div>00</div>)}
      </div>
      <WalletModal
        isOpen={walletModalIsOpen} 
        onDismiss={handleDismissWalletModal}
      />
      <UnlockWalletModal
        isOpen={unlockModalIsOpen}
        onDismiss={handleDismissUnlockModal}
      />
    </div>
  )
}

const StyledCountdown = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`
const StyledCountdownText = styled.span`
  color: ${props => props.theme.colors.primary.main};
  font-size: 36px;
  font-weight: 700;
`

export default Rebase