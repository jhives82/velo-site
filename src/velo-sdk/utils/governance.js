import BigNumber from 'bignumber.js'

const getGovContractAddress = (velo) => {
	return velo.contracts.gov.options.address
}

export const vote = async (velo, account, trueOrFalse) => {
  return velo.contracts.gov.methods.castVote(1, trueOrFalse).send({ from: account })
}

export const delegate = async (velo, account) => {
  return velo.contracts.velo.methods.delegate(account).send({from: account, gas: 320000 })
}

export const didDelegate = async (velo, account) => {
  return await velo.contracts.velo.methods.delegates(account).call() === account
}

export const getVotes = async (velo) => {
  const votesRaw = new BigNumber(await velo.contracts.velo.methods.getCurrentVotes(getGovContractAddress(velo)).call()).dividedBy(10**18)
  return votesRaw
}

export const getProposalData = async (velo) => {
  return await velo.contracts.gov.methods.proposals(1).call()
}
