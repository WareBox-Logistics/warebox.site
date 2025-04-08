import React from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { AuthProvider } from '/src/context/AuthContext';
import router from 'routes';
import themes from 'themes';
import NavigationScroll from 'layout/NavigationScroll';
import { RouterProvider } from 'react-router-dom';
import ErrorBoundary from 'components/ErrorBoundary';

const App = () => {
  const customization = useSelector((state) => state.customization);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <CssBaseline />
        <AuthProvider>
          <NavigationScroll>
          {/* <ErrorBoundary> */}
              <RouterProvider 
                future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
                router={router} 
              />
            {/* </ErrorBoundary> */}
          </NavigationScroll>
        </AuthProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
