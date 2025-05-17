import { Provider } from 'react-redux';
import { adaptV4Theme } from '@mui/material/styles';
import { createMuiTheme, ThemeProvider, Theme, StyledEngineProvider } from '@mui/material';
import { store } from 'store';
import { Layout } from 'components/Layout';
import 'styles/styles.scss';


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


const theme = createMuiTheme(adaptV4Theme({
  palette: {
    primary: { main: '#000' },
    secondary: { main: '#FFF' },
  },
}));

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Layout title={Component.pageTitle} subtitle={Component.pageSubtitle}>
            <Component {...pageProps} />
          </Layout>
        </ThemeProvider>
      </StyledEngineProvider>
    </Provider>
  );
}

export default MyApp;
