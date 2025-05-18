import { createTheme, ThemeProvider as MuiThemeProvider, styled } from '@mui/material/styles';
import { Header } from './Header';

const localTheme = createTheme({
  palette: {
    common: {
      white: '#ffffff',
    },
    text: {
      secondary: 'lightgray',
    }
  },
  // Vous pouvez ajouter d'autres configurations de thème ici si nécessaire
});

// Définition des composants stylisés pour le Layout
const StyledLayoutContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh', // Pour que le layout prenne toute la hauteur de la vue
}));

const StyledPageContent = styled('main')(({ theme }) => ({ // Utilisation de 'main' pour le contenu principal
  flexGrow: 1, // Le contenu prend l'espace restant
  padding: theme.spacing(3), // Ajoute un peu de marge intérieure autour du contenu
  // Ajoutez d'autres styles nécessaires pour la zone de contenu ici
}));

type Props = {
  children: React.ReactNode;
  title?: string; // title est optionnel ici
  subtitle?: string;
};

export const Layout = (props: Props) => {
  const { children, title, subtitle } = props;

  return (
    <MuiThemeProvider theme={localTheme}>
      <StyledLayoutContainer>
         <Header title={title || 'Default Title'} subtitle={subtitle} />
        <StyledPageContent>{children}</StyledPageContent>
      </StyledLayoutContainer>
    </MuiThemeProvider>
  );
};
