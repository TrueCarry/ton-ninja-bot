import { createBrowserRouter } from 'react-router-dom'

import { IndexPage } from '@/components/pages/IndexPage/IndexPage'
import { SalePage } from '@/components/pages/SalePage/SalePage'
import { Layout } from '@/Layout'
import { SwapPage } from './components/pages/SwapPage/SwapPage'
import { CreateSalePage } from './components/pages/CreateSalePage/CreateSalePage'
import { CreateSwapPage } from './components/pages/CreateSwapPage/CreateSwapPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <IndexPage />,
      },
      {
        path: '/sale/create',
        element: <CreateSalePage />,
      },
      {
        path: '/swap/create',
        element: <CreateSwapPage />,
      },
      {
        path: '/sale/:saleAddress',
        element: <SalePage />,
      },
      {
        path: '/swap/:swapId',
        element: <SwapPage />,
      },
    ],
  },
])
