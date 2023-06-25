import { hookstate, useHookstate } from '@hookstate/core'
import { TonClient4 } from 'ton'

const TonConnection = hookstate<TonClient4>(
  new TonClient4({
    endpoint: import.meta.env.VITE_TONHUB_API || 'https://testnet-v4.tonhubapi.com',
  })
)

export function useTonClient() {
  return useHookstate(TonConnection)
}

export function setTonClient(newClient: TonClient4) {
  TonConnection.set(newClient)
}

export { TonConnection }
