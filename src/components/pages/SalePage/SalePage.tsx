// import { ApiSettings } from '@/components/ApiSettings'
import { NftFixPriceSaleV2CodeCell } from '@/contracts/nftSaleV2/NftFixpriceSaleV2.source'
import { NftFixPriceSaleV2Data } from '@/contracts/nftSaleV2/NftFixpriceSaleV2.data'
import { useTonClient } from '@/store/tonClient'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Address, Cell } from 'ton-core'
import {
  Blockchain,
  RemoteBlockchainStorage,
  wrapTonClient4ForRemote,
} from '@ton-community/sandbox'
import { flattenSnakeCell } from '@/contracts/nftContent'

interface SaleInfo extends NftFixPriceSaleV2Data {
  name: bigint
}

interface NftInfo {
  initialized: boolean
  index: bigint
  collectionAddress: Address | null
  ownerAddress: Address
  content: Cell
}

export function SalePage() {
  const { saleAddress } = useParams()
  const tonClient = useTonClient()

  const [blockchain, setBlockchain] = useState<Blockchain | undefined>(undefined)

  const [saleInfo, setSaleInfo] = useState<SaleInfo | undefined>(undefined)
  const [nftInfo, setNftInfo] = useState<NftInfo | undefined>(undefined)

  useEffect(() => {
    ;(async () => {
      const blockchain = await Blockchain.create({
        storage: new RemoteBlockchainStorage(
          wrapTonClient4ForRemote(tonClient.get()),
          (
            await tonClient.get().getLastBlock()
          ).last.seqno
        ),
      })
      setBlockchain(blockchain)
    })()
  }, [tonClient])

  useEffect(() => {
    ;(async function () {
      if (!blockchain) {
        return
      }

      const address = Address.parse(saleAddress || '')
      const addressInfo = await tonClient
        .get()
        .getAccountLite((await tonClient.get().getLastBlock()).last.seqno, address)

      console.log('addressInfo', addressInfo)

      if (
        addressInfo.account.state.type !== 'active' ||
        addressInfo.account.state.codeHash !== NftFixPriceSaleV2CodeCell.hash().toString('base64')
      ) {
        setSaleInfo(undefined)
        return
      }

      const res = await blockchain.runGetMethod(address, 'get_sale_data')
      console.log('sale state', res)

      const name = res.stackReader.readBigNumber() // (res.stack.pop() as TupleItemInt).value // string
      const isComplete = res.stackReader.readBoolean() // (res.stack.pop() as TupleItemInt).value === 1n // boolean
      const createdAt = res.stackReader.readNumber() // Number((res.stack.pop() as TupleItemInt).value)
      const marketplaceAddress = res.stackReader.readAddress() // (res.stack.pop() as TupleItemCell).cell.asSlice().loadAddress()
      const nftAddress = res.stackReader.readAddress() // (res.stack.pop() as TupleItemCell).cell.asSlice().loadAddress()
      const nftOwnerAddress = res.stackReader.readAddressOpt() // (res.stack.pop() as TupleItemCell).cell.asSlice().loadMaybeAddress()
      const fullPrice = res.stackReader.readBigNumber() // (res.stack.pop() as TupleItemInt).value
      const marketplaceFeeAddress = res.stackReader.readAddress() // (res.stack.pop() as TupleItemCell).cell.asSlice().loadAddress()
      const marketplaceFee = res.stackReader.readBigNumber() // (res.stack.pop() as TupleItemInt).value
      const royaltyAddress = res.stackReader.readAddress() // (res.stack.pop() as TupleItemCell).cell.asSlice().loadAddress()
      const royaltyAmount = res.stackReader.readBigNumber() // (res.stack.pop() as TupleItemInt).value

      const saleInfo = {
        name,
        isComplete,
        createdAt,
        marketplaceAddress,
        nftAddress,
        nftOwnerAddress,
        fullPrice,
        marketplaceFeeAddress,
        marketplaceFee,
        royaltyAddress,
        royaltyAmount,
      }
      console.log('saleInfo', saleInfo)
      setSaleInfo(saleInfo)
    })()
  }, [saleAddress, tonClient, blockchain])

  useEffect(() => {
    ;(async function () {
      if (!blockchain) {
        return
      }

      if (!saleInfo?.nftAddress) {
        return
      }
      const addressInfo = await tonClient
        .get()
        .getAccountLite((await tonClient.get().getLastBlock()).last.seqno, saleInfo.nftAddress)

      console.log('addressInfo', addressInfo)

      // if (addressInfo.code?.equals(NftFixPriceSaleV2CodeCell.hash())) {
      //   setSaleInfo(undefined)
      //   return
      // }

      const res = await blockchain.runGetMethod(saleInfo.nftAddress, 'get_nft_data')

      // const res = await tonClient.get().runMethod(saleInfo.nftAddress, 'get_nft_data')
      // console.log('nft state', res)

      const initialized = res.stackReader.readNumber() === -1 // (res.stack.pop() as TupleItemInt).value
      const index = res.stackReader.readBigNumber() // (res.stack.pop() as TupleItemInt).value // string
      const collectionAddress = res.stackReader.readAddressOpt() //  (res.stack.pop() as TupleItemCell).cell.asSlice().loadMaybeAddress() // boolean
      const ownerAddress = res.stackReader.readAddress() // (res.stack.pop() as TupleItemCell).cell.asSlice().loadAddress()
      const content = res.stackReader.readCell() // (res.stack.pop() as TupleItemCell).cell

      const nftData = { initialized, index, collectionAddress, ownerAddress, content }
      setNftInfo(nftData)
      console.log('nft data', nftData)
    })()
  }, [saleInfo, tonClient, blockchain])

  useEffect(() => {
    ;(async function () {
      if (!blockchain) {
        return
      }

      if (!nftInfo?.initialized) {
        return
      }

      if (nftInfo.collectionAddress) {
        const nftContentRes = await blockchain.runGetMethod(
          nftInfo.collectionAddress,
          'get_nft_content',
          [
            { type: 'int', value: nftInfo.index },
            { type: 'cell', cell: nftInfo.content },
          ]
        )
        const content = nftContentRes.stackReader.readCell().asSlice()
        console.log('nft content res', nftContentRes, content)

        const dataType = content.loadInt(8)
        console.log('data type', dataType)
        if (dataType === 0x1) {
          const data = flattenSnakeCell(content.asCell())
          console.log('snake data', data.toString('utf-8'))
        }
      }
      // const addressInfo = await tonClient
      //   .get()
      //   .getAccountLite((await tonClient.get().getLastBlock()).last.seqno, saleInfo.nftAddress)

      // console.log('addressInfo', addressInfo)

      // // if (addressInfo.code?.equals(NftFixPriceSaleV2CodeCell.hash())) {
      // //   setSaleInfo(undefined)
      // //   return
      // // }

      // const res = await blockchain.runGetMethod(saleInfo.nftAddress, 'get_nft_data')

      // // const res = await tonClient.get().runMethod(saleInfo.nftAddress, 'get_nft_data')
      // // console.log('nft state', res)

      // const initialized = res.stackReader.readNumber() // (res.stack.pop() as TupleItemInt).value
      // const index = res.stackReader.readBigNumber() // (res.stack.pop() as TupleItemInt).value // string
      // const collectionAddress = res.stackReader.readAddressOpt() //  (res.stack.pop() as TupleItemCell).cell.asSlice().loadMaybeAddress() // boolean
      // const ownerAddress = res.stackReader.readAddress() // (res.stack.pop() as TupleItemCell).cell.asSlice().loadAddress()
      // const content = res.stackReader.readCell() // (res.stack.pop() as TupleItemCell).cell

      // const nftData = { initialized, index, collectionAddress, ownerAddress, content }
      // setNftInfo(nftData)
    })()
  }, [nftInfo, tonClient, blockchain])

  return (
    <div className="mt-8 flex flex-col">
      <h1>NFT Sale Info</h1>

      {/* <ApiSettings /> */}
      <div>Sale address: {saleAddress}</div>

      {saleInfo && (
        <div>
          Sale Info
          <div>Price: {saleInfo.fullPrice.toString()}</div>
          <div>Nft: {saleInfo.nftAddress.toString({ urlSafe: true, bounceable: true })}</div>
        </div>
      )}

      {nftInfo && (
        <div>
          NftInfo:
          <div>Index: {nftInfo.index.toString()}</div>
        </div>
      )}
    </div>
  )
}
