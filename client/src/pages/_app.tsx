import { Provider } from 'react-redux';
import { ThemeProvider, Theme, StyledEngineProvider, createTheme } from '@mui/material/styles';
import { store } from 'store';
import { Layout } from 'components/Layout';
import 'styles/styles.scss';
import type { AppProps } from 'next/app';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: '#red',
    },
    background: {
      default: '#fff',
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const pageTitle = (Component as any).pageTitle || 'Maiia Pro';
  const pageSubtitle = (Component as any).pageSubtitle;

  return (
    <ThemeProvider theme={theme}>
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
          <CssBaseline />
          <Head>
            <title>{pageTitle}</title>
            <meta name="viewport" content="initial-scale=1, width=device-width" />
          </Head>
          <Layout title={pageTitle} subtitle={pageSubtitle}>
            <Component {...pageProps} />
          </Layout>
      </StyledEngineProvider>
    </Provider>
    </ThemeProvider>
  );
}

export default MyApp;
