import React from 'react'
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react'
import * as ReactDOM from 'react-dom/client'
import App from './App'
import "./index.css"
import { mode } from '@chakra-ui/theme-tools'
import { BrowserRouter } from 'react-router-dom'

// Add this import at the top of main.jsx
import { Provider } from 'react-redux';
import store from './store/store'; 

const styles = {
  global: (props) => ({
    body: {
      color: mode("gray.800", "whiteAlpha.900")(props),
      bg: mode("whiteAlpha.300", "#101010")(props),
    },
  }),
};

const config = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};

const colors = {
  gray: {
    light: "#616161",
    dark: "#1e1e1e",
  },
};
const theme = extendTheme({
  colors,
  styles,
  config,
})
const rootElement = document.getElementById('root')
ReactDOM.createRoot(rootElement).render(
  // react.strictMode renders the app twice in development mode
  <React.StrictMode>
    <Provider store={store}>

      <BrowserRouter> {/* cho phep dung url*/}
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <App />
        </ChakraProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)