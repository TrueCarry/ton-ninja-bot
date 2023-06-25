import { Configuration, NFTApi, AccountsApi, BlockchainApi } from 'tonapi-sdk-js'

const tonapiUrl = import.meta.env.VITE_TONAPI_URL || 'https://testnet.tonapi.io'
const configuration = new Configuration({
  basePath: tonapiUrl,
  headers: {
    Authorization: 'Bearer AE2GKTICEPF6IKAAAAALQHO6HGTZL4EXOUZWSRKVA444O7FCREPUVE2Q3L7RLNHYFTB6UZY',
  },
})

export const TonAccountApi = new AccountsApi(configuration)

export const TonBlockchainApi = new BlockchainApi(configuration)

export const TonNFTApi = new NFTApi(configuration)
