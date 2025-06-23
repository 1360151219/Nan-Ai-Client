import { RouteObject } from 'react-router-dom';
import Home from '../pages/Home';

import Demo from '@src/pages/Demo';

const router: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/demo',
    element: <Demo />,
  },
];
export default router;
