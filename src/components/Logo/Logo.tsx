import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Logo: React.FC = () => {
  return (
    <img
      src="/components/Logo/logo.png"
      alt="Velo logo"
      width="100"
      style={{
        display: 'block'
      }}
      />
  )
}

export default Logo
