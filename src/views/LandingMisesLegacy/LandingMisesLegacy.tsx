import React, { useCallback} from 'react'
import BigNumber from 'bignumber.js'
import { NavLink } from 'react-router-dom'
import { addressMap } from 'velo-sdk/lib/lib/constants.js';
import moment from 'moment';

// import {
//   getTotalSupply,
// } from 'velo-sdk/utils'

import { useWallet } from 'use-wallet'
import numeral from 'numeral'

import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import WalletButton from 'components/TopBar/components/WalletButton'
import Rebase from 'views/Home/components/Rebase'

import Pools from '../../components/Pools/Pools'
import Block from '../../components/Block/Block'
import Rocket from '../../components/Rocket/Rocket'
import QuickStats from '../../components/QuickStats/QuickStats'
import SocialIcons from 'components/SocialIcons/SocialIcons'
import ProposalButton from 'components/ProposalButton/ProposalButton'

import Pool from 'views/Farm/components/Pool/Pool'

import PendingHarvest from '../Landing/components/PendingHarvest'

import RebaseBlock from './components/RebaseBlock'

import useFarming from 'hooks/useFarming'
import useBalances from 'hooks/useBalances'

import '../Landing/Landing.css';
import './LandingMisesLegacy.css';

const LandingMisesLegacy: React.FC = () => {

  interface CoinInfo {
    address: string,
    symbol: string,
    icon?: string
  }

  // Init wallet
  const { status, connect } = useWallet()
  
  const {
    balance
  } = useBalances()

  const {
    totalStakedForPool,
  } = useFarming()

  const getDisplayBalance = useCallback((value?: BigNumber) => {
    if (value) {
      return numeral(value).format('0.00a')
    } else {
      return '--'
    }
  }, [
    // veloBalance
  ])

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

  const farmCoinsStage4 = [
    {
      title: 'MISES LEGACY',
      emoticon: '🦸‍',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png',
      name: 'VLO/ETH UNI-V2',
      pct: 30,
      poolName: 'velo_eth_uni_legacy_pool',
      coinName: 'velo_eth_uni',
    },
  ]

  const stage4Start = 1606737600;
  const stage4Duration = 31536000;
  const stage4End = Number(stage4Start) + stage4Duration;

  return (
    <Page>
      <div className="Landing">

        <QuickStats />

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
                {getDisplayBalance(balance['velo'])} VLO
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
          {<div className="
            flex
            justify-between
            flex-wrap
            px-4
          ">
            <div className="flex-1 relative">
              <Pool
                title="MISES LEGACY POOL"
                description={<div>
                  Add liquidity to the VLO-ETH pair on <a href="https://info.uniswap.org/pair/0x259E558892783fd8941EBBeDa694318C1C3d9263" target="_blank" className="text-white">Uniswap</a> to get VLO-ETH-V2 LP tokens.
                  Deposit those in the Pool below to get your share of the on going velocity determined rewards (VLO)
                </div>}
                coins={farmCoinsStage4}
                disabled={
                  moment() < moment.unix(stage4Start).utc()
                  || moment() > moment.unix(stage4End).utc()
                }
                timestampStartDistribution={stage4Start}
                timestampEndDistribution={stage4End}
                duration={stage4Duration}
                percentageDistributed={0}
                percentageToDistribute={0}
                />
            </div>
          </div>}

        </div>

        {(true || status == 'connected') && <div className="
          Landing-fixedMenu
        ">

          <a
            onClick={() => {
              addToken(veloTokenInfo);
            }}
            className="
              my-4
              hidden
              sm--block
              btn-theme
            "
          >
            Add VLO token
          </a>

          <NavLink
            exact
            to="/closed"
            className="
              hidden
              sm--block
              my-4
              btn-theme
            "
            >
            Closed pools
          </NavLink>

          <a
            href="https://snapshot.page/#/velotoken"
            rel="external"
            target="_blank"
            className="
              hidden
              sm--block
              my-4
              btn-theme
            "
            >
            Governance
          </a>

          {(false && status == 'connected') && <ProposalButton />}

        </div>}

        <Rocket />

      </div>
    </Page>
  )
}

export default LandingMisesLegacy
