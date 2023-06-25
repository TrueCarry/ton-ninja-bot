import { TonClient4 } from 'ton'
import { Address, Builder, Cell, Dictionary, beginCell } from 'ton-core'

export const SwapState = {
  Active: 1,
  Cancelled: 2,
  Completed: 3,
}

interface NFTItem {
  addr: Address
  sent: boolean
}

export type SwapData = {
  state: number
  leftAddress: Address
  rightAddress: Address
  rightNft: NFTItem[]
  leftNft: NFTItem[]
  supervisorAddress: Address
  commissionAddress: Address
  leftCommission: bigint
  leftAmount: bigint
  leftCoinsGot: bigint
  rightCommission: bigint
  rightAmount: bigint
  rightCoinsGot: bigint
}

// export type DictValueType = {
//   sent: boolean
// }

// const ResultsDictValueSerializer = {
//   serialize(src: DictValueType, builder: Builder) {
//     builder.store
//   },
//   parse(src: Slice): DictValueType {
//     return {
//       key: src.loadUintBig(64),
//       address: src.loadAddress(),
//     }
//   },
// }

export function buildSwapDataCell(data: SwapData) {
  const dataCell = beginCell()
  dataCell.storeUint(data.state, 2)
  dataCell.storeAddress(data.leftAddress)
  dataCell.storeAddress(data.rightAddress)

  dataCell.storeCoins(data.leftCommission)
  dataCell.storeCoins(data.leftAmount)
  dataCell.storeCoins(data.leftCoinsGot)
  // dataCell.storeBit(data.leftNft.length > 0)

  if (data.leftNft.length > 0) {
    const leftNftDict = Dictionary.empty(Dictionary.Keys.Buffer(32), Dictionary.Values.Bool())
    for (const leftNftKey in data.leftNft) {
      leftNftDict.set(
        data.leftNft[leftNftKey].addr.hash,
        data.leftNft[leftNftKey].sent
        // beginCell().storeBit(data.leftNft[leftNftKey].sent).endCell()
      )
    }

    dataCell.storeDict(leftNftDict)
  } else {
    dataCell.storeBit(0)
  }

  dataCell.storeCoins(data.rightCommission)
  dataCell.storeCoins(data.rightAmount)
  dataCell.storeCoins(data.rightCoinsGot)
  // dataCell.storeBit(data.rightNft.length > 0)

  // if (data.rightNft.length > 0) {
  //   const rightNft = new DictBuilder(256)
  //   for (const rightNftKey in data.rightNft) {
  //     const bitCell = beginCell()
  //     bitCell.storeBit(data.rightNft[rightNftKey].sent)

  //     rightNft.storeCell(new bigint(data.rightNft[rightNftKey].addr.hash), bitCell)
  //   }
  //   dataCell.storeRef(rightNft.endCell())
  // }
  if (data.rightNft.length > 0) {
    const rightNftDict = Dictionary.empty(Dictionary.Keys.Buffer(32), Dictionary.Values.Bool())
    for (const nftKey in data.rightNft) {
      rightNftDict.set(
        data.rightNft[nftKey].addr.hash,
        data.rightNft[nftKey].sent
        // beginCell().storeBit(data.rightNft[nftKey].sent).endCell()
      )
    }

    dataCell.storeDict(rightNftDict)
  } else {
    dataCell.storeBit(0)
  }

  const marketCell = beginCell()
  marketCell.storeAddress(data.commissionAddress)
  marketCell.storeAddress(data.supervisorAddress)

  dataCell.storeRef(marketCell)

  return dataCell.endCell()
}

export type StateResponse = {
  state: number
  leftOk: boolean
  rightOk: boolean
  leftAddr: Address
  rightAddr: Address
  leftNft: Dictionary<Buffer, boolean> | undefined
  rightNft: Dictionary<Buffer, boolean> | undefined
  leftComm: bigint
  leftAmount: bigint
  leftGot: bigint
  rightComm: bigint
  rightAmount: bigint
  rightGot: bigint
}

export async function getSwapState(
  address: Address,
  seqno: number,
  tonClient: TonClient4
): Promise<StateResponse | undefined> {
  if (!seqno) {
    return
  }
  const res = await tonClient.runMethod(seqno, address, 'get_trade_state') // await this.contract.invokeGetMethod('get_trade_state', [])
  if (res.exitCode !== 0) {
    throw new Error(`Cant invoke get_trade_state`)
  }

  const [
    state,
    leftOk,
    rightOk,
    leftAddr,
    rightAddr,
    leftNft,
    rightNft,
    leftComm,
    leftAmount,
    leftGot,
    rightComm,
    rightAmount,
    rightGot,
  ] = [
    res.reader.readNumber(),
    res.reader.readBoolean(),
    res.reader.readBoolean(),
    res.reader.readAddress(),
    res.reader.readAddress(),
    res.reader.readCellOpt(),
    res.reader.readCellOpt(),
    res.reader.readBigNumber(),
    res.reader.readBigNumber(),
    res.reader.readBigNumber(),
    res.reader.readBigNumber(),
    res.reader.readBigNumber(),
    res.reader.readBigNumber(),
  ]

  const leftMap = leftNft
    ? leftNft.asSlice().loadDictDirect(Dictionary.Keys.Buffer(32), Dictionary.Values.Bool())
    : undefined

  const rightMap = rightNft
    ? rightNft.asSlice().loadDictDirect(Dictionary.Keys.Buffer(32), Dictionary.Values.Bool())
    : undefined

  const result = {
    state,
    leftOk,
    rightOk,
    leftAddr,
    rightAddr,
    leftNft: leftMap,
    rightNft: rightMap,
    leftComm,
    leftAmount,
    leftGot,
    rightComm,
    rightAmount,
    rightGot,
  }
  // setSwapState()
  //   })()
  // }, [seqno, tonClient])

  return result
}

export const OperationCodes = {
  ownershipAssigned: 0x05138d91,
  addCoins: 1,
  cancel: 2,
  maintain: 3,
  topup: 4,
  transferCommission: 0x82bd8f2a,
  transferCancel: 0xb5188860,
  transferComplete: 0xef03d009,
}

export const SwapQueries = {
  nftOwnerAssigned: (params: { queryId?: number; prevOwner: Address }) => {
    const msgBody = beginCell()
    msgBody.storeUint(OperationCodes.ownershipAssigned, 32)
    msgBody.storeUint(params.queryId || 0, 64)
    msgBody.storeAddress(params.prevOwner)

    return msgBody.endCell()
  },
  addCoins: (params: { queryId?: number; coins: bigint }) => {
    const msgBody = beginCell()
    msgBody.storeUint(OperationCodes.addCoins, 32)
    msgBody.storeUint(params.queryId || 0, 64)
    msgBody.storeCoins(params.coins)

    return msgBody.endCell()
  },
  cancel: (params: { queryId?: number }) => {
    const msgBody = beginCell()
    msgBody.storeUint(OperationCodes.cancel, 32)
    msgBody.storeUint(params.queryId || 0, 64)

    return msgBody.endCell()
  },
  transferCommission: (params: { queryId?: number }) => {
    const msgBody = beginCell()
    msgBody.storeUint(OperationCodes.transferCommission, 32)
    msgBody.storeUint(params.queryId || 0, 64)

    return msgBody.endCell()
  },
  transferCancel: (params: { queryId?: number }) => {
    const msgBody = beginCell()
    msgBody.storeUint(OperationCodes.transferCancel, 32)
    msgBody.storeUint(params.queryId || 0, 64)

    return msgBody.endCell()
  },
  transferComplete: (params: { queryId?: number }) => {
    const msgBody = beginCell()
    msgBody.storeUint(OperationCodes.transferComplete, 32)
    msgBody.storeUint(params.queryId || 0, 64)

    return msgBody.endCell()
  },
  maintain: (params: { queryId?: number; mode: number; msg: Cell }) => {
    const msgBody = beginCell()
    msgBody.storeUint(OperationCodes.maintain, 32)
    msgBody.storeUint(params.queryId || 0, 64)
    msgBody.storeUint(params.mode, 8)
    msgBody.storeRef(params.msg)

    return msgBody.endCell()
  },
  topup: (params: { queryId?: number }) => {
    const msgBody = beginCell()
    msgBody.storeUint(OperationCodes.topup, 32)
    msgBody.storeUint(params.queryId || 0, 64)

    return msgBody.endCell()
  },
  makeMessage: (params: { queryId?: number; to: Address; amount: bigint; body: Builder }) => {
    const msgBody = beginCell()
    msgBody.storeUint(0x18, 6)
    msgBody.storeAddress(params.to)
    msgBody.storeCoins(params.amount)
    msgBody.storeUint(0, 1 + 4 + 4 + 64 + 32 + 1 + 1)
    msgBody.storeBuilder(params.body)

    return msgBody.endCell()
  },
}
