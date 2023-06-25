import { Address } from 'ton-core'
import { useEffect, useState } from 'react'
import { NftItem } from 'tonapi-sdk-js'
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { CanChangeState, addressEquals } from '@/utils/addressEquals'
import { cn } from '@/utils/cn'
import { UserInfo, UserStoreData } from '@/types/swap'
import { NFT } from './NFT'
import { isMobile } from '@/utils/isMobile'
import { AddressRow } from '@/components/ui/AddressRow'
import { useNftState } from '@/store/nfts'
import { ImmutableObject } from '@hookstate/core'

export function UserInventoryList({ store }: { store: UserStoreData }) {
  const [tonconnect] = useTonConnectUI()
  if (!store.users.user1) {
    return (
      <>
        <div
          className="bg-slate-800/90 p-2 rounded border border-slate-50/5 flex flex-col gap-2 h-32 justify-center items-center cursor-pointer"
          onClick={() => tonconnect.connectWallet()}
        >
          <div className="text-white text-xl">Connect your wallet to continue</div>

          {/* <TonConnectButton key={1} className="w-64" /> */}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="grid grid-rows-2 gap-2">
        {[store.users.user1, store.users.user2].map((user, i) => (
          <UserInventory key={i} user={user} store={store} />
        ))}
      </div>
    </>
  )
}

export function UserInventory({ store, user }: { store: UserStoreData; user?: UserInfo }) {
  const [secondAddress, setSecondAddress] = useState('')
  const connectAddress = useTonAddress(false)
  const isYou = addressEquals(user?.address || '', connectAddress)
  const canChangeState = CanChangeState(store, connectAddress, user?.address || '')
  const nftState = useNftState()

  const addSecondUser = async () => {
    const address = Address.parse(secondAddress)

    store.users.user2 = {
      index: 1,
      address: address.toRawString(),
      selectedNfts: [],
      tonAmount: '0',
      tonBalance: '0',
      confirmed: false,
      connected: false,
    }
  }

  const [currentPage, setCurrentPage] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setCurrentPage(0)
  }, [search])

  if (!user) {
    return (
      <div>
        <div className="bg-slate-800/90 p-2 rounded border border-slate-50/5 flex flex-col gap-2">
          <label htmlFor="secondTonAddress">Add Second by address:</label>
          <input
            id="secondTonAddress"
            className="p-2 rounded bg-slate-900 outline-none"
            type="text"
            placeholder="EQC..."
            autoComplete="off"
            onChange={(e) => setSecondAddress(e.target.value)}
          />
          <button className="p-2 rounded bg-slate-900" onClick={addSecondUser}>
            Add User
          </button>
        </div>
      </div>
    )
  }

  const addNftToTrade = (nft: NftItem | ImmutableObject<NftItem>) => {
    if (!canChangeState) {
      return
    }
    user.selectedNfts = [...user.selectedNfts, nft.address]
    if (store.users.user1) store.users.user1.confirmed = false
    if (store.users.user2) store.users.user2.confirmed = false
  }

  console.log('user nfts', nftState.userNfts[user.index], user.index)
  const nfts = nftState.userNfts[user.index]
    .get()
    .map((n) => nftState.nfts[n]?.get())
    .filter((nft) => nft && !user.selectedNfts.includes(nft.address))
    .filter((nft) => {
      return nft?.metadata?.name?.includes(search) || nft?.metadata?.description?.includes(search)
    })
  const nftsPerPage = isMobile() ? 4 : 8
  const lastPage = Math.floor(nfts.length / nftsPerPage)

  return (
    <div
      className={cn(
        'flex flex-col bg-slate-800/90 border border-slate-50/5 rounded min-w-0 max-w-full h-96 md:h-full',
        !canChangeState && 'bg-slate-950'
      )}
    >
      <div className="flex justify-between bg-slate-700 rounded-t px-4 items-center border-b border-slate-50/5">
        <div className="text-lg w-full max-w-[50%] whitespace-nowrap">
          {isYou ? (
            'Your NFTs'
          ) : (
            <>
              <AddressRow rawAddress={user.address} />
            </>
          )}
        </div>

        <div className="my-2">
          {/* <label htmlFor="searchInput">Filter: </label> */}
          <input
            id="searchInput"
            type="text"
            className="outline-none rounded px-2 py-1 bg-slate-900 text-white w-full"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            placeholder="Filter NFTs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 grid-rows-2 h-full p-4">
        {nfts.slice(currentPage * nftsPerPage, (currentPage + 1) * nftsPerPage).map((nft) => (
          <NFT
            className="shadow-lg cursor-pointer select-none"
            onClick={() => addNftToTrade(nft)}
            nft={nft}
            key={nft.address}
          />
        ))}
      </div>

      <div className="bg-slate-700 rounded-b border-t border-slate-50/5 w-full py-2">
        <div className="flex mx-auto items-center justify-center gap-2">
          <button
            className="p-1 bg-slate-900 rounded h-8 w-8 flex items-center justify-center disabled:bg-slate-900"
            onClick={() => setCurrentPage((c) => c - 1)}
            disabled={currentPage < 1}
          >
            &lt;
          </button>
          <div>{currentPage + 1}</div>
          <div>/</div>
          <div>{lastPage + 1}</div>
          <button
            className="p-1 bg-slate-900 rounded h-8 w-8 flex items-center justify-center disabled:bg-slate-900"
            onClick={() => setCurrentPage((c) => c + 1)}
            disabled={currentPage > lastPage - 1}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  )
}
