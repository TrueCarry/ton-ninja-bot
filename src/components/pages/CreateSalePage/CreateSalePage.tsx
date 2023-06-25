import { ResultContainer } from '@/components/ResultContainer'
import { NftQueries } from '@/contracts/nftItem/NftItem.data'
import { buildNftFixPriceSaleV2StateInit } from '@/contracts/nftSaleV2/NftFixpriceSaleV2.data'
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react'
import { useMemo, useState } from 'react'
import { Address, beginCell, storeStateInit, toNano } from 'ton-core'

export function CreateSalePage() {
  const [nftAddress, setNftAddress] = useState('')
  const [amount, setAmount] = useState('')
  const wallet = useTonWallet()

  const saleCreatorAddress = 'EQDDX5eqHCNW1pSm2EGmX0BvJqYnKOmDTEGuxFbwW7VM3Pi8'
  const zeroAddress = new Address(0, Buffer.alloc(32))
  const saleInit = useMemo(() => {
    if (!nftAddress) {
      return
    }
    const init = buildNftFixPriceSaleV2StateInit({
      createdAt: Math.floor(Date.now() / 1000),
      fullPrice: toNano(1n),
      marketplaceAddress: zeroAddress,
      marketplaceFee: 0n,
      marketplaceFeeAddress: zeroAddress,
      nftAddress: Address.parse(nftAddress),
      royaltyAddress: zeroAddress,
      royaltyAmount: 0n,
      nftOwnerAddress: Address.parse(wallet?.account.address || ''),
    })
    return init
  }, [nftAddress])

  const transferBody = useMemo(() => {
    if (!saleInit) {
      return beginCell().endCell()
    }

    const tranferBody = NftQueries.transfer({
      newOwner: Address.parse(saleCreatorAddress),
      forwardAmount: toNano(1n),
      forwardPayload: beginCell()
        .storeUint(0x0fe0ede, 32)
        .storeRef(beginCell().store(storeStateInit(saleInit.stateInit)).endCell())
        .storeRef(beginCell().storeUint(1, 32).storeUint(0, 64).endCell())
        .endCell(),
    })
    return tranferBody
  }, [saleInit])

  return (
    <div className="mt-8 flex flex-col">
      <h1>Create NFT Sale contract</h1>
      <p>To create sale contract, input nft address and sale amount</p>

      <div className="flex justify-between items-center">
        <div>
          <TonConnectButton />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <label htmlFor="addressInput">Address</label>
          <input
            id="addressInput"
            type="text"
            onChange={(e) => setNftAddress(e.target.value)}
            value={nftAddress}
          />
        </div>

        <div className="flex gap-2">
          <label htmlFor="amountInput">Amount</label>
          <input
            id="amountInput"
            type="number"
            onChange={(e) => setAmount(e.target.value)}
            value={amount}
          />
        </div>
      </div>

      <ResultContainer address={nftAddress} amount={toNano(2n)} cell={transferBody} />
    </div>
  )
}
