import { UserStoreData } from '@/types/swap'
import { Address } from 'ton-core'

export function addressEquals(address1: string | Address, address2: string | Address): boolean {
  let a1: Address
  if (address1 instanceof Address) {
    a1 = address1
  } else {
    try {
      a1 = Address.parse(address1)
    } catch (e) {
      return false
    }
  }

  let a2: Address
  if (address2 instanceof Address) {
    a2 = address2
  } else {
    try {
      a2 = Address.parse(address2)
    } catch (e) {
      return false
    }
  }

  return a1.equals(a2)
}

export function CanChangeState(
  store: UserStoreData,
  currentAddress: string,
  targetAddress: string
): boolean {
  const targetUser =
    store.users.user1?.address === targetAddress
      ? store.users.user1
      : store.users.user2?.address === targetAddress
      ? store.users.user2
      : undefined

  if (currentAddress === targetAddress) {
    return !targetUser?.confirmed
  }

  if (!targetUser) {
    return true
  }

  return !targetUser.connected
}
