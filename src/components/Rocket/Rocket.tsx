import React, {useCallback} from 'react'
import useFarming from '../../hooks/useFarming'
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
    price,
    poolInfo
  } = useFarming()

  const getValueInTokens = (number: any, decimals = 18) => {
    return Number(number) / Math.pow(10, decimals)
  }

  const formatValue = useCallback((value?: any) => {
    if (value) {
      return numeral(value).format('0.00a')
    } else {
      return '--'
    }
  }, [])

  const getDelutedMarketCap = useCallback((price: any, totalSupply: any) => {
    const veloPrice = getVloPrice(price);
    return getValueInTokens(totalSupply) * veloPrice;
  }, [price, poolInfo])

  const getCirculatingMarketCap = useCallback((price: any, totalSupply: any) => {
    const circulatingSupply = getCirculatingSupply(price, totalSupply);
    const veloPrice = getVloPrice(price);
    return circulatingSupply * veloPrice;
  }, [price, poolInfo])

  const getCirculatingSupply = useCallback((price: any, totalSupply: any) => {
    if(! poolInfo || ! totalSupply) return 0;
    const vloPrice = getVloPrice(price);
    let sumVloStillInPools = 0;
    for(let poolName in poolInfo) {
      sumVloStillInPools += getValueInTokens(poolInfo[poolName].vloBalance);
    }
    if(sumVloStillInPools <= 0) return 0;
    const vloInCirculation = getValueInTokens(totalSupply) - sumVloStillInPools;
    return vloInCirculation;
  }, [price, poolInfo])

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
              $ {getVloPrice(price) <= 0 ? '--' : getVloPrice(price).toFixed(4)}
            </div>
          </div>
          <div>
            {/*<label>Market cap</label>*/}
            <label>Deluted Market Cap</label>
            <div className="Rocket-data-list-stat" style={{color: '#f00'}}>
              {/*formatValue(getCirculatingMarketCap(price, totalSupply))*/}
              $ {formatValue(getDelutedMarketCap(price, totalSupply))}
            </div>
          </div>
          <div>
            <label>Circulating supply</label>
            <div className="Rocket-data-list-stat">
              {formatValue(getCirculatingSupply(price, totalSupply))}
            </div>
          </div>
          <div>
            <label>Max VLO supply</label>
            <div className="Rocket-data-list-stat">
              <TotalSupply />
            </div>
            {/*<label>Total supply</label>
            <div className="Rocket-data-list-stat">
              <TotalSupply />
            </div>*/}
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
