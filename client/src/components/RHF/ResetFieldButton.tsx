import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

type Props = {
  name: string;
};

const ResetFieldButton = (props: Props) => {
  const { name } = props;

  const { setValue } = useFormContext();

  const onReset = useCallback(() => {
    setValue(name, '');
  }, [name, setValue]);

  return (
    <IconButton onClick={onReset} size="large">
      <Close />
    </IconButton>
  );
};

export default ResetFieldButton;
