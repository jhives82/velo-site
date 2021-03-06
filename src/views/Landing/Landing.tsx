import React, { useCallback} from 'react'
import BigNumber from 'bignumber.js'
import { addressMap } from 'velo-sdk/lib/lib/constants.js';
// import {
//   getTotalSupply,
// } from 'velo-sdk/utils'

import { useWallet } from 'use-wallet'
import numeral from 'numeral'

import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import WalletButton from 'components/TopBar/components/WalletButton'

import Pools from '../../components/Pools/Pools'
import Block from '../../components/Block/Block'
import Rocket from '../../components/Rocket/Rocket'
import QuickStats from '../../components/QuickStats/QuickStats'

import PendingHarvest from './components/PendingHarvest'
import SocialIcons from 'components/SocialIcons/SocialIcons'

import useBalances from 'hooks/useBalances'

import './Landing.css';

const Landing: React.FC = () => {

  interface CoinInfo {
    address: string,
    symbol: string,
    icon?: string
  }

  // Init wallet
  const { status, connect } = useWallet()
  
  const {
    veloBalance
  } = useBalances()

  const getDisplayBalance = useCallback((value?: BigNumber) => {
    if (value) {
      return numeral(value).format('0.00a')
    } else {
      return '--'
    }
  }, [veloBalance])

  const veloTokenInfo: CoinInfo = {
    address: addressMap.VELO,
    symbol: 'VLO',
    icon: ''
  }

  const addToken = (tokenInfo: CoinInfo) => {
    if (! window.hasOwnProperty('ethereum')) {
      return;
    }

    window.ethereum.sendAsync({
        method: 'wallet_watchAsset',
        params: {
          "type":"ERC20",
          "options":{
            "address": tokenInfo.address,
            "symbol": tokenInfo.symbol,
            "decimals": 18,
            "image": tokenInfo.icon,
          },
        },
        id: Math.round(Math.random() * 100000),
    }, (err: any, added: any) => {
      if (added) {
        console.log('Thanks for your interest!')
      } else {
        alert('Something went wrong. Is Metamask there?')
      }
    })
  };

  return (
    <Page>
      <div className="Landing">

        <PageHeader />

        <br />

        <div className="
          mt-4
          flex justify-center
        ">
          <Block classes="
            py-4 w-full
            Landing-userStats
            px-4
            block md--flex
          ">
            <div className="block md--flex w-full md--w-auto">
              <div className="
                my-2
                mx-2
                letter-spacing-velo
                text-shadow-velo
                font-bold
              ">
                Your Balance
              </div>
              <div className="
                my-2
                mx-2
                letter-spacing-velo
                text-shadow-velo
                text-yellow-theme
                font-bold
              ">
                {getDisplayBalance(veloBalance)} VLO
              </div>
            </div>
            <div className="w-6">
            </div>
            <div className="block md--flex w-full md--w-auto">
              <div className="
                my-2
                mx-2
                letter-spacing-velo
                text-shadow-velo
                font-bold
              ">
                Pending harvest
              </div>
              <div className="
                my-2
                mx-2
                letter-spacing-velo
                text-shadow-velo
                text-yellow-theme
                font-bold
              ">
                <PendingHarvest /> VLO
              </div>
            </div>
          </Block>
        </div>

        <SocialIcons/>

        <br />
        <br />

        <div className="my-1">
          {status != 'connected' && <WalletButton />}
          {status == 'connected' && <Pools />}
        </div>

        {status == 'connected' && <div className="my-8">

          <a
            onClick={() => {
              addToken(veloTokenInfo);
            }}
            className="
              my-4
              btn-theme
              Landing-addVloTokenButton
            "
          >
            Add VLO token
          </a>

        </div>}

        <Rocket />

      </div>
    </Page>
  )
}

export default Landing
