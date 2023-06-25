import { Address, beginCell, contractAddress, StateInit } from 'ton'
import { NftFixPriceSaleV2CodeCell } from './NftFixpriceSaleV2.source'

export type NftFixPriceSaleV2Data = {
  isComplete: boolean
  createdAt: number
  marketplaceAddress: Address
  nftAddress: Address
  nftOwnerAddress: Address | null
  fullPrice: bigint
  marketplaceFeeAddress: Address
  marketplaceFee: bigint
  royaltyAddress: Address
  royaltyAmount: bigint
}

export function buildNftFixPriceSaleV2DataCell(data: NftFixPriceSaleV2Data) {
  const feesCell = beginCell()

  feesCell.storeAddress(data.marketplaceFeeAddress)
  feesCell.storeCoins(data.marketplaceFee)
  feesCell.storeAddress(data.royaltyAddress)
  feesCell.storeCoins(data.royaltyAmount)

  const dataCell = beginCell()

  dataCell.storeUint(data.isComplete ? 1 : 0, 1)
  dataCell.storeUint(data.createdAt, 32)
  dataCell.storeAddress(data.marketplaceAddress)
  dataCell.storeAddress(data.nftAddress)
  dataCell.storeAddress(data.nftOwnerAddress)
  dataCell.storeCoins(data.fullPrice)
  dataCell.storeRef(feesCell.endCell())
  dataCell.storeUint(0, 1) // can_deploy_by_external

  return dataCell.endCell()
}

export function buildNftFixPriceSaleV2StateInit(data: Omit<NftFixPriceSaleV2Data, 'isComplete'>) {
  const dataCell = buildNftFixPriceSaleV2DataCell({
    ...data,
    // Nft owner address would be set by NFT itself by ownership_assigned callback
    nftOwnerAddress: data.nftOwnerAddress,
    isComplete: false,
  })

  const stateInit: StateInit = {
    code: NftFixPriceSaleV2CodeCell,
    data: dataCell,
  }

  const address = contractAddress(0, stateInit)

  return {
    address,
    stateInit,
  }
}

export const OperationCodes = {
  AcceptCoins: 1,
  Buy: 2,
  CancelSale: 3,
}

export const Queries = {
  cancelSale: (params: { queryId?: number }) => {
    const msgBody = beginCell()
    msgBody.storeUint(OperationCodes.CancelSale, 32)
    msgBody.storeUint(params.queryId ?? 0, 64)
    return msgBody.endCell()
  },
}
