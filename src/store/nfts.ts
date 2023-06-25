import { TonAccountApi } from '@/utils/tonapi'
import { hookstate, useHookstate } from '@hookstate/core'
import { NftItem } from 'tonapi-sdk-js'

type NFTState = {
  nfts: { [key: string]: NftItem }
  userNfts: string[][]
}
const nftState = hookstate<NFTState>({
  nfts: {},
  userNfts: [[], []],
})

export function useNftState() {
  return useHookstate(nftState)
}

export async function updateUserNfts(address: string, index: 0 | 1) {
  const { nftItems } = await TonAccountApi.getNftItemsByOwner({
    accountId: address,
    limit: 1000,
  })

  for (const nftItem of nftItems) {
    nftState.nfts[nftItem.address].set(nftItem)
  }
  nftState.userNfts[index].set(nftItems.map((n) => n.address))
}
