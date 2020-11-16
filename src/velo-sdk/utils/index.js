import {ethers} from 'ethers'
import Web3 from 'web3'
import BigNumber from 'bignumber.js'
import UniswapPairABI from 'constants/abi/UniswapPair.json'

import {
  getBalance,
} from 'utils';

import {
  velo as veloAddress,
} from 'constants/tokenAddresses';

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

const GAS_LIMIT = {
  STAKING: {
    DEFAULT: 250000,
    SNX: 850000,
  }
};

export const getPoolStartTime = async (poolContract) => {
  return await poolContract.methods.starttime().call()
}

export const getReserves = async (provider, tokenAddress) => {
  const web3 = new Web3(provider)
  let contract = new web3.eth.Contract(UniswapPairABI.abi)
  contract.options.address = tokenAddress;

  try {
    const reserves = await contract.methods.getReserves().call()
    return reserves
  } catch (e) {
    return '0'
  }
}

export const getTotalSupplyForLpContract = async (provider, tokenAddress) => {
  const web3 = new Web3(provider)
  let contract = new web3.eth.Contract(UniswapPairABI.abi)
  contract.options.address = tokenAddress;

  try {
    const totalSupply = await contract.methods.totalSupply().call()
    return totalSupply
  } catch (e) {
    return '0'
  }
}

export const stake = async (velo, poolName, amount, account, onTxHash) => {
  const poolContract = velo.contracts[poolName]
  let now = new Date().getTime() / 1000;
  // const gas = GAS_LIMIT.STAKING[tokenName.toUpperCase()] || GAS_LIMIT.STAKING.DEFAULT;
  const gas = GAS_LIMIT.STAKING.DEFAULT
  if (now >= 1597172400) {
    return poolContract.methods
      .stake((new BigNumber(amount).times(new BigNumber(10).pow(18))).toString())
      .send({ from: account, gas }, async (error, txHash) => {
        if (error) {
            onTxHash && onTxHash('')
            console.log("Staking error", error)
            return false
        }
        onTxHash && onTxHash(txHash)
        const status = await waitTransaction(velo.web3.eth, txHash)
        if (!status) {
          console.log("Staking transaction failed.")
          return false
        }
        return true
      })
  } else {
    alert("pool not active");
  }
}

export const unstake = async (velo, poolName, amountInSatoshis, account, onTxHash) => {
  const poolContract = velo.contracts[poolName]
  let now = new Date().getTime() / 1000;
  if (true) {
    return poolContract.methods
      .withdraw(amountInSatoshis)
      .send({ from: account, gas: 250000 }, async (error, txHash) => {
        if (error) {
            onTxHash && onTxHash('')
            console.log("Unstaking error", error)
            return false
        }
        onTxHash && onTxHash(txHash)
        const status = await waitTransaction(velo.web3.eth, txHash)
        if (!status) {
          console.log("Unstaking transaction failed.")
          return false
        }
        return true
      })
  } else {
    alert("pool not active");
  }
}

export const harvest = async (velo, poolName, account, onTxHash) => {
  const poolContract = velo.contracts[poolName]
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .getReward()
      .send({ from: account, gas: 400000 }, async (error, txHash) => {
        if (error) {
            onTxHash && onTxHash('')
            console.log("Harvest error", error)
            return false
        }
        onTxHash && onTxHash(txHash)
        const status = await waitTransaction(velo.web3.eth, txHash)
        if (!status) {
          console.log("Harvest transaction failed.")
          return false
        }
        return true
      })
  } else {
    alert("pool not active");
  }
}

export const redeem = async (velo, account, onTxHash) => {
  const poolContract = velo.contracts.dai_pool
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .exit()
      .send({ from: account, gas: 400000 }, async (error, txHash) => {
        if (error) {
            onTxHash && onTxHash('')
            console.log("Redeem error", error)
            return false
        }
        onTxHash && onTxHash(txHash)
        const status = await waitTransaction(velo.web3.eth, txHash)
        if (!status) {
          console.log("Redeem transaction failed.")
          return false
        }
        return true
      })
  } else {
    alert("pool not active");
  }
}

export const approve = async (tokenContract, poolContract, account) => {
  return tokenContract.methods
    .approve(poolContract.options.address, ethers.constants.MaxUint256)
    .send({ from: account, gas: 80000 })
}

export const getPoolContracts = (velo) => {
  if(! velo) return {}
  const pools = Object.keys(velo.contracts)
    .filter(c => c.indexOf('_pool') !== -1)
    .reduce((acc, cur) => {
      const newAcc = { ...acc }
      newAcc[cur] = velo.contracts[cur]
      return newAcc
    }, {})
  return pools
}

export const getEarned = async (velo, pool, account) => {
  const scalingFactor = new BigNumber(await velo.contracts.velo.methods.velosScalingFactor().call())
  const earned = new BigNumber(await pool.methods.earned(account).call())
  return earned.multipliedBy(scalingFactor.dividedBy(new BigNumber(10).pow(18)))
}

export const getStaked = async (velo, pool, account) => {
  return velo.toBigN(await pool.methods.balanceOf(account).call())
}

export const getStartTime = async (velo, poolName) => {
  const poolContract = velo.contracts[poolName]
  try {
    const starttime = await poolContract.methods.starttime().call()
    return starttime
  } catch (e) {
    console.log(e)
    return 0
  }
}

export const getPoolBalance = async (velo, poolName) => {
  const poolContract = velo.contracts[poolName]
  try {
    return await poolContract.methods.totalSupply().call()
  } catch (e) {
    console.log(e)
    return 0
  }
}

export const getVloBalanceForPool = async (velo, provider, poolName) => {
  const poolContract = velo.contracts[poolName];
  if(! poolContract.options.address) return 0;

  try {
    const poolBalance = await getBalance(provider, veloAddress, poolContract.options.address)
    return poolBalance;
  } catch (e) {
    console.log(e)
    return 0
  }
}

export const getBalanceForPool = async (velo, provider, poolName, tokenAddress) => {
  const poolContract = velo.contracts[poolName];
  if(! poolContract.options.address) return 0;

  try {
    const balance = await getBalance(provider, tokenAddress, poolContract.options.address)
    return balance;
  } catch (e) {
    console.log(e)
    return 0
  }
}

export const getPoolDuration = async (velo, poolName) => {
  const poolContract = velo.contracts[poolName]
  try {
    const DURATION = await poolContract.methods.DURATION().call()
    return DURATION
  } catch (e) {
    console.log(e)
    return 0
  }
}

export const getTotalStakedForPool = async (velo, pool) => {
  return velo.toBigN(await pool.methods.totalSupply().call())
}

export const getCurrentPrice = async (velo) => {
  // FORBROCK: get current YAM price
  return new BigNumber(await velo.contracts.rebaser.methods.getCurrentTWAP().call())
}

export const getTargetPrice = async (velo) => {
  return velo.toBigN(1).toFixed(2);
}

export const getCirculatingSupply = async (velo) => {
  let now = await velo.web3.eth.getBlock('latest');
  let scalingFactor = velo.toBigN(await velo.contracts.velo.methods.velosScalingFactor().call());
  let starttime = velo.toBigN(await velo.contracts.eth_pool.methods.starttime().call()).toNumber();
  let timePassed = now["timestamp"] - starttime;
  if (timePassed < 0) {
    return 0;
  }
  let velosDistributed = velo.toBigN(8 * timePassed * 250000 / 625000); //velos from first 8 pools
  // let starttimePool2 = velo.toBigN(await velo.contracts.ycrv_pool.methods.starttime().call()).toNumber();
  timePassed = now["timestamp"] - starttime;
  let pool2Yams = velo.toBigN(timePassed * 1500000 / 625000); // velos from second pool. note: just accounts for first week
  let circulating = pool2Yams.plus(velosDistributed).times(scalingFactor).dividedBy(10**36).toFixed(2)
  return circulating
}

export const getLastRebaseTimestamp = async (velo) => {
  try {
    // const lastTimestamp = velo.toBigN(await velo.contracts.rebaser.methods.lastRebaseTimestampSec().call()).toNumber()
    const lastTimestamp = await velo.contracts.rebaser.methods.lastRebase().call()
    return lastTimestamp
  } catch (e) {
    console.log(e)
  }
}

export const getNextRebaseInSecondsRemaining = async (velo) => {
  try {
    let now = await velo.web3.eth.getBlock('latest').then(res => res.timestamp);
    let interval = 43200; // 12 hours
    // let offset = 28800; // 8am/8pm utc
    let offset = 0; // 8am/8pm utc
    let secondsToRebase = 0;
    // const lastRebaseTimestamp = await velo.contracts.rebaser.methods.lastRebase().call()
    // console.log('lastRebaseTimestamp', lastRebaseTimestamp)
    if (now % interval > offset) {
        secondsToRebase = (interval - (now % interval)) + offset;
     } else {
        secondsToRebase = offset - (now % interval);
    }
    return secondsToRebase
  } catch (e) {
    console.log(e)
  }
}

export const getNextRebaseTimestamp = async (velo) => {
  try {
    let now = await velo.web3.eth.getBlock('latest').then(res => res.timestamp);
    let interval = 43200; // 12 hours
    let offset = 0; // 8am/8pm utc
    let secondsToRebase = 0;

    // const startRebaseTimestamp = await velo.contracts.rebaser.methods.START_REBASE_AT().call()
    // Hard code next rebase timestamp, because it saves RPC calls
    const startRebaseTimestamp = 1606867200;

    if(now < startRebaseTimestamp) {
      return startRebaseTimestamp;
    }

    const lastRebaseTimestamp = await velo.contracts.rebaser.methods.lastRebase().call()

    if (now % interval > offset) {
        secondsToRebase = (interval - (now % interval)) + offset;
     } else {
        secondsToRebase = offset - (now % interval);
    }

    const nextRebaseTimestamp = Number(lastRebaseTimestamp) + Number(secondsToRebase);

    return (nextRebaseTimestamp <= 997176 ? Number(now) + Number(secondsToRebase) : nextRebaseTimestamp)
  } catch (e) {
    console.log(e)
  }
}

// export const getNextRebaseTimestamp = async (velo) => {
//   try {
//     let now = await velo.web3.eth.getBlock('latest').then(res => res.timestamp);
//     let interval = 43200; // 12 hours
//     let offset = 28800; // 8am/8pm utc
//     let secondsToRebase = 0;
//     return 0;
//     if (await velo.contracts.rebaser.methods.rebasingActive().call()) {
//       if (now % interval > offset) {
//           secondsToRebase = (interval - (now % interval)) + offset;
//        } else {
//           secondsToRebase = offset - (now % interval);
//       }
//     }
//     return secondsToRebase
//   } catch (e) {
//     console.log(e)
//   }
// }

export const getRelativeVelocity = async (velo) => {
  try {
    const relativeVelocity = await velo.contracts.rebaser.methods.getRelativeVelocity().call();
    return relativeVelocity;
  } catch (e) {
    console.log(e)
  }
}

export const getPendingVeloToHarvest = async (velo) => {
  const now = await velo.web3.eth.getBlock('latest');
  return new BigNumber(0)
  // try {
  //   const relativeVelocity = await velo.contracts.rebaser.methods.getRelativeVelocity().call();
  //   return relativeVelocity;
  // } catch (e) {
  //   console.log(e)
  // }
}

export const getTotalSupply = async (velo) => {
  return await velo.contracts.velo.methods.totalSupply().call();
}

export const getVeloInCirculation = (velo) => {
  return new BigNumber(20);
}

export const getStats = async (velo) => {
  const curPrice = await getCurrentPrice(velo)
  const circSupply = await getCirculatingSupply(velo)
  const nextRebase = await getNextRebaseTimestamp(velo)
  const targetPrice = await getTargetPrice(velo)
  const totalSupply = await getTotalSupply(velo)
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply
  }
}

export const vote = async (velo, account) => {
  return velo.contracts.gov.methods.castVote(0, true).send({ from: account })
}

export const delegate = async (velo, account) => {
  return velo.contracts.velo.methods.delegate("0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84").send({from: account, gas: 320000 })
}

export const didDelegate = async (velo, account) => {
  return await velo.contracts.velo.methods.delegates(account).call() === '0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84'
}

export const getVotes = async (velo) => {
  const votesRaw = new BigNumber(await velo.contracts.velo.methods.getCurrentVotes("0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84").call()).dividedBy(10**24)
  return votesRaw
}

export const getScalingFactor = async (velo) => {
  return new BigNumber(await velo.contracts.velo.methods.velosScalingFactor().call())
}

export const getDelegatedBalance = async (velo, account) => {
  return new BigNumber(await velo.contracts.velo.methods.balanceOfUnderlying(account).call()).dividedBy(10**24)
}

export const migrate = async (velo, account) => {
  return velo.contracts.veloV2migration.methods.migrate().send({ from: account, gas: 320000 })
}

export const getMigrationEndTime = async (velo) => {
  return velo.toBigN(await velo.contracts.veloV2migration.methods.startTime().call()).plus(velo.toBigN(86400*3)).toNumber()
}

export const getV2Supply = async (velo) => {
  return new BigNumber(await velo.contracts.veloV2.methods.totalSupply().call())
}

export const migrationStarted = async (velo) => {
  let now = new Date().getTime() / 1000; // get current time
  let startTime = await velo.contracts.migrator.methods.startTime().call();
  let token_initialized = await velo.contracts.migrator.methods.token_initialized().call();
  let delegatorRewardsSet = await velo.contracts.migrator.methods.delegatorRewardsSet().call();
  if (now >= startTime && token_initialized && delegatorRewardsSet) {
    return true;
  }
  return false;
}

const veloToFragment = async (velo, amount) => {
  let BASE24 = new BigNumber(10).pow(24);
  let scalingFactor = new BigNumber(await velo.contracts.velo.methods.velosScalingFactor().call());

  return amount.multipliedBy(scalingFactor).dividedBy(BASE24);
}

export const currVested = async (velo, account) => {
  let BASE = new BigNumber(10).pow(18);

  let vested = new BigNumber(await velo.contracts.migrator.methods.vested(account).call());
  let amt = await veloToFragment(velo, vested);
  return amt.dividedBy(BASE);
}

export const currUnclaimedDelegatorRewards = async (velo, account) => {
  let BASE = new BigNumber(10).pow(18);
  // let BASE24 = new BigNumber(10).pow(24);

  let start = new BigNumber(1600444800);
  let duration = new BigNumber(90 * 86400);
  let now = new BigNumber(new Date().getTime() / 1000);
  let percDone = now.minus(start).dividedBy(duration);
  if (percDone.gt(1)) {
    percDone = new BigNumber(1)
  }
  let totalVesting = new BigNumber(await velo.contracts.migrator.methods.delegator_vesting(account).call());
  let claimed = new BigNumber(await velo.contracts.migrator.methods.delegator_claimed(account).call());
  let unclaimed = ((totalVesting.multipliedBy(percDone)).minus(claimed));
  let amt = await veloToFragment(velo, unclaimed);
  return amt.dividedBy(BASE);
}

export const currUnclaimedMigratorVesting = async (velo, account) => {
  let BASE = new BigNumber(10).pow(18);
  // let BASE24 = new BigNumber(10).pow(24);

  let start = new BigNumber(1600444800);
  let duration = new BigNumber(30 * 86400);
  let now = new BigNumber(new Date().getTime() / 1000);
  let percDone = now.minus(start).dividedBy(duration);
  if (percDone.gt(1)) {
    percDone = new BigNumber(1)
  }
  let totalVesting = new BigNumber(await velo.contracts.migrator.methods.vesting(account).call());
  let claimed = new BigNumber(await velo.contracts.migrator.methods.claimed(account).call());
  let unclaimed = ((totalVesting.multipliedBy(percDone)).minus(claimed));
  let amt = await veloToFragment(velo, unclaimed);
  return amt.dividedBy(BASE);
}

export const delegatorRewards = async (velo, account) => {
  let BASE = new BigNumber(10).pow(18);
  // let BASE24 = new BigNumber(10).pow(24);

  let rewards = new BigNumber(await velo.contracts.migrator.methods.delegator_vesting(account).call());
  let amt = await veloToFragment(velo, rewards);
  return amt.dividedBy(BASE);
}

export const migrateV3 = async (velo, account, onTxHash) => {
    return await velo.contracts.migrator.methods.migrate()
      .send({from: account, gas: 200000}, async (error, txHash) => {
        if (error) {
            onTxHash && onTxHash('')
            console.log("Migration error", error)
            return false
        }
        onTxHash && onTxHash(txHash)
        const status = await waitTransaction(velo.web3.eth, txHash)
        if (!status) {
          console.log("Migration transaction failed.")
          return false
        }
        return true
      })
}

export const claimVested = async (velo, account, onTxHash) => {
  return await velo.contracts.migrator.methods.claimVested().send({from: account, gas: 140000});
}

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const waitTransaction = async (provider, txHash) => {
  const web3 = new Web3(provider)
  let txReceipt = null
  while (txReceipt === null) {
    const r = await web3.eth.getTransactionReceipt(txHash)
    txReceipt = r
    await sleep(2000)
  }
  return (txReceipt.status)
}
