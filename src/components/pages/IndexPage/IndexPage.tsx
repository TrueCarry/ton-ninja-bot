import { Link } from 'react-router-dom'
import { ReactComponent as IconSwap } from '@/assets/icon-swap.svg'

export function IndexPage() {
  return (
    <div className="mt-8 flex flex-col justify-center items-center">
      {/* <Link to="/sale/create">
        <h1>Create NFT Sale contract</h1>
      </Link> */}
      <div className="w-64 h-64 bg-slate-800/90 border border-slate-50/5 rounded">
        <Link to="/swap/create" className="flex flex-col items-center justify-center h-full">
          <IconSwap className="w-32 h-32 text-slate-300 fill-current" />
          <h1 className="text-white text-xl">Create Swap</h1>
        </Link>
      </div>
    </div>
  )
}
