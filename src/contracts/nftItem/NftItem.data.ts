import { Address, beginCell, Cell } from 'ton-core'

export type NftItemData = {
  index: bigint
  collectionAddress: Address | null
  ownerAddress: Address
  content: string
}

export function buildNftItemDataCell(data: NftItemData): Cell {
  const dataCell = beginCell()

  const contentCell = beginCell()
  // contentCell.bits.writeString(data.content)
  contentCell.storeBuffer(Buffer.from(data.content))

  dataCell.storeUint(data.index, 64)
  dataCell.storeAddress(data.collectionAddress)
  dataCell.storeAddress(data.ownerAddress)
  dataCell.storeRef(contentCell.endCell())

  return dataCell.endCell()
}

export type RoyaltyParams = {
  // numerator
  royaltyFactor: number
  // denominator
  royaltyBase: number
  royaltyAddress: Address
}

export type NftSingleData = {
  ownerAddress: Address
  editorAddress: Address
  content: string
  royaltyParams: RoyaltyParams
}

export const OperationCodes = {
  transfer: 0x5fcc3d14,
  getStaticData: 0x2fcb26a2,
  getStaticDataResponse: 0x8b771735,
  GetRoyaltyParams: 0x693d3950,
  GetRoyaltyParamsResponse: 0xa8cb00ad,
  EditContent: 0x1a0b9d51,
  TransferEditorship: 0x1c04412a,
}

export const NftQueries = {
  transfer: (params: {
    queryId?: number
    newOwner: Address
    responseTo?: Address
    forwardAmount?: bigint
    forwardPayload?: Cell
  }): Cell => {
    const msgBody = beginCell()
    msgBody.storeUint(OperationCodes.transfer, 32)
    msgBody.storeUint(params.queryId || 0, 64)
    msgBody.storeAddress(params.newOwner)
    msgBody.storeAddress(params.responseTo || null)
    msgBody.storeBit(false) // no custom payload
    msgBody.storeCoins(params.forwardAmount || 0)

    if (params.forwardPayload) {
      // msgBody.storeBit(1)
      msgBody.storeBuilder(params.forwardPayload.asBuilder())
    } else {
      msgBody.storeBit(0) // no forward_payload yet
    }

    return msgBody.endCell()
  },
  getStaticData: (params: { queryId?: number }): Cell => {
    const msgBody = beginCell()
    msgBody.storeUint(OperationCodes.getStaticData, 32)
    msgBody.storeUint(params.queryId || 0, 64)
    return msgBody.endCell()
  },
  getRoyaltyParams: (params: { queryId?: number }): Cell => {
    const msgBody = beginCell()
    msgBody.storeUint(OperationCodes.GetRoyaltyParams, 32)
    msgBody.storeUint(params.queryId || 0, 64)
    return msgBody.endCell()
  },
}
