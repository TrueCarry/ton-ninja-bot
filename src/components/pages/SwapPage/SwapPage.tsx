import { useParams } from 'react-router-dom'
import { syncedStore, getYjsDoc } from '@syncedstore/core'
import { WebsocketProvider } from 'y-websocket'
import { useEffect, useRef, useState } from 'react'
import { useSyncedStore } from '@syncedstore/react'
import { useTonAddress } from '@tonconnect/ui-react'

import { UserInventoryList } from './UserInventory'
import { TradeInventory } from './TradeInventory'

import { ChatWindow } from './ChatWindow'
import { UserInfo, UserStoreData } from '@/types/swap'
import { CompleteSwapActions } from './CompleteSwapActions'
import { useSwapState } from '@/store/swap'
import { isTestnet } from '@/utils/constants'
import { updateUserNfts } from '@/store/nfts'

const initData: UserStoreData = {
  users: {},
  chat: {},
  trade: {},
}

// function compareArrays(a: unknown[], b: unknown[]) {
//   if (!a || !b) {
//     return false
//   }
//   if (a.length !== b.length) {
//     return false
//   } else {
//     // Comparing each element of your array
//     for (let i = 0; i < a.length; i++) {
//       if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) {
//         return false
//       }
//     }
//     return true
//   }
// }

export function SwapPage() {
  const connectAddress = useTonAddress(false)
  const { swapId } = useParams()

  const [syncStat, setSyncStat] = useState(0)
  const populateRef = useRef(false)

  if (!swapId) return <div>404</div>

  const [store] = useState(syncedStore(initData))

  const s: UserStoreData = useSyncedStore(store)

  const populateUser = async () => {
    console.log('populate user', syncStat)

    if (!syncStat) {
      console.log('web socket not synced')
      return
    }

    console.log('populating user', syncStat, connectAddress, 'a', !!s.users.user1, !!s.users.user2)
    if (!connectAddress) {
      return
    }

    if (populateRef.current) {
      return
    }

    populateRef.current = true

    let currentUser: UserInfo | undefined
    if (!s.users.user1 || s?.users?.user1?.address === connectAddress) {
      if (!s.users.user1) {
        console.log('set user 1')
        s.users.user1 = {
          index: 0,
          address: connectAddress,
          selectedNfts: [],
          tonAmount: '0',
          tonBalance: '0',
          confirmed: false,
          connected: true,
        }
      }

      currentUser = s.users.user1
    } else if (!s.users.user2 || s?.users?.user2?.address === connectAddress) {
      if (!s.users.user2) {
        s.users.user2 = {
          index: 1,
          address: connectAddress,
          selectedNfts: [],
          tonAmount: '0',
          tonBalance: '0',
          confirmed: false,
          connected: true,
        }
      }
      currentUser = s.users.user2
    }

    if (!currentUser) {
      populateRef.current = false
      return
    }

    currentUser.connected = true
    populateRef.current = false
  }

  useEffect(() => {
    if (s.users.user1?.address) {
      updateUserNfts(s.users.user1?.address, 0)
    }
  }, [s.users.user1?.address])

  useEffect(() => {
    console.log('user2 effect', s.users.user2?.address)
    if (s.users.user2?.address) {
      updateUserNfts(s.users.user2?.address, 1)
    }
  }, [s.users.user2?.address])

  useEffect(() => {
    populateUser()
  }, [connectAddress, s, syncStat])

  const ref = useRef<boolean>(false)

  useEffect(() => {
    if (ref.current) {
      return
    }
    ref.current = true

    const doc = getYjsDoc(store)

    const wsProvider = new WebsocketProvider(
      import.meta.env.VITE_WS_ADDRESS || 'wss://ws.ton.ninja', // ws
      `tnjj-${isTestnet ? 'testnet' : 'mainnet'}-${swapId}`,
      doc
    )
    wsProvider.on('sync', (synced: boolean) => {
      console.log('ws sync synced', synced)
      if (synced) {
        setSyncStat((v) => v + 1)
      }
    })
  }, [])

  const tradeUsers: UserInfo[] =
    s.users.user1 && s.users.user2
      ? s.users.user2?.address === connectAddress
        ? [s.users.user2, s.users.user1]
        : [s.users.user1, s.users.user2]
      : []

  const swapSwate = useSwapState()

  if (!syncStat) {
    return (
      <div className="w-full mt-4 h-8">
        <h3 className="font-bold text-2xl">Connecting...</h3>
      </div>
    )
  }

  return (
    <>
      {swapSwate.get()?.leftOk && swapSwate.get()?.rightOk && (
        <>
          <div className="w-full mt-4 h-8">
            <h3 className="font-bold text-2xl">Swap completed successfully</h3>
          </div>
          <div className="w-full"></div>
        </>
      )}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_300px] gap-2 md:gap-4 md:h-full px-4 md:px-0">
        <>
          <div className="grid grid-cols-1 grid-rows-[1fr] md:pb-4 pt-4 gap-2 md:h-full">
            {s.users.user1?.confirmed && s.users.user2?.confirmed ? (
              <CompleteSwapActions store={s} user={tradeUsers[0]} />
            ) : (
              <UserInventoryList store={s} />
            )}
          </div>
          {s.users.user1?.confirmed && s.users.user2?.confirmed ? (
            <div className="pb-4 pt-4 gap-2">
              <CompleteSwapActions store={s} user={tradeUsers[1]} />
            </div>
          ) : (
            <div className="flex flex-col md:grid md:grid-cols-1 md:grid-rows-2 md:pb-4 md:pt-4 gap-2 md:h-full md:overflow-hidden">
              {[s.users.user1, s.users.user2].map((user, i) => (
                <TradeInventory key={i} user={user} store={s} />
              ))}
            </div>
          )}
        </>

        <ChatWindow store={s} />
      </div>
    </>
  )
}
