import { cn } from '@/utils/cn'
import clsx from 'clsx'
import { ReactNode } from 'react'
import { Address } from 'ton-core'

export function AddressRow({
  address,
  text,
  rawAddress,

  addressClassName,
  containerClassName,
}: {
  address?: string | Address
  text?: string | ReactNode | undefined
  rawAddress?: string

  addressClassName?: string
  containerClassName?: string
}) {
  let addressString: string
  if (rawAddress) {
    addressString = Address.parse(rawAddress).toString({ urlSafe: true, bounceable: true })
  } else if (address) {
    addressString =
      typeof address === 'string' ? address : address.toString({ urlSafe: true, bounceable: true })
  } else {
    addressString = ''
  }

  return (
    <div className={cn('flex justify-start items-center cursor-pointer', containerClassName)}>
      {text && (typeof text === 'string' ? <div>{text}</div> : text)}
      {/* <div className="">{text}</div> */}
      <div
        className={clsx(
          'text-xs overflow-hidden text-ellipsis whitespace-nowrap',
          addressClassName
        )}
      >
        {addressString.substring(0, addressString.length - 4)}
      </div>
      <div className={clsx('text-xs mr-4 w-10', addressClassName)}>
        {addressString.substring(addressString.length - 4)}
      </div>
    </div>
  )
}
