import React, { useMemo } from 'react'

import {
  Box,
  Button,
  Container,
  Separator,
  Spacer,
} from 'react-neu';
import moment from 'moment';

import { useWallet } from 'use-wallet'

import './Pools.css';

import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import Split from 'components/Split'

import useFarming from 'hooks/useFarming'

import Pool from 'views/Farm/components/Pool/Pool'
import HarvestCard from 'views/Farm/components/Harvest'

const Pools: React.FC = () => {
  const farmCoinsStage0 = [
    {
      title: 'MAGIC MAKER',
      emoticon: '🧙',
      icon: '/components/FarmCard/dai-icon.png',
      name: 'DAI',
      coinName: 'dai',
      pct: 10
    },
    {
      title: 'CRYSTAL CURVE',
      emoticon: '🔮',
      icon: '/components/FarmCard/ycrv-icon.png',
      name: 'yCRV',
      coinName: 'ycrv',
      pct: 10
    },
  ]
  const farmCoinsStage1 = [
    {
      title: 'SUPER MISES',
      emoticon: '🦸‍',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png',
      name: 'VELO/ETH UNI-V2',
      pct: 30,
      poolName: 'velo_eth_uni_pool'
    },
    {
      title: 'EVIL MISES',
      emoticon: '🦹',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5728.png',
      name: 'BPT VELO/ETH',
      pct: 10,
      poolName: 'velo_eth_blp_pool'
    },
  ]

  const farmCoinsStage2 = [
    {
      title: 'UniDAI',
      emoticon: '🦄',
      icon: '/components/FarmCard/dai-icon.png',
      name: 'UNI-V2 LP ETH/DAI',
      pct: 6,
      poolName: 'velo_eth_dai_pool'
    },
    {
      title: 'UniUSDC',
      emoticon: '🦄',
      icon: 'https://static.coinpaprika.com/coin/usdc-usd-coin/logo.png?rev=10562849',
      name: 'UNI-V2 LP ETH/USDC',
      pct: 6,
      poolName: 'velo_eth_usdc_pool'
    },
    {
      title: 'UniUSDT',
      emoticon: '🦄',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
      name: 'UNI-V2 LP ETH/USD',
      pct: 6,
      poolName: 'velo_eth_usd_pool'
    },
    {
      title: 'UniWBTC',
      emoticon: '🦄',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png',
      name: 'UNI-V2 LP ETH/WBTC',
      pct: 6,
      poolName: 'velo_eth_wbtc_pool'
    },
  ]
  const farmCoinsStage3 = [
    {
      title: 'COMP COMPUTER',
      emoticon: '🤖',
      icon: 'https://static.coinpaprika.com/coin/comp-compoundd/logo.png?rev=10603555',
      name: 'COMP',
      pct: 2
    },
    {
      title: 'BRAVE AAVE',
      emoticon: '👻',
      icon: 'https://static.coinpaprika.com/coin/aave-new/logo.png?rev=10615311',
      name: 'AAVE',
      pct: 2
    },
    {
      title: 'GOBLIN LINK',
      emoticon: '👺',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png',
      name: 'LINK',
      pct: 2
    },
    {
      title: 'SLEEPY SYNTH',
      emoticon: '💊',
      icon: '/components/FarmCard/snx-icon.png',
      name: 'SNX',
      pct: 2
    },
    {
      icon: '/components/FarmCard/sushi-icon.png',
      emoticon: '🍣',
      title: 'SUPER SUSHI',
      name: 'SUSHI',
      pct: 2
    },
    {
      icon: '/components/FarmCard/pickle-icon.png',
      emoticon: '🥒',
      title: 'PICKLE RICK',
      name: 'PICKLE',
      pct: 2
    },
    {
      title: 'DEFI PIE',
      emoticon: '🥧',
      icon: 'https://raw.githubusercontent.com/pie-dao/brand/master/DOUGH%20Token/DOUGH2v.png',
      name: 'DOUGH',
      pct: 2
    },
    {
      icon: 'https://static.coinpaprika.com/coin/yfi-yearnfinance/logo.png?rev=10607907',
      emoticon: '👽',
      title: 'ALIEN ANDRE',
      name: 'YFI',
      pct: 2
    },
  ]
  const { status } = useWallet()
  const {
    isRedeeming,
    onRedeem,
    poolInfo,
  } = useFarming()

  const RedeemButton = useMemo(() => {
    if (status !== 'connected') {
      return (
        <Button
          disabled
          text="Harvest &amp; Unstake"
          variant="secondary"
        />
      )
    }
    if (!isRedeeming) {
      return (
        <Button
          onClick={onRedeem}
          text="Harvest &amp; Unstake"
          variant="secondary"
        />
      )
    }
    return (
      <Button
        disabled
        text="Redeeming..."
        variant="secondary"
      />
    )
  }, [
    isRedeeming,
    onRedeem,
  ])

  // const stage0Start = poolInfo && poolInfo['dai_pool'] ? Number(poolInfo['dai_pool'].startTime) : 0;
  const stage0Start = 1604448000;
  const stage0Duration = 1209600;
  const stage0End = Number(stage0Start) + stage0Duration;

  const stage1Start = poolInfo && poolInfo['velo_eth_uni_pool'] ? Number(poolInfo['velo_eth_uni_pool'].startTime) : 0;
  const stage1Duration = 1209600;
  const stage1End = Number(stage1Start) + stage1Duration;

  // const stage2Start = poolInfo && poolInfo['0xAf2B3E4a7426F3ee728aa0c7296c6d5F32eBB152'] ? Number(poolInfo['0xAf2B3E4a7426F3ee728aa0c7296c6d5F32eBB152'].startTime) : 0;
  const stage2Start = 1605657600;
  const stage2Duration = 1209600;
  const stage2End = Number(stage2Start) + stage2Duration;

  const stage3Start = poolInfo && poolInfo['comp_pool'] ? Number(poolInfo['comp_pool'].startTime) : 0;
  const stage3Duration = 604800;
  const stage3End = Number(stage3Start) + stage3Duration;

  return (
    <div className="Farm">
      <div className="relative">
        <Pool
          title="INITIAL DISTRIBUTION POOLS"
          description={<div>
            Deposit stable tokens (USDC, USDT, DAI, TUSD) in the <a href="https://www.curve.fi/iearn/deposit" target="_blank" className="text-white">Y pool</a> on Curve.fi to receive yCRV tokens. Stake DAI or yCRV in one of the staking contracts to be the first to farm VELO token (VLO). 
          </div>}
          coins={farmCoinsStage0}
          disabled={moment() < moment.unix(stage0Start).utc()}
          timestampStartDistribution={stage0Start}
          timestampEndDistribution={stage0End}
          duration={stage0Duration}
          percentageDistributed={38}
          percentageToDistribute={20}
          />
      </div>
      <div className="relative">
        <Pool
          title="FOUNDATION POOLS"
          description={<div>
            Add liquidity to the VLO-ETH pair on <a href="https://info.uniswap.org/pair/0x259E558892783fd8941EBBeDa694318C1C3d9263" target="_blank" className="text-white">Uniswap</a> (50/50) or <a href="https://pools.balancer.exchange/#/pool/0xE52E551141D29e4D08A826ff029059f1fB5F6f52/" target="_blank" className="text-white">Balancer</a> (98/2) to get VLO- ETH-V2 LP tokens or BPT tokens. Deposit those LP or BPT tokens in one of the pools below to earn more VELO token (VLO).
          </div>}
          coins={farmCoinsStage1}
          disabled={true}
          timestampStartDistribution={stage1Start}
          timestampEndDistribution={stage1End}
          duration={stage1Duration}
          percentageDistributed={0}
          percentageToDistribute={40}
          />
      </div>
      <div className="relative">
        <Pool
          title="DOUBLE RETURN POOLS"
          description={<div>
            Add liquidity to the <a href="https://app.uniswap.org/#/uni/ETH/0x6B175474E89094C44Da98b954EedeAC495271d0F" target="_blank" className="text-white">DAI-ETH</a>, <a href="https://app.uniswap.org/#/uni/ETH/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" target="_blank" className="text-white">USDC-ETH</a>, <a href="https://app.uniswap.org/#/uni/ETH/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" target="_blank" className="text-white">WBTC-ETH</a> or <a href="https://app.uniswap.org/#/uni/ETH/0xdAC17F958D2ee523a2206206994597C13D831ec7" target="_blank" className="text-white">ETH-USDT</a> pairs on Uniswap to get LP tokens. Deposit those tokens in one of the pools below to earn more VELO token (VLO). 
          </div>}
          coins={farmCoinsStage2}
          disabled={true}
          timestampStartDistribution={stage2Start}
          timestampEndDistribution={stage2End}
          duration={stage2Duration}
          percentageDistributed={0}
          percentageToDistribute={24}
          />
      </div>
      <div className="relative">
        <Pool
          title="DEFI LINKUP POOLS"
          description={<div>
            Deposit different DeFi tokens in one of the pools below to earn more VELO token (VLO).
          </div>}
          coins={farmCoinsStage3}
          disabled={true}
          timestampStartDistribution={stage3Start}
          timestampEndDistribution={stage3Start}
          duration={stage3Duration}
          percentageDistributed={0}
          percentageToDistribute={16}
          />
      </div>
    </div>
  )
}

export default Pools
