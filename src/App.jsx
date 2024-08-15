// src/App.jsx
import { useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { AuthProvider } from '/src/context/AuthContext';
import router from 'routes';
import themes from 'themes';
import NavigationScroll from 'layout/NavigationScroll';
import { RouterProvider } from 'react-router-dom';

const App = () => {
  const customization = useSelector((state) => state.customization);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <CssBaseline />
        <AuthProvider>
          <NavigationScroll>
            <RouterProvider router={router} />
          </NavigationScroll>
        </AuthProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
