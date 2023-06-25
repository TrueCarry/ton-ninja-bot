import { cn } from '@/utils/cn'
import { Address } from 'ton-core'
import { NftItem } from 'tonapi-sdk-js'
import { ReactComponent as GetgemsLogo } from '@/assets/getgems-logo.svg'
import { ReactComponent as IconVerified } from '@/assets/icon-verified.svg'
import { isTestnet } from '@/utils/constants'
import { ImmutableObject } from '@hookstate/core'
import { isNftVerified } from '@/utils/isNftVerified'

export function NFT({
  nft,
  className,
  topRightSlot,
  ...props
}: {
  nft: NftItem | ImmutableObject<NftItem>
  topRightSlot?: React.ReactElement | boolean
} & React.HTMLAttributes<HTMLDivElement>) {
  console.log('nft', nft)
  return (
    <div className={cn('bg-slate-900 rounded relative flex', className)} {...props}>
      <div className="absolute top-0 left-0 right-0 bottom-0 z-0">
        {nft?.previews && nft.previews[1].url ? (
          <object
            className="h-full w-full rounded object-cover"
            data={(nft?.previews && nft.previews[1].url) || ''}
            type="image/png"
          >
            <img src="https://placehold.co/256x256/png" />
          </object>
        ) : (
          <img
            className="h-full w-full rounded object-cover"
            src="https://placehold.co/256x256/png"
          />
        )}
      </div>

      {topRightSlot || (
        <div className="absolute top-2 right-2 z-0 rounded">
          <a
            href={`https://${isTestnet ? 'testnet.' : ''}getgems.io/nft/${Address.parse(
              nft.address
            ).toString({
              urlSafe: true,
              bounceable: true,
            })}`}
            target="_blank"
          >
            <GetgemsLogo className="text-white fill-current w-6 h-6" />
            {/* <img src={GetgemsLogo} alt="getgems" /> */}
          </a>
        </div>
      )}

      {isNftVerified(nft) && (
        <div className="absolute top-2 left-2 z-0 rounded-lg bg-slate-900">
          <IconVerified className="text-blue-400 w-5 h-5" />
        </div>
      )}

      <div className="mt-auto relative z-10 overflow-hidden w-full">
        <div className="relative w-full">
          <div className="relative z-10 w-full shadow-black p-2 overflow-hidden">
            <div className="h-4 text-sm text-shadow">{nft.metadata?.name}</div>
            {/* {nft.metadata?.description && <div className="h-6">{nft.metadata?.description}</div>} */}
          </div>
        </div>
      </div>
    </div>
  )
}
