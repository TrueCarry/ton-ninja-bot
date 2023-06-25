import { NftQueries } from '@/contracts/nftItem/NftItem.data'
import { buildSwapDataCell, SwapQueries } from '@/contracts/swap/Swap.data'
import { UserInfo, UserStoreData } from '@/types/swap'
import { cn } from '@/utils/cn'
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { useEffect, useMemo } from 'react'
import {
  Address,
  Cell,
  StateInit,
  beginCell,
  contractAddress,
  storeStateInit,
  toNano,
} from 'ton-core'
import { NftItem } from 'tonapi-sdk-js'
import { NFT } from './NFT'
import { updateSwapState, useLastSeqno, useSwapState } from '@/store/swap'
import { AddressRow } from '@/components/ui/AddressRow'
import { TonAccountApi } from '@/utils/tonapi'
import { useNftState } from '@/store/nfts'

const SwapCodeCell = Cell.fromBase64(
  'te6ccgECGgEABOEAART/APSkE/S88sgLAQIBYgIDAgLMBAUCAnIYGQIBIAYHAL3b/HLBHBg/o+N9KQRySBa4WAYADHIDjBBX14QCo5KjgQQQgv5h6KZGWPieWfkeeLKAHni2UAEP0BZQBkuLg5QAxkZYLlgOWECeX/qAH9AWW1ZmSA/YBvSJlxANnzL4JAIBIAgJAgFIFhcE2UAdDTAwFxsJJfBODwA/pAMPhEUhDHBfhJUiDHBfhCUjDHBQPTAQHAAvLhk3nXIdcL/wTTH9M/ghAFE42RUjC64wI2cVIguuMCNjZyUmC6jpY1MgOxWLHAAPLRkfhBcbry4ZPbPPAC4FtzUkC6gKCwwNAgEgFBUD+FBYXwWCEAX14QAToSDBAPLRlfhBcb2OQjAC+kAwgEADcFAjcCCCEF/MPRTIyx8Tyz8jzxZQA88WygAh+gLKAMlxcHKAGMjLBcsBywgTy/9QA/oCy2rMyQH7AOD4RSLwBPhKJPAEA/hl+GpSArHAAOMCMjOW+E1YoPht4w0ODxABsDEz+EFxuvLhk1IQscAA8tGRAvoAMFMDvPLRlQKW+EgioPholvhNIqD4beL4RfAF+Ej4RvhHoL6w+ErwBbD4TfhL+EygvrDDAI6EbDHbPJYwoaFw+wLi8AISAeZy+GH4RfhEIvAI+Er4SSLwCIIID0JAcPsCc/hE+EiCELUYiGAkcIAYyMsFUAXPFlAD+gITy2oSyx/LP8kB+wBz+En4TYIQtRiIYCRwgBjIywVQBc8WUAP6AhPLahLLH8s/yQH7AIEAgvhDcIIQgr2PKlUDEQGOnmwiwADy0ZHTB9QwAfsA4Ft0ErqOq/hBcbr4RfAF+Ej4RvhHoL6w+ErwBbD4TfhL+EygvrDDALCOhNs88AKRMOLgMIQP8vASAIRbAvpAMIBAA3BQI3AgghBfzD0UyMsfE8s/I88WUAPPFsoAIfoCygDJcXBygBjIywXLAcsIE8v/UAP6AstqzMkB+wAADPhIWKD4aAFM+EXwBfhI+Eb4R6C+sPhK8AWw+E34S/hMoL6wwwCOgts8kTDi8AISADRwgBjIywVQBc8WUAP6AhPLahLLH8s/yQH7AAH0c/hh+EX4SSLwCPhK+EQi8AiCCA9CQHD7AnH4RPhM+Ej4RvhHoKGgghDvA9AJJHCAGMjLBVAFzxZQA/oCE8tqEssfyz/JAfsAcfhJ+Ef4TfhL+EygoaCCEO8D0AkkcIAYyMsFUAXPFlAD+gITy2oSyx/LP8kB+wCBAIITAEr4Q3CCEIK9jypVA3CAGMjLBVAFzxZQA/oCE8tqEssfyz/JAfsAAHcyPhDzxb4Qs8WyfhK+EX4QcjLAfhEzxb4Sc8W+Eb6AvhH+gL4SPoC9AD4S/oC+Ez6AvhN+gL0AMzJ7VSAAjztRNDTAQH4YfpAAfhk+kAB+Gn6AAH4ZvoAAfhn+gAB+Gj0BAH4ZfoAAfhr+gAB+Gz6AAH4bfQEAfhq1DDQ+kAB+GP6QDD4YoAA3FMBgwf0Dm+hMcAAkjBw4HHIywDJ0AKDB/QWf4AA/H8gjhgigwf0fG+lIJoC1wsAwACScDPekTLiAbPmMDGAAcbIXvAD+EXwBfhI+Eb4R6C+sPhK8AX4TfhL+EygvrD4QfhE+En4RfhK+Eb4R/hI+Ev4TPhNEKwQq4AANsq08AP4QoA=='
)

interface SwapNft {
  nft: NftItem
  ok: boolean
}

export function CompleteSwapActions({ store, user }: { store: UserStoreData; user: UserInfo }) {
  const [tonConnect] = useTonConnectUI()
  const connectAddress = useTonAddress(false)
  const nftState = useNftState()

  const { stateInit, swapAddress } = useMemo(() => {
    const dataCell =
      (store.users.user1?.address &&
        store.users.user2?.address &&
        buildSwapDataCell({
          state: 1, // active
          commissionAddress: Address.parse(store.users.user1.address),
          leftAddress: Address.parse(store.users.user1.address),
          leftAmount: toNano(store.users.user1.tonAmount),
          leftCoinsGot: 0n,
          leftCommission: 0n,
          rightAddress: Address.parse(store.users.user2.address),
          rightAmount: toNano(store.users.user2.tonAmount),
          rightCoinsGot: 0n,
          rightCommission: 0n,

          supervisorAddress: Address.parse('EQDGSoliBrcpbjisgi-Xy5rjSpUIoPQSEn8kRn6n_yGQrExz'),
          leftNft: store.users.user1.selectedNfts.map((n) => ({
            addr: Address.parse(n),
            sent: false,
          })),

          rightNft: store.users.user2.selectedNfts.map((n) => ({
            addr: Address.parse(n),
            sent: false,
          })),
        })) ||
      new Cell()

    const stateInit: StateInit = {
      code: SwapCodeCell,
      data: dataCell,
    }

    const swapAddress = contractAddress(0, stateInit)

    return {
      dataCell,
      stateInit,
      swapAddress,
    }
  }, [
    store.users.user1?.address,
    store.users.user2?.address,
    store.users.user1?.selectedNfts,
    store.users.user2?.selectedNfts,
    store.users.user1?.tonAmount,
    store.users.user2?.tonAmount,
  ])

  const doDeploy = async () => {
    store.trade.deployStarted = true

    const validTill = Date.now() + 60 * 1000 // 60 secs
    try {
      const topUp = SwapQueries.topup({})

      await tonConnect.sendTransaction({
        messages: [
          {
            address: swapAddress.toRawString(),
            amount: toNano('0.1').toString(),
            stateInit: beginCell()
              .store(storeStateInit(stateInit))
              .endCell()
              .toBoc()
              .toString('base64'),
            payload: topUp.toBoc().toString('base64'),
          },
        ],
        validUntil: Math.floor(validTill / 1000),
      })
    } catch (error) {
      console.log('deploy error', error)
      store.trade.deployStarted = false
    }

    const interval = setInterval(async () => {
      if (Date.now() > validTill) {
        clearInterval(interval)
        store.trade.deployStarted = false
        return
      }

      const state = await TonAccountApi.getAccount({
        accountId: swapAddress.toRawString(),
      })

      if (state.status === 'active') {
        clearInterval(interval)
        store.trade.deployed = true
      }
    }, 1000)
  }

  const swapSwate = useSwapState()

  const seqno = useLastSeqno()

  const { targetUser, targetMoney, targetNfts, targetGotMoney } = useMemo(() => {
    if (!swapSwate.get()?.leftAddr) {
      return {
        targetUser: undefined,
        targetMoney: undefined,
        targetGotMoney: undefined,
        targetNfts: undefined,
      }
    }

    const leftAddr = swapSwate.get()?.leftAddr as Address
    const rightAddr = swapSwate.get()?.rightAddr as Address
    if (leftAddr.equals(Address.parse(user.address))) {
      return {
        targetUser: store.users.user1,
        targetMoney: swapSwate.get()?.leftAmount,
        targetNfts: swapSwate.get()?.leftNft,
        targetGotMoney: swapSwate.get()?.leftGot,
      }
    }

    if (rightAddr.equals(Address.parse(user.address))) {
      return {
        targetUser: store.users.user2,
        targetMoney: swapSwate.get()?.rightAmount,
        targetNfts: swapSwate.get()?.rightNft,
        targetGotMoney: swapSwate.get()?.rightGot,
      }
    }

    return {
      targetUser: undefined,
      targetMoney: undefined,
      targetNfts: undefined,
      targetGotMoney: undefined,
    }
  }, [swapSwate, user])
  const nfts = useMemo(() => {
    const res: SwapNft[] = []
    if (!targetNfts) {
      return []
    }
    for (const [hash, ok] of targetNfts) {
      const addr = new Address(0, hash)
      if (nftState.nfts[addr.toRawString()].get()) {
        res.push({
          nft: nftState.nfts[addr.toRawString()].get() as NftItem,
          ok,
        })
      }
    }

    return res.filter((n) => !!n)
  }, [targetNfts])

  const nftChunks = getChunks(nfts, 4)

  useEffect(() => {
    updateSwapState(swapAddress, seqno)
  }, [swapAddress, seqno])

  const isYou = connectAddress === user.address
  const isSwapOk = swapSwate.get()?.leftOk && swapSwate.get()?.rightOk

  return (
    <div>
      <h3 className="h-8">
        {isYou ? (
          'Your transactions'
        ) : (
          <>
            <AddressRow rawAddress={user.address} />
          </>
        )}
      </h3>

      <div className="flex flex-col gap-2">
        {isYou && !swapSwate.get() && (
          <button
            className={cn(
              'p-2 rounded shadow bg-slate-800 h-16 flex items-center border border-slate-50/5'
            )}
            onClick={doDeploy}
            disabled={!(store.users.user1?.confirmed && store.users.user2?.confirmed)}
          >
            Deploy contract
          </button>
        )}

        {!!targetMoney && targetUser && (
          <SendMoneyWidget
            store={store}
            swapAddress={swapAddress}
            user={targetUser}
            trade={targetMoney}
            targetGotMoney={targetGotMoney || 0n}
          />
        )}

        {targetUser && nftChunks.length > 0 && (
          <div className="flex flex-col gap-2">
            {nftChunks?.map((nfts, j) => {
              return (
                <SendNftWidget
                  store={store}
                  swapAddress={swapAddress}
                  key={j}
                  trade={nfts}
                  user={targetUser}
                />
              )
            })}
          </div>
        )}

        {!isSwapOk && targetUser && isYou && (
          <SendCancelWidget store={store} swapAddress={swapAddress} user={targetUser} />
        )}
      </div>
    </div>
  )
}

function SendMoneyWidget({
  user,
  swapAddress,
  trade,
  targetGotMoney,
}: {
  store: UserStoreData
  user: UserInfo
  swapAddress: Address
  trade: bigint
  targetGotMoney: bigint
}) {
  const [tonConnect] = useTonConnectUI()
  const connectAddress = useTonAddress(false)

  const sendMoney = async (amount: bigint) => {
    // trade.started = true

    const validTill = Date.now() + 60 * 1000 // 60 secs
    try {
      await tonConnect.sendTransaction({
        messages: [
          {
            address: swapAddress.toRawString(),
            amount: (amount + 100000000n).toString(),
            payload: SwapQueries.addCoins({
              coins: amount,
            })
              .toBoc()
              .toString('base64'),
          },
        ],
        validUntil: Math.floor(validTill / 1000),
      })
    } catch (e) {
      // trade.started = false
    }
  }

  const isYou = connectAddress === user.address
  const allItemsGood = targetGotMoney === trade
  const disabled = !isYou || allItemsGood

  return (
    <div
      className={cn(
        'relative rounded shadow bg-slate-800/90 h-16 border border-slate-50/5 flex items-center px-2',
        disabled && 'bg-slate-900 cursor-default'
      )}
    >
      <button
        className={cn('p-2 flex items-center w-full')}
        onClick={() => sendMoney(trade)}
        disabled={disabled}
      >
        Send {user?.tonAmount} TON
        {allItemsGood && (
          <div className="absolute w-6 h-6 rounded-full bg-green-500 top-2 right-2"></div>
        )}
      </button>
    </div>
  )
}

function SendCancelWidget({
  swapAddress,
}: {
  store: UserStoreData
  user?: UserInfo
  swapAddress: Address
}) {
  const [tonConnect] = useTonConnectUI()
  const sendCancel = () => {
    tonConnect.sendTransaction({
      messages: [
        {
          address: swapAddress.toRawString(),
          amount: 100000000n.toString(),
          payload: SwapQueries.cancel({}).toBoc().toString('base64'),
        },
      ],
      validUntil: Math.floor(Date.now() / 1000) + 60,
    })
  }

  return (
    <button
      className={cn(
        'p-2 rounded shadow bg-slate-800/90 h-16 flex items-center border border-slate-50/5'
      )}
      onClick={() => sendCancel()}
    >
      Send Cancel
    </button>
  )
}

function SendNftWidget({
  user,
  swapAddress,
  trade,
}: {
  store: UserStoreData
  user: UserInfo
  swapAddress: Address
  // trade: TradeNfts
  trade: SwapNft[]
}) {
  const [tonConnect] = useTonConnectUI()
  const connectAddress = useTonAddress(false)
  const isYou = connectAddress === user.address

  const sendNft = async (nfts: string[]) => {
    // trade.started = true

    const validTill = Date.now() + 60 * 1000 // 60 secs

    try {
      const sendRes = await tonConnect.sendTransaction({
        messages: nfts.map((nft) => ({
          address: nft,
          amount: toNano(1n).toString(),
          payload: NftQueries.transfer({
            newOwner: swapAddress,
            forwardAmount: 100000000n,
            responseTo: Address.parse(connectAddress),
          })
            .toBoc()
            .toString('base64'),
        })),
        validUntil: Math.floor(validTill / 1000),
      })

      console.log('send nft res', sendRes)

      console.log('hash?')
    } catch (e) {
      console.log('nft error', e)
      // trade.started = false
    }
  }

  const allItemsGood = trade.reduce((acc, curr) => {
    if (!acc || !curr.ok) {
      return false
    }

    return true
  }, true)

  const disabled = !isYou || allItemsGood

  // const nftItems = trade.nfts.map((n) => store.nfts[n])
  return (
    <button
      className={cn(
        'grid grid-cols-9 p-2 bg-slate-800/90 gap-2 cursor-pointer border rounded border-slate-50/5',
        disabled && 'bg-slate-900 cursor-default'
      )}
      onClick={() => sendNft(trade.map((n) => n.nft.address))}
      disabled={disabled}
    >
      {trade.map((nft, i) => {
        return (
          <div className={cn('col-span-2 h-32 relative')}>
            <NFT
              className={cn('h-32')}
              nft={nft.nft}
              key={i}
              topRightSlot={
                nft.ok && (
                  <div className="absolute w-6 h-6 rounded-full bg-green-500 top-2 right-2"></div>
                )
              }
            />
            {nft.ok && (
              <div className="absolute w-6 h-6 rounded-full bg-green-500 top-2 right-2"></div>
            )}
          </div>
        )
      })}

      {!disabled && <div className="col-start-9 col-end-9">Send </div>}
    </button>
  )
}

export function getChunks<T>(input: T[], size: number): T[][] {
  if (input.length === 0) {
    return []
  }
  if (input.length < size) {
    return [input]
  }

  const chunks: T[][] = []

  for (let i = 0; i < input.length; i += size) {
    const chunk = input.slice(i, i + size)
    chunks.push(chunk)
  }

  return chunks
}
