import { RouteObject } from 'react-router-dom';
import Home from '../pages/Home';

const router: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
];
export default router;
