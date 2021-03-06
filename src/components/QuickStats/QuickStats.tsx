import React, {useCallback} from 'react'
import useFarming from '../../hooks/useFarming'
import BigNumber from 'bignumber.js'
import numeral from 'numeral'

// import Rebase from 'views/Home/components/Rebase'
import RelativeVelocity from 'views/Landing/components/RelativeVelocity'
import TotalLockedValue from 'views/Landing/components/TotalLockedValue'
import TotalSupply from 'views/Landing/components/TotalSupply'

import './QuickStats.css';

// import Logo from 'components/Logo'
// import MenuIcon from 'components/icons/Menu'

// import Nav from './components/Nav'
// import WalletButton from './components/WalletButton'

interface QuickStatsProps {
  // param: () => void
}

const QuickStats: React.FC<QuickStatsProps> = () => {

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
      QuickStats
      sm--hidden
    ">
      <div className="
        QuickStats-data-list
        flex
        flex-wrap
        justify-around
      ">
        <div>
          <label>Relative velocity</label>
          <div className="QuickStats-data-list-stat">
            <RelativeVelocity />
          </div>
        </div>
        <div>
          <label>Locked in pools</label>
          <div className="QuickStats-data-list-stat">
            <TotalLockedValue />
          </div>
        </div>
        <div>
          <label>Price VLO</label>
          <div className="QuickStats-data-list-stat" style={{color: '#f00'}}>
            $ {getVloPrice(price) <= 0 ? '--' : getVloPrice(price).toFixed(2)}
          </div>
        </div>
        <div>
          <label>Market cap</label>
          <div className="QuickStats-data-list-stat" style={{color: '#f00'}}>
            $ {(false && totalSupply) ? displayMarketCap(totalSupply) : '--'}
          </div>
        </div>
        <div>
          <label>Total supply</label>
          <div className="QuickStats-data-list-stat">
            <TotalSupply />
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickStats;
