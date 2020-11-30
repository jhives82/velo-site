import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import Web3 from 'web3'
import { provider, TransactionReceipt } from 'web3-core'
import { AbiItem } from 'web3-utils'
import ERC20ABI from 'constants/abi/ERC20.json'
import { ChainId, Token, WETH, Fetcher, Route } from '@uniswap/sdk'
import { getDefaultProvider, getNetwork, EtherscanProvider, InfuraProvider } from '@ethersproject/providers'
import config from 'config'

const CoinGecko = require('coingecko-api');
const CoinGeckoClient = new CoinGecko();

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const waitTransaction = async (provider: provider, txHash: string) => {
  const web3 = new Web3(provider)
  let txReceipt: TransactionReceipt | null = null
  while (txReceipt === null) {
    const r = await web3.eth.getTransactionReceipt(txHash)
    txReceipt = r
    await sleep(2000)
  }
  return (txReceipt.status)
}

export const approve = async (
  userAddress: string,
  spenderAddress: string,
  tokenAddress: string,
  provider: provider,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const tokenContract = getERC20Contract(provider, tokenAddress)
    return tokenContract.methods
      .approve(spenderAddress, ethers.constants.MaxUint256)
      .send({ from: userAddress, gas: 80000 }, async (error: any, txHash: string) => {
        if (error) {
            console.log("ERC20 could not be approved", error)
            onTxHash && onTxHash('')
            return false
        }
        if (onTxHash) {
          onTxHash(txHash)
        }
        const status = await waitTransaction(provider, txHash)
        if (!status) {
          console.log("Approval transaction failed.")
          return false
        }
        return true
      })
  } catch (e) {
    console.log('here')
    return false
  }
}

export const getAllowance = async (
  userAddress: string,
  spenderAddress: string,
  tokenAddress: string,
  provider: provider
): Promise<string> => {
  try {
    const tokenContract = getERC20Contract(provider, tokenAddress)
    const allowance: string = await tokenContract.methods.allowance(userAddress, spenderAddress).call()
    return allowance
  } catch (e) {
    return '0'
  }
}

export const getBalance = async (provider: provider, tokenAddress: string, userAddress: string): Promise<string> => {
  const tokenContract = getERC20Contract(provider, tokenAddress)
  
  try {
    const balance: string = await tokenContract.methods.balanceOf(userAddress).call()
    return balance
  } catch (e) {
    return '0'
  }
}

export const getTotalContractSupply = async (provider: provider, tokenAddress: string): Promise<string> => {
  const tokenContract = getERC20Contract(provider, tokenAddress)
  
  try {
    const totalSupply: string = await tokenContract.methods.totalSupply().call()
    return totalSupply
  } catch (e) {
    return '0'
  }
}

// https://uniswap.org/docs/v2/javascript-SDK/pricing/
export const getUniswapPrice = async (pair1Token: any, pair2Token: any, inputToken: any): Promise<string> => {
  const pair = await Fetcher.fetchPairData(
    pair1Token,
    pair2Token,
    config.ethereumProvider
  )
  const route = new Route([pair], inputToken)
  return route.midPrice.toSignificant(6);
}

// https://uniswap.org/docs/v2/javascript-SDK/pricing/
export const getCoinGeckoPrices = async (): Promise<any> => {
  let response = await CoinGeckoClient.simple.price({
    ids: [
      'dai',
      'curve-fi-ydai-yusdc-yusdt-ytusd',
      'compound-governance-token',
      'aave',
      'chainlink',
      'havven',
      'sushi',
      'pickle-finance',
      'piedao-dough-v2',
      'yearn-finance',
    ],
    vs_currencies: ['usd'],
  });
  if(response.success) {
    return response.data;
  }
  return {};
}

export const getERC20Contract = (provider: provider, address: string) => {
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(ERC20ABI.abi as unknown as AbiItem, address)
  return contract
}

export const bnToDec = (bn: BigNumber, decimals = 18) => {
  return new BigNumber(bn).dividedBy(new BigNumber(10).pow(decimals)).toNumber()
}

export const decToBn = (dec: number, decimals = 18) => {
  return new BigNumber(dec).multipliedBy(new BigNumber(10).pow(decimals))
}

export const getFullDisplayBalance = (balance: BigNumber, decimals = 18) => {
  return balance.dividedBy(new BigNumber(10).pow(decimals)).toFixed()
}

export const veloCoinNameToCoinGeckoCoinName = (veloCoinName: string) => {
  const conversionArray: {
    [veloCoinName: string]: string
  } = {
    'ycrv': 'curve-fi-ydai-yusdc-yusdt-ytusd',
    'dai': 'dai',
    'comp': 'compound-governance-token',
    'aave': 'aave',
    'link': 'chainlink',
    'snx': 'havven',
    'sushi': 'sushi',
    'pickle': 'pickle-finance',
    'dough': 'piedao-dough-v2',
    'yfi': 'yearn-finance',
  };
  return conversionArray[veloCoinName] || veloCoinName;
}

export const getEmissionRatePerWeek_fromSeconds = (seconds: number) => {
  return seconds * 60 * 60 * 24 * 7;
}
