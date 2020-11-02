import React from 'react'
import styled from 'styled-components'

const Page: React.FC = ({ children }) => (
  <StyledPage>
    <StyledMain>
      {children}
    </StyledMain>
  </StyledPage>
)

const StyledPage = styled.div`
  height: 100%;
`

const StyledMain = styled.div`
  height: 100%;
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`

export default Page