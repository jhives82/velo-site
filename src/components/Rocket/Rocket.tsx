import React, {useCallback, useEffect} from 'react'
import useFarming from '../../hooks/useFarming'
import BigNumber from 'bignumber.js'
import numeral from 'numeral'

import Rebase from 'views/Home/components/Rebase'
import RelativeVelocity from 'views/Landing/components/RelativeVelocity'
import TotalLockedValue from 'views/Landing/components/TotalLockedValue'
import TotalSupply from 'views/Landing/components/TotalSupply'
import RocketFlame from './RocketFlame'

import './Rocket.css';

// import Logo from 'components/Logo'
// import MenuIcon from 'components/icons/Menu'

// import Nav from './components/Nav'
// import WalletButton from './components/WalletButton'

interface RocketProps {
  // param: () => void
}

const Rocket: React.FC<RocketProps> = () => {

  const {
    totalSupply,
    price
  } = useFarming()

  const getValueInTokens = (number: BigNumber, decimals = 18) => {
    return Number(number) / Math.pow(10, decimals)
  }

  const displayMarketCap = useCallback((value?: BigNumber) => {
    if (value) {
      return numeral(getValueInTokens(value) * 0.01).format('0.00a')
    } else {
      return '--'
    }
  }, [])

  const getVloPrice = useCallback((price: any) => {
    if(! price) return 0;
    if(price.VLO_WETH && price.WETH_DAI) {
      return Number(price.VLO_WETH) * Number(price.WETH_DAI);
    }
    return 0;
  }, [price])

  return (
    <div className="
      Rocket
      p-8
    ">
      <div className="Rocket-illustration">
        <Rebase />
        <div className="Rocket-data-list">
          <div>
            <label>Relative velocity</label>
            <div className="Rocket-data-list-stat">
              <RelativeVelocity />
            </div>
          </div>
          <div>
            <label>Locked in pools</label>
            <div className="Rocket-data-list-stat">
              <TotalLockedValue />
            </div>
          </div>
          <div>
            <label>Price VLO</label>
            <div className="Rocket-data-list-stat" style={{color: '#f00'}}>
              $ {getVloPrice(price) <= 0 ? '--' : getVloPrice(price).toFixed(2)}
            </div>
          </div>
          <div>
            <label>Market cap</label>
            <div className="Rocket-data-list-stat" style={{color: '#f00'}}>
              $ {(totalSupply && false) ? displayMarketCap(totalSupply) : '--'}
            </div>
          </div>
          <div>
            {/*<label>VLO in circulation</label>*/}
            <label>Total supply</label>
            <div className="Rocket-data-list-stat">
              <TotalSupply />
            </div>
          </div>
        </div>
      </div>
      <div className="Rocket-fire-wrapper animate__animated animate__swing" style={{
        position: 'relative',
        top: '-120px'
      }}>
        <RocketFlame />
      </div>
    </div>
  )
}

export default Rocket;
