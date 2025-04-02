// src/index.jsx
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { ApolloProvider } from '@apollo/client';
import { I18nextProvider } from 'react-i18next';
import App from './App';
import i18n from './i18n';
import reducer from './store/reducer';
import client from './apolloClient';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import 'assets/scss/style.scss';
import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
const store = configureStore({ reducer });

// console.log("register service worker");

// if ('serviceWorker' in navigator){
//     navigator.serviceWorker.register('/sw.js')
//         .then(reg => {console.log('Service worker registerd', )})
//         .catch(error => {console.error(error)})
// } else {
//     console.log("service worker not supported");
// } 

root.render(
  <Provider store={store}>
    <ApolloProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </ApolloProvider>
  </Provider>
);

reportWebVitals();
