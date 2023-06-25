import { StateResponse, getSwapState } from '@/contracts/swap/Swap.data'
import { hookstate, useHookstate } from '@hookstate/core'
import { Address } from 'ton-core'
import { TonConnection } from './tonClient'
import { TonClient4 } from 'ton'
import { useEffect, useState } from 'react'

const swapState = hookstate<StateResponse | undefined>(undefined)

export function useSwapState() {
  return useHookstate(swapState)
}

export async function updateSwapState(address: Address, seqno: number) {
  const tonClient = TonConnection.get({ noproxy: true }) as unknown as TonClient4
  const newState = await getSwapState(address, seqno, tonClient)
  swapState.set(newState)
}

export function useLastSeqno() {
  const [seqno, setSeqno] = useState(0)
  const tonClient = TonConnection.get({ noproxy: true }) as unknown as TonClient4

  useEffect(() => {
    const intrv = setInterval(async () => {
      const last = (await tonClient.getLastBlock()).last.seqno
      setSeqno(last)
    }, 1000)

    return () => {
      clearInterval(intrv)
    }
  }, [tonClient])

  return seqno
}
