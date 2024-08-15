// src/routes/index.js (o el nombre que tenga tu archivo de rutas)
import { createBrowserRouter } from 'react-router-dom';
import MainRoutes from './MainRoutes';
import AuthenticationRoutes from './AuthenticationRoutes';
import config from '../config';

const router = createBrowserRouter(
  [
    MainRoutes,
    AuthenticationRoutes,
  ],
  {
    basename: config.basename,
  }
);

export default router;
