import React, { useState, useEffect } from 'react'
import { provider } from 'web3-core'
import { useWallet } from 'use-wallet'
import numeral from 'numeral'

import { getFullDisplayBalance } from 'utils'
import BigNumber from 'bignumber.js'

// Import components
import {
  ModalActions,
  ModalContent,
  ModalProps,
} from 'react-neu'
import {
  Modal,
  ModalTitle
} from 'components/Modal/index'
import TokenInput from 'components/TokenInput'
import Button from 'components/Button/Button'

import useVelo from 'hooks/useVelo'
import useBalances from 'hooks/useBalances'

import {
  didDelegate,
  vote,
  delegate,
  getVotes,
  getProposalData
} from 'velo-sdk/utils/governance'

// import './Modal.css';

// interface ModalProps {
//   children?: any,
//   isOpen?: boolean,
//   classes?: any,
// }

const ProposalButton: React.FC = () => {
  const TimeOut_intervals = {
    didUserDelegate: 1000 * 20,
    fetchVotes: 1000 * 40,
  };
  let TO_didUserDelegate: any, TO_fetchVotes: any;

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUserDelegating, setIsUserDelegating] = useState(false)
  const [didUserDelegate, setDidUserDelegate] = useState(false)
  const [userVoteValue, setUserVoteValue] = useState<string>()
  const [votesFor, setVotesFor] = useState<number>(0)
  const [votesAgainst, setVotesAgainst] = useState<number>(0)

  const {
    velo
  } = useVelo()

  const { account, ethereum }: {
    account: string | null,
    ethereum: provider
  } = useWallet()

  const {
    balance
  } = useBalances()

  const checkIfUserDelegatedVotes = async () => {
    const didShe = await didDelegate(velo, account);
    setDidUserDelegate(didShe)
    return didShe;
  }

  const fetchVotes = async () => {
    const proposalData = await getProposalData(velo);
    console.log('proposalData', proposalData)
    setVotesFor(Number(new BigNumber(proposalData.forVotes).dividedBy(10**18)))
    setVotesAgainst(Number(new BigNumber(proposalData.againstVotes).dividedBy(10**18)))
    return;
  }

  // Did user delegate?
  useEffect(() => {
    if(! velo || ! account || ! isModalOpen) return;
    checkIfUserDelegatedVotes()
    TO_didUserDelegate = setInterval(() => {
      checkIfUserDelegatedVotes()
    }, TimeOut_intervals.didUserDelegate)
    return () => { clearTimeout(TO_didUserDelegate); }
  }, [velo, account, isModalOpen])

  // Fetching votes
  useEffect(() => {
    if(! velo || ! account || ! isModalOpen) return;
    fetchVotes()
    TO_fetchVotes = setInterval(() => {
      fetchVotes()
    }, TimeOut_intervals.fetchVotes)
    return () => { clearTimeout(TO_fetchVotes); }
  }, [velo, account, isModalOpen])

  const totalVotes = votesFor + votesAgainst;
  const pctFor = votesFor/totalVotes * 100;
  const pctAgainst = votesAgainst/totalVotes * 100;

  return (
    <>
      <a
        onClick={(e) => {
          setIsModalOpen(true)
        }}
        className="
          hidden
          sm--block
          my-4
          btn-theme
          btn-theme--filled
      ">
        MisesLegacy Proposal
      </a>
      {isModalOpen && <Modal isOpen={isModalOpen}>
        <ModalTitle>
          Proposal
        </ModalTitle>
        <ModalContent>
          <h1>
            MISES LEGACY POOL
          </h1>
          <p>
            Read all about this proposal in <a href="https://supermises.medium.com/mises-legacy-proposal-b40e402a7298" target="_blank" className="text-white">
              this Medium article
            </a>
          </p>
          <p>
            Read the verified smart contracts at Etherscan:
          </p>
          <ul className="my-2" style={{listStyle: 'none'}}>
            <li>
              <a href="https://etherscan.io/address/0x3d3Fddb7B10F46938F8a644D4612Af2827C1e577#code" target="_blank" className="text-white">
                MisesLegacy.sol
              </a>
            </li>
            <li>
              <a href="https://etherscan.io/address/0x1785e8d6adE68b4937137F07C15b098aE0caF001#code" target="_blank" className="text-white">
                MisesLegacyRebaser.sol
              </a>
            </li>
          </ul>
        </ModalContent>
        <div>
          <div
            className="flex justify-center"
            style={{paddingRight: '24px', paddingLeft: '24px'}}
            >
            <Button
              onClick={() => {
                setIsModalOpen(false)
              }}
              classes="btn-theme mr-2"
            >
              Close
            </Button>
            
            {! didUserDelegate && <Button
              onClick={async () => {
                setIsUserDelegating(true)
                const delegateResponse = await delegate(velo, account);
                console.log('delegateResponse', delegateResponse)
              }}
              classes="
                btn-theme btn-theme--filled
                ml-2
              "
            >
              {isUserDelegating ? 'Delegating.. wait or come back later' : 'Delegate to self'}
            </Button>}

            {didUserDelegate && ! userVoteValue && <div className="flex flex-center ml-2">
              <Button
                onClick={async () => {
                  setIsUserDelegating(true)
                  const response = await vote(velo, account, false);
                  setUserVoteValue('against')
                }}
                classes="
                  btn-theme
                  ml-2
                "
              >
                Vote against
              </Button>
              <Button
                onClick={async () => {
                  setIsUserDelegating(true)
                  const response = await vote(velo, account, true);
                  setUserVoteValue('for')
                }}
                classes="
                  btn-theme btn-theme--filled
                  ml-2
                "
              >
                Vote for
              </Button>
            </div>}

          </div>

          {(votesFor > 0 || votesAgainst > 0) && <div>
            {userVoteValue == 'for' && <div className="mt-4" style={{background: 'rgba(255,255,255,0.1)', padding: '5px 0 20px 0'}}>
              <h2 className="mt-8 text-green font-bold">You voted FOR</h2>
              <p>
                If you're not with me, you're against me
              </p>
            </div>}
            {userVoteValue == 'against' && <div>
              <h2 className="mt-8 text-red font-bold">You voted AGAINST</h2>
              <p>
                If you're not against me, you're with me
              </p>
            </div>}

            <div className="mt-8 my-4 w-full flex justify-center h-64" style={{width: '90%'}}>
              <div className="flex-1 flex flex-col justify-center mx-auto" style={{width: '50%'}}>
                <div style={{color: 'red'}} className="text-xl font-bold flex justify-end">
                  {numeral(votesAgainst).format('0.00a')}
                  <div className="ml-2" style={{
                    width: `${pctAgainst}%`,
                    height: '20px',
                    background: 'red'
                  }} />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center" style={{width: '50%'}}>
                <div style={{color: 'green'}} className="text-xl font-bold flex justify-end">
                  <div className="mr-2" style={{
                    width: `${pctFor}%`,
                    height: '20px',
                    background: 'green'
                  }} />
                  {numeral(votesFor).format('0.00a')}
                </div>
              </div>
            </div>

          </div>}

        </div>
      </Modal>}
    </>
  )
}

export default ProposalButton
