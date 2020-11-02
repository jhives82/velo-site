import BigNumber from 'bignumber.js/bignumber';
import Web3 from 'web3';
import * as Types from "./types.js";
import { SUBTRACT_GAS_LIMIT, addressMap } from './constants.js';

import ERC20Json from '../clean_build/contracts/IERC20.json';
import YAMv2Json from '../clean_build/contracts/YAMv2.json';
import YAMv2MigrationJson from '../clean_build/contracts/YAMv2Migration.json';
import YAMJson from '../clean_build/contracts/YAMDelegator.json';
import VELOJson from '../clean_build/contracts/VELODelegator.json';
import VELORebaserJson from '../clean_build/contracts/VELORebaser.json';

// Stage 0
import VeloDaiPoolJson from '../clean_build/contracts/VELO_DAI_Pool.json';
import VeloCrvPoolJson from '../clean_build/contracts/VELO_CRV_Pool.json';
// Stage 1
import VeloVeloEthUniPoolJson from '../clean_build/contracts/VELO_VELO_ETH_LP_Pool.json';
import VeloVeloEthBlpPoolJson from '../clean_build/contracts/VELO_VELO_ETH_BLP_Pool.json';
// Stage 2
import VeloCompPoolJson from '../clean_build/contracts/VELO_COMP_Pool.json';
import VeloLendPoolJson from '../clean_build/contracts/VELO_LEND_Pool.json';
import VeloLinkPoolJson from '../clean_build/contracts/VELO_LINK_Pool.json';
import VeloSnxPoolJson from '../clean_build/contracts/VELO_SNX_Pool.json';
import VeloSushiPoolJson from '../clean_build/contracts/VELO_SUSHI_Pool.json';
import VeloPicklePoolJson from '../clean_build/contracts/VELO_PICKLE_Pool.json';
import VeloDoughPoolJson from '../clean_build/contracts/VELO_DOUGH_Pool.json';
import VeloYfiPoolJson from '../clean_build/contracts/VELO_YFI_Pool.json';

import YAMRebaserJson from '../clean_build/contracts/YAMRebaser.json';
import YAMReservesJson from '../clean_build/contracts/YAMReserves.json';
import YAMGovJson from '../clean_build/contracts/GovernorAlpha.json';
import YAMTimelockJson from '../clean_build/contracts/Timelock.json';
import WETHJson from './weth.json';
import SNXJson from './snx.json';
import UNIFactJson from './unifact2.json';
import UNIPairJson from './uni2.json';
import UNIRouterJson from './uniR.json';

import WETHPoolJson from '../clean_build/contracts/YAMETHPool.json';
import AMPLPoolJson from '../clean_build/contracts/YAMAMPLPool.json';
import YFIPoolJson from '../clean_build/contracts/YAMYFIPool.json';

import MKRPoolJson from '../clean_build/contracts/YAMMKRPool.json';
import LENDPoolJson from '../clean_build/contracts/YAMLENDPool.json';
import COMPPoolJson from '../clean_build/contracts/YAMCOMPPool.json';
import SNXPoolJson from '../clean_build/contracts/YAMSNXPool.json';
import LINKPoolJson from '../clean_build/contracts/YAMLINKPool.json';

import IncOldJson from '../clean_build/contracts/YAMIncentivizerOld.json';
import IncJson from '../clean_build/contracts/YAMIncentivizer.json';

import MigratorJson from "../clean_build/contracts/Migrator.json"
import YAMv3Json from "../clean_build/contracts/YAMDelegatorV3.json"

export class Contracts {
  constructor(
    provider,
    networkId,
    web3,
    options
  ) {
    this.web3 = web3;
    this.defaultConfirmations = options.defaultConfirmations;
    this.autoGasMultiplier = options.autoGasMultiplier || 1.5;
    this.confirmationType = options.confirmationType || Types.ConfirmationType.Confirmed;
    this.defaultGas = options.defaultGas;
    this.defaultGasPrice = options.defaultGasPrice;

    this.uni_pair = new this.web3.eth.Contract(UNIPairJson);
    this.uni_router = new this.web3.eth.Contract(UNIRouterJson);
    this.uni_fact = new this.web3.eth.Contract(UNIFactJson);
    this.yfi = new this.web3.eth.Contract(ERC20Json.abi);
    this.pump = new this.web3.eth.Contract(ERC20Json.abi);
    this.UNIAmpl = new this.web3.eth.Contract(ERC20Json.abi);
    this.ycrv = new this.web3.eth.Contract(ERC20Json.abi);
    this.yycrv = new this.web3.eth.Contract(ERC20Json.abi);
    this.yam = new this.web3.eth.Contract(YAMJson.abi);

    this.velo = new this.web3.eth.Contract(VELOJson.abi);
    this.dai = new this.web3.eth.Contract(ERC20Json.abi);

    // Stage 0
    this.dai_pool = new this.web3.eth.Contract(VeloDaiPoolJson.abi);
    this.ycrv_pool = new this.web3.eth.Contract(VeloCrvPoolJson.abi);
    // Stage 1
    this.velo_eth_uni_pool = new this.web3.eth.Contract(VeloVeloEthUniPoolJson.abi);
    this.velo_eth_blp_pool = new this.web3.eth.Contract(VeloVeloEthBlpPoolJson.abi);
    // Stage 2
    this.velo_eth_dai_pool = new this.web3.eth.Contract(VeloCompPoolJson.abi);
    this.velo_eth_usdc_pool = new this.web3.eth.Contract(VeloCompPoolJson.abi);
    this.velo_eth_usd_pool = new this.web3.eth.Contract(VeloCompPoolJson.abi);
    this.velo_eth_wbtc_pool = new this.web3.eth.Contract(VeloCompPoolJson.abi);
    // Stage 3
    this.comp_pool = new this.web3.eth.Contract(VeloCompPoolJson.abi);
    this.lend_pool = new this.web3.eth.Contract(VeloLendPoolJson.abi);
    this.aave_pool = new this.web3.eth.Contract(VeloLendPoolJson.abi);
    this.link_pool = new this.web3.eth.Contract(VeloLinkPoolJson.abi);
    this.snx_pool = new this.web3.eth.Contract(VeloSnxPoolJson.abi);
    this.sushi_pool = new this.web3.eth.Contract(VeloSushiPoolJson.abi);
    this.pickle_pool = new this.web3.eth.Contract(VeloPicklePoolJson.abi);
    this.dough_pool = new this.web3.eth.Contract(VeloDoughPoolJson.abi);
    this.yfi_pool = new this.web3.eth.Contract(VeloYfiPoolJson.abi);
    this.migrator = new this.web3.eth.Contract(MigratorJson.abi);
    this.rebaser = new this.web3.eth.Contract(VELORebaserJson.abi);

    this.setProvider(provider, networkId);
    this.setDefaultAccount(this.web3.eth.defaultAccount);
  }


  setProvider(
    provider,
    networkId
  ) {
    this.velo.setProvider(provider);
    this.rebaser.setProvider(provider);

    const contracts = [
      { contract: this.velo, json: VELOJson },
      { contract: this.rebaser, json: VELORebaserJson },
      { contract: this.migrator, json: MigratorJson },

      // Stage 0
      { contract: this.dai_pool, json: VeloDaiPoolJson },
      { contract: this.ycrv_pool, json: VeloCrvPoolJson },
      // Stage 1 VELO_VELO_ETH_BLP_Pool
      { contract: this.velo_eth_uni_pool, json: VeloCrvPoolJson },
      { contract: this.velo_eth_blp_pool, json: VeloDaiPoolJson },
      // Stage 2
      { contract: this.velo_eth_dai_pool, json: VeloCrvPoolJson },
      { contract: this.velo_eth_usdc_pool, json: VeloCrvPoolJson },
      { contract: this.velo_eth_usd_pool, json: VeloCrvPoolJson },
      { contract: this.velo_eth_wbtc_pool, json: VeloCrvPoolJson },
      // Stage 3
      { contract: this.comp_pool, json: VeloCrvPoolJson },
      { contract: this.lend_pool, json: VeloCrvPoolJson },
      { contract: this.aave_pool, json: VeloCrvPoolJson },
      { contract: this.link_pool, json: VeloCrvPoolJson },
      { contract: this.snx_pool, json: VeloCrvPoolJson },
      { contract: this.sushi_pool, json: VeloCrvPoolJson },
      { contract: this.pickle_pool, json: VeloCrvPoolJson },
      { contract: this.dough_pool, json: VeloCrvPoolJson },
      { contract: this.yfi_pool, json: VeloCrvPoolJson },
    ]

    contracts.forEach(contract => this.setContractProvider(
        contract.contract,
        contract.json,
        provider,
        networkId,
      ),
    );
    this.velo.options.address = addressMap["VELO"];

    this.dai.options.address = addressMap["dai"];
    this.pump.options.address = addressMap["PUMP"];

    // Stage 0
    this.dai_pool.options.address = addressMap["dai_pool"];
    this.ycrv_pool.options.address = addressMap["ycrv_pool"];
    // Stage 1
    this.velo_eth_uni_pool.options.address = addressMap["velo_eth_uni_pool"];
    this.velo_eth_blp_pool.options.address = addressMap["velo_eth_blp_pool"];
    // Stage 2
    this.velo_eth_dai_pool.options.address = addressMap["velo_eth_dai_pool"];
    this.velo_eth_usdc_pool.options.address = addressMap["velo_eth_usdc_pool"];
    this.velo_eth_usd_pool.options.address = addressMap["velo_eth_usd_pool"];
    this.velo_eth_wbtc_pool.options.address = addressMap["velo_eth_wbtc_pool"];
    // Stage 3
    this.comp_pool.options.address = addressMap["comp_pool"];
    this.lend_pool.options.address = addressMap["lend_pool"];
    this.aave_pool.options.address = addressMap["aave_pool"];
    this.link_pool.options.address = addressMap["link_pool"];
    this.snx_pool.options.address = addressMap["snx_pool"];
    this.sushi_pool.options.address = addressMap["sushi_pool"];
    this.pickle_pool.options.address = addressMap["pickle_pool"];
    this.dough_pool.options.address = addressMap["dough_pool"];
    this.yfi_pool.options.address = addressMap["yfi_pool"];

    this.rebaser.options.address = addressMap["VELORebaser"];

    this.pools = [
    ]
  }

  setDefaultAccount(
    account
  ) {
    // this.weth.options.from = account;
  }

  async callContractFunction(
    method,
    options
  ) {
    const { confirmations, confirmationType, autoGasMultiplier, ...txOptions } = options;

    if (!this.blockGasLimit) {
      await this.setGasLimit();
    }

    if (!txOptions.gasPrice && this.defaultGasPrice) {
      txOptions.gasPrice = this.defaultGasPrice;
    }

    if (confirmationType === Types.ConfirmationType.Simulate || !options.gas) {
      let gasEstimate;
      if (this.defaultGas && confirmationType !== Types.ConfirmationType.Simulate) {
        txOptions.gas = this.defaultGas;
      } else {
        try {
          console.log("estimating gas");
          gasEstimate = await method.estimateGas(txOptions);
        } catch (error) {
          const data = method.encodeABI();
          const { from, value } = options;
          const to = method._parent._address;
          error.transactionData = { from, value, data, to };
          throw error;
        }

        const multiplier = autoGasMultiplier || this.autoGasMultiplier;
        const totalGas = Math.floor(gasEstimate * multiplier);
        txOptions.gas = totalGas < this.blockGasLimit ? totalGas : this.blockGasLimit;
      }

      if (confirmationType === Types.ConfirmationType.Simulate) {
        let g = txOptions.gas;
        return { gasEstimate, g };
      }
    }

    if (txOptions.value) {
      txOptions.value = new BigNumber(txOptions.value).toFixed(0);
    } else {
      txOptions.value = '0';
    }

    const promi = method.send(txOptions);

    const OUTCOMES = {
      INITIAL: 0,
      RESOLVED: 1,
      REJECTED: 2,
    };

    let hashOutcome = OUTCOMES.INITIAL;
    let confirmationOutcome = OUTCOMES.INITIAL;

    const t = confirmationType !== undefined ? confirmationType : this.confirmationType;

    if (!Object.values(Types.ConfirmationType).includes(t)) {
      throw new Error(`Invalid confirmation type: ${t}`);
    }

    let hashPromise;
    let confirmationPromise;

    if (t === Types.ConfirmationType.Hash || t === Types.ConfirmationType.Both) {
      hashPromise = new Promise(
        (resolve, reject) => {
          promi.on('error', (error) => {
            if (hashOutcome === OUTCOMES.INITIAL) {
              hashOutcome = OUTCOMES.REJECTED;
              reject(error);
              const anyPromi = promi ;
              anyPromi.off();
            }
          });

          promi.on('transactionHash', (txHash) => {
            if (hashOutcome === OUTCOMES.INITIAL) {
              hashOutcome = OUTCOMES.RESOLVED;
              resolve(txHash);
              if (t !== Types.ConfirmationType.Both) {
                const anyPromi = promi ;
                anyPromi.off();
              }
            }
          });
        },
      );
    }

    if (t === Types.ConfirmationType.Confirmed || t === Types.ConfirmationType.Both) {
      confirmationPromise = new Promise(
        (resolve, reject) => {
          promi.on('error', (error) => {
            if (
              (t === Types.ConfirmationType.Confirmed || hashOutcome === OUTCOMES.RESOLVED)
              && confirmationOutcome === OUTCOMES.INITIAL
            ) {
              confirmationOutcome = OUTCOMES.REJECTED;
              reject(error);
              const anyPromi = promi ;
              anyPromi.off();
            }
          });

          const desiredConf = confirmations || this.defaultConfirmations;
          if (desiredConf) {
            promi.on('confirmation', (confNumber, receipt) => {
              if (confNumber >= desiredConf) {
                if (confirmationOutcome === OUTCOMES.INITIAL) {
                  confirmationOutcome = OUTCOMES.RESOLVED;
                  resolve(receipt);
                  const anyPromi = promi ;
                  anyPromi.off();
                }
              }
            });
          } else {
            promi.on('receipt', (receipt) => {
              confirmationOutcome = OUTCOMES.RESOLVED;
              resolve(receipt);
              const anyPromi = promi ;
              anyPromi.off();
            });
          }
        },
      );
    }

    if (t === Types.ConfirmationType.Hash) {
      const transactionHash = await hashPromise;
      if (this.notifier) {
          this.notifier.hash(transactionHash)
      }
      return { transactionHash };
    }

    if (t === Types.ConfirmationType.Confirmed) {
      return confirmationPromise;
    }

    const transactionHash = await hashPromise;
    if (this.notifier) {
        this.notifier.hash(transactionHash)
    }
    return {
      transactionHash,
      confirmation: confirmationPromise,
    };
  }

  async callConstantContractFunction(
    method,
    options
  ) {
    const m2 = method;
    const { blockNumber, ...txOptions } = options;
    return m2.call(txOptions, blockNumber);
  }

  async setGasLimit() {
    const block = await this.web3.eth.getBlock('latest');
    this.blockGasLimit = block.gasLimit - SUBTRACT_GAS_LIMIT;
  }

  setContractProvider(
    contract,
    contractJson,
    provider,
    networkId,
  ){
    contract.setProvider(provider);
    try {
      contract.options.address = contractJson.networks[networkId]
        && contractJson.networks[networkId].address;
    } catch (error) {
      // console.log(error)
    }
  }
}
