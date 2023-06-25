export interface SelectedNft {
  address: string
}

export interface UserInfo {
  index: 0 | 1
  address: string
  selectedNfts: string[]
  tonBalance: string
  tonAmount: string
  confirmed: boolean
  connected: boolean
}

export interface ChatMessage {
  from: string
  text: string
  date: Date
}

export interface TradeMoney {
  amount: string
  started: boolean
  confirmed: boolean
}

export interface TradeNfts {
  nfts: string[]
  started: boolean
  confirmed: boolean
}

export interface UserStoreData {
  users: {
    user1?: UserInfo
    user2?: UserInfo
  }
  chat: {
    messages?: ChatMessage[]
  }
  trade: {
    deployStarted?: boolean
    deployed?: boolean
  }
}
