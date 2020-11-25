import BigNumber from 'bignumber.js'

const getGovContractAddress = (velo) => {
	return velo.contracts.gov.options.address
}

export const vote = async (velo, account) => {
  return velo.contracts.gov.methods.castVote(1, true).send({ from: account })
}

export const delegate = async (velo, account) => {
	console.log('velo', velo, velo.contracts.velo)
  return velo.contracts.velo.methods.delegate(getGovContractAddress(velo)).send({from: account, gas: 320000 })
}

export const didDelegate = async (velo, account) => {
  return await velo.contracts.velo.methods.delegates(account).call() === getGovContractAddress(velo)
}

export const getVotes = async (velo) => {
  const votesRaw = new BigNumber(await velo.contracts.velo.methods.getCurrentVotes(getGovContractAddress(velo)).call()).dividedBy(10**18)
  return votesRaw
}

export const getProposalData = async (velo) => {
  return await velo.contracts.gov.methods.proposals(1).call()
}
