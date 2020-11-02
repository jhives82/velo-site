import React, {useCallback} from 'react'
import useFarming from '../../hooks/useFarming'
import BigNumber from 'bignumber.js'
import numeral from 'numeral'

import Rebase from 'views/Home/components/Rebase'
import RelativeVelocity from 'views/Landing/components/RelativeVelocity'
import TotalLockedValue from 'views/Landing/components/TotalLockedValue'
import TotalSupply from 'views/Landing/components/TotalSupply'

import './RocketFlame.css';

// import Logo from 'components/Logo'
// import MenuIcon from 'components/icons/Menu'

// import Nav from './components/Nav'
// import WalletButton from './components/WalletButton'

interface RocketProps {
  // param: () => void
}

const RocketFlame: React.FC<RocketProps> = () => {
  return (
    <div className="RocketFlame">
      <div className="red flame"></div>
      <div className="orange flame"></div>
      <div className="yellow flame"></div>
      <div className="white flame"></div>
      {/*<div className="blue circle"></div>*/}
      {/*<div className="black circle"></div>*/}
    </div>
  )
}

export default RocketFlame;
