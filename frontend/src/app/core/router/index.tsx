import { envGlobalVar } from '~/core/apolloClient'

import { customerPortalRoutes } from './CustomerPortalRoutes'
import { customerObjectCreationRoutes, customerRoutes } from './CustomerRoutes'
import { CustomRouteObject } from './types'
import { lazyLoad } from './utils'

export * from './CustomerRoutes'

const { appEnv } = envGlobalVar()

// ----------- Layouts -----------
const SideNavLayout = lazyLoad(
  () => import(/* webpackChunkName: 'side-nav-layout' */ '~/layouts/SideNavLayout'),
)

// ----------- Pages -----------
const Error404 = lazyLoad(() => import(/* webpackChunkName: 'error-404' */ '~/pages/Error404'))

export const HOME_ROUTE = '/'
export const ERROR_404_ROUTE = '/404'

export const routes: CustomRouteObject[] = [
  {
    path: '*',
    element: <Error404 />,
  },
  {
    path: ERROR_404_ROUTE,
    element: <Error404 />,
  },
  {
    element: <SideNavLayout />,
    private: true,
    children: [
      ...customerRoutes,
      ...customerObjectCreationRoutes,
      ...customerPortalRoutes,
    ],
  },
]
