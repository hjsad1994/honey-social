import React from 'react'
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react'
import * as ReactDOM from 'react-dom/client'
import App from './App'
import "./index.css"
import { mode } from '@chakra-ui/theme-tools'
import { BrowserRouter } from 'react-router-dom'
const styles = {
  global: (props) => ({
    body: mode('gray.800', 'whiteAlpha.900')(props),
    bg: mode('gray.800', '#101010')(props),
  })
}
const config = {
  initialColorMode: "Dark",
  useSystemColorMode: true

}

const colors = {
  gray: {
    light: "#616161",
    dark: "#1e1e1e"
  }
}
const theme = extendTheme({
  colors,
  styles,
  config,
})
const rootElement = document.getElementById('root')
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter> {/* cho phep dung url*/}
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <App />
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>,
)