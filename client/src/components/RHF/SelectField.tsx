import { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  FormHelperText,
  SelectProps as MuiSelectProps,
} from '@mui/material';
import ResetFieldButton from './ResetFieldButton';

type SelectFieldOption = {
  key: number | string;
  label: string;
  value: number;
};

type SelectFieldProps = {
  name: string;
  options: SelectFieldOption[];
  onChange?: (value: number | undefined) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number;
} & Omit<MuiSelectProps, 'value' | 'onChange' | 'defaultValue' | 'variant'>;

export const getOptionsDefault = <
  T extends { id: number; firstName: string; lastName: string }
>(
  list: T[],
): SelectFieldOption[] =>
  list.map((item) => ({
    label: `${item.firstName} ${item.lastName}`,
    key: item.id,
    value: item.id,
  }));

const SelectField = (props: SelectFieldProps) => {
  const {
    name,
    options,
    placeholder,
    onChange: propsOnChange,
    label,
    required,
    defaultValue,
    ...restSelectProps
  } = props;

  const { control } = useFormContext();

  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', width: '100%', mb: 2 }}>
      {label && (
        <Typography 
          variant="body1" 
          sx={{ mr: 1, whiteSpace: 'nowrap' }} 
          component="label" 
          htmlFor={`${name}-select-label`}
        >
          {label}{required ? '*' : ''}
        </Typography>
      )}
      <Controller
        name={name}
        control={control}
        defaultValue={String(defaultValue || '')}
        render={({ field: { onChange, onBlur, value: fieldValue, name: fieldName, ref }, fieldState: { error } }) => {
          useEffect(() => {
            if (propsOnChange) {
              if (typeof fieldValue === 'string' && fieldValue !== '') {
                const numValue = parseFloat(fieldValue);
                if (!isNaN(numValue)) {
                  propsOnChange(numValue);
                }
              } else if (typeof fieldValue === 'number') {
                propsOnChange(fieldValue);
              } else if (fieldValue === '' || fieldValue === null || fieldValue === undefined) {
                propsOnChange(undefined);
              }
            }
          }, [fieldValue, propsOnChange]);

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, position: 'relative' }}>
              <FormControl variant="standard" fullWidth error={!!error}>
                <InputLabel id={`${name}-select-label`}>{placeholder}</InputLabel>
                <Select
                  labelId={`${name}-select-label`}
                  id={`${name}-select`}
                  value={fieldValue === null ? '' : fieldValue}
                  onChange={onChange}
                  onBlur={onBlur}
                  name={fieldName}
                  ref={ref}
                  label={placeholder}
                  displayEmpty
                  {...restSelectProps}
                >
                  {options.map((option) => (
                    <MenuItem key={option.key} value={String(option.value)}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {error && <FormHelperText sx={{ ml: 0 }}>{error.message}</FormHelperText>}
              </FormControl>
              {fieldValue !== undefined && fieldValue !== "" && fieldValue !== null && <ResetFieldButton name={name} />}
            </Box>
          );
        }}
      />
    </Box>
  );
};

export default SelectField;
