import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import { useRouter } from 'next/router';

const StyledLink = styled(Link)({
  textDecoration: 'none',
});

const BackButtonLabel = styled('span')(({ theme }) => ({
  color: theme.palette.common.white,
}));

const Title = styled(Typography)(({ theme }) => ({
  gridArea: 'title',
  color: theme.palette.common.white,
  flexGrow: 1,
  marginLeft: theme.spacing(2),
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  gridArea: 'subtitle',
  color: theme.palette.text.secondary,
  marginLeft: theme.spacing(1),
}));

type Props = {
  title: string;
  subtitle?: string;
};

export const Header = (props: Props) => {
  const { title, subtitle } = props;
  const { pathname } = useRouter();

  return (
    <AppBar position="static">
      <Toolbar>
        <StyledLink href="/" passHref>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back to home"
            disabled={pathname === '/'}
            size="large"
          >
            <BackButtonLabel>M</BackButtonLabel>
          </IconButton>
        </StyledLink>
        <Title variant="h6">
          {title}
        </Title>
        {subtitle && <Subtitle variant="body2">{subtitle}</Subtitle>}
      </Toolbar>
    </AppBar>
  );
};
