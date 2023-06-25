import { Outlet } from 'react-router-dom'
import { TonConnectButton, TonConnectUIProvider } from '@tonconnect/ui-react'
import { ReactComponent as Logo } from '../public/logo.svg'

export function Layout() {
  return (
    <TonConnectUIProvider
      manifestUrl="https://ton.ninja/tc"
      walletsListConfiguration={{
        includeWallets: [
          {
            name: 'TonDevWallet',
            aboutUrl: 'https://github.com/tondevwallet/tondevwallet',
            bridgeUrl: 'https://bridge.tonapi.io/bridge',
            deepLink: 'tondevwallet://connect/',
            imageUrl:
              'https://raw.githubusercontent.com/TonDevWallet/TonDevWallet/main/src-tauri/icons/Square284x284Logo.png',
            universalLink: 'tondevwallet://connect/',
          },
        ],
      }}
    >
      <div className="grid grid-rows-[60px_1fr] h-screen md:overflow-hidden">
        <div className="bg-slate-790/75 border-b border-slate-50/5">
          <div className="container w-full mx-auto justify-between items-center flex h-[60px]">
            <a href="/" className="flex items-center">
              <Logo className="w-10 h-10 mr-2" />
              <h1 className="text-3xl text-white font-bold">Ton.Ninja</h1>
            </a>
            <div>
              <TonConnectButton />
            </div>
          </div>
        </div>

        <div className="container w-full mx-auto h-full md:overflow-hidden">
          <Outlet />
        </div>
      </div>
    </TonConnectUIProvider>
  )
}
