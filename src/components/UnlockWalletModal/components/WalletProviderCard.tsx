import React from 'react'
import {
  Card,
  CardActions,
  CardContent,
  CardIcon,
} from 'react-neu'
import Button from 'components/Button/Button';
import styled from 'styled-components'

interface WalletProviderCardProps {
  icon: React.ReactNode,
  name: string,
  onSelect: () => void
}
const WalletProviderCard: React.FC<WalletProviderCardProps> = ({
  icon,
  name,
  onSelect,
}) => (
  <div className="
    
  ">
    <CardIcon>{icon}</CardIcon>
    <CardContent>
      <StyledName>{name}</StyledName>
    </CardContent>
    <CardActions>
      <Button
        onClick={onSelect}
        classes="btn-theme"
      >
        Select
      </Button>
    </CardActions>
  </div>
)

const StyledName = styled.div`
  font-size: 18px;
  font-weight: 700;
  text-align: center;
`

export default WalletProviderCard