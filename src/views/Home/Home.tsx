import React from 'react'
import {
  Container,
  Spacer,
  useTheme,
} from 'react-neu'

import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import Split from 'components/Split'

import useBalances from 'hooks/useBalances'
import useVesting from 'hooks/useVesting'

import MigrationNotice from './components/MigrationNotice'
import Rebase from './components/Rebase'
import Stats from './components/Stats'
import VestingNotice from './components/VestingNotice'

import './Home.css';
// import './Home-stars.css';

const Home: React.FC = () => {
  const { darkMode } = useTheme()
  const { veloBalance } = useBalances()
  const { vestedBalance } = useVesting()
  return (
    <Page>
      <div className="Home">

        <PageHeader />

        <section className="Home-coming-soon">
          Coming soon! Be the first in the know
        </section>

        <section className="Home-join-now ">
          <a href="https://discord.gg/rGnnKTR" target="_blank" className="Home-join-now-image">
            <img className="Home-discord-logo" src="/views/Home/discord-logo.svg" alt="Discord logo" />
          </a>
          <a href="https://discord.gg/rGnnKTR" target="_blank" className="Home-join-now-button">
            JOIN NOW!
          </a>
          <div>
            Get ready to farm in a few days<br />
            Fairly distributed
          </div>
        </section>

        <section className="Home-mined-with">
          <img className="Home-velo-brand" src="views/Home/velo-token-logo.svg" alt="VELO logo" />
          <p>
            Will be mined with
          </p>
          <img src="/views/Home/mining-icons.svg" alt="The coins VELO can be mined with - See our FAQ" />
        </section>

      </div>
    </Page>
  )
}

export default Home
