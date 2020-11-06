import React, { useCallback, useEffect } from 'react'
import {
  Box,
  ModalActions,
  ModalContent,
  ModalProps,
  Spacer,
} from 'react-neu'
import Button from 'components/Button/Button';
import {
  Modal,
  ModalTitle
} from 'components/Modal';
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import { NetworkConnector } from '@web3-react/network-connector'

import metamaskLogo from 'assets/metamask-fox.svg'
import walletConnectLogo from 'assets/wallet-connect.svg'

import WalletProviderCard from './components/WalletProviderCard'

const UnlockWalletModal: React.FC<ModalProps> = ({
  isOpen,
  onDismiss,
}) => {
  const { account, connect } = useWallet()

  const handleConnectMetamask = useCallback(() => {
    connect('injected')
  }, [connect])

  const handleConnectWalletConnect = useCallback(() => {
    connect('walletconnect')
  }, [connect])

  useEffect(() => {
    if (account) {
      onDismiss && onDismiss()
    }
  }, [account, onDismiss])

  return (
    <Modal isOpen={isOpen}>
      <ModalTitle>
        Select a wallet provider
      </ModalTitle>
      <ModalContent>
        <StyledWalletsWrapper>
          <Box flex={1}>
            <WalletProviderCard
              icon={<img src={metamaskLogo} style={{ height: 32 }} />}
              name="Metamask"
              onSelect={handleConnectMetamask}
            />
          </Box>
          <Spacer />
          <Box flex={1}>
            <WalletProviderCard
              icon={<img src={walletConnectLogo} style={{ height: 24 }} />}
              name="WalletConnect"
              onSelect={handleConnectWalletConnect}
            />
          </Box>
        </StyledWalletsWrapper>
      </ModalContent>
      <div className="flex justify-center">
        <Button
          onClick={onDismiss}
          classes="btn-theme"
          >
          Cancel
        </Button>
      </div>
    </Modal>
  )
}

const StyledWalletsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  @media (max-width: 600px) {
    flex-direction: column;
    flex-wrap: none;
  }
`

export default UnlockWalletModal