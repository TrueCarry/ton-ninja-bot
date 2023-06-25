import { NftItem } from 'tonapi-sdk-js'
import { CanChangeState } from '@/utils/addressEquals'
import { useTonAddress } from '@tonconnect/ui-react'
import { cn } from '@/utils/cn'
import { UserInfo, UserStoreData } from '@/types/swap'
import { NFT } from './NFT'
import { useNftState } from '@/store/nfts'

export function TradeInventory({ store, user }: { store: UserStoreData; user?: UserInfo }) {
  const connectAddress = useTonAddress(false)
  const canChangeState = CanChangeState(store, connectAddress, user?.address || '')
  const isYou = connectAddress === user?.address
  const nftState = useNftState()

  if (!user) {
    return <div></div>
  }

  const removeNftToTrade = (nft: string) => {
    if (!canChangeState) {
      return
    }
    user.selectedNfts = user.selectedNfts.filter((n) => n !== nft)
    if (store.users.user1) store.users.user1.confirmed = false
    if (store.users.user2) store.users.user2.confirmed = false
  }

  const confirmTrade = (checked: boolean) => {
    if (!isYou) {
      return
    }

    if (store.users.user1?.confirmed && store.users.user2?.confirmed) {
      return
    }
    user.confirmed = checked
  }

  const changeTonAmount = (value: string) => {
    if (!canChangeState) {
      return
    }

    if (value === '') {
      user.tonAmount = ''
      if (store.users.user1) store.users.user1.confirmed = false
      if (store.users.user2) store.users.user2.confirmed = false
      return
    }
    const floatValue = parseFloat(value)

    if (value.endsWith('.')) {
      user.tonAmount = value
      if (store.users.user1) store.users.user1.confirmed = false
      if (store.users.user2) store.users.user2.confirmed = false
      return
    }

    if (isNaN(floatValue)) {
      return
    }
    user.tonAmount = parseFloat(value).toString()
    if (store.users.user1) store.users.user1.confirmed = false
    if (store.users.user2) store.users.user2.confirmed = false
    // }
  }

  const nfts = user.selectedNfts.map((n) => nftState.nfts[n].get()).filter((n) => !!n) as NftItem[]
  return (
    <div
      className={cn(
        'flex flex-col bg-slate-800/90 border border-slate-50/5 rounded h-min md:h-full gap-2',
        !canChangeState && 'bg-slate-950'
      )}
    >
      {/* <div>User: {user?.address.slice(0, 16)}</div> */}
      {/* <div>User Nfts:</div> */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 auto-rows-min overflow-y-scroll h-full p-2 min-h-[144px]">
        {nfts.map((nft) => (
          <NFT
            className="h-32"
            onClick={() => removeNftToTrade(nft.address)}
            nft={nft}
            key={nft.address}
          />
        ))}
      </div>

      {(isYou || !store.users.user2?.connected) && (
        <div className="gap-2 flex-row bg-slate-700 rounded-b border-t border-slate-50/5 flex py-2 px-2">
          <div className={cn('w-full flex items-center justify-start select-none overflow-hidden')}>
            <label
              htmlFor={`user${user.address}ton`}
              className={cn('whitespace-nowrap', canChangeState && 'cursor-pointer')}
            >
              TON Amount:
            </label>

            <div className="w-full flex gap-2">
              <input
                id={`user${user.address}ton`}
                className={cn(
                  'rounded px-2 py-1 outline-none bg-slate-900 ml-2 w-full'
                  // isYou && 'disabled:bg-slate-950'
                  // !isYou && 'bg-slate-900 px-0'
                )}
                type="text"
                value={user.tonAmount}
                onChange={(e) => {
                  changeTonAmount(e.target.value)
                }}
                disabled={!canChangeState}
              />

              {isYou && (
                <div
                  className={cn(
                    'px-2 rounded shadow bg-slate-900 flex items-center select-none',
                    user.confirmed && 'bg-green-500'
                  )}
                >
                  <label
                    htmlFor={`user${user.address}confirm`}
                    className={cn('py-1 w-full flex items-center', isYou && 'cursor-pointer')}
                  >
                    {isYou ? 'Confirm' : 'Confirmed'}
                  </label>
                  <input
                    id={`user${user.address}confirm`}
                    className="hidden"
                    type="checkbox"
                    checked={user.confirmed || false}
                    onChange={(e) => {
                      confirmTrade(e.target.checked)
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isYou && store.users.user2?.connected && (
        <div
          className={cn(
            'bg-slate-700 rounded-b border-t border-slate-50/5 flex py-3 px-2',
            user.confirmed && 'bg-green-500'
          )}
        >
          <div>
            {user.selectedNfts.length} NFTs + {user.tonAmount} TON
          </div>
        </div>
      )}
    </div>
  )
}
