import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import Field, { FieldProps } from './Field';
import ResetFieldButton from './ResetFieldButton';

type SelectFieldOption = {
  key: number | string;
  label: string;
  value: number;
};

type SelectFieldProps = {
  options: SelectFieldOption[];
  onChange?: (value: number) => void;
} & Omit<FieldProps<'select'>, 'onChange'>;

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
  const { name, options, placeholder, onChange, ...fieldProps } = props;

  const { control } = useFormContext();
  const watchedStringValue = useWatch({
    control,
    name,
    defaultValue: fieldProps.defaultValue || "",
  });

  useEffect(() => {
    if (onChange) {
      if (typeof watchedStringValue === 'string' && watchedStringValue !== '') {
        const numValue = parseFloat(watchedStringValue);
        if (!isNaN(numValue)) {
          onChange(numValue);
        }
      } else if (typeof watchedStringValue === 'number') {
        onChange(watchedStringValue);
      }
    }
  }, [watchedStringValue, onChange]);

  return (
    <div>
      <Field component="select" name={name} {...fieldProps}>
        <option value="" disabled={!placeholder}>
          {placeholder || ''}
        </option>
        {options.map((option) => (
          <option key={option.key} value={option.value}>
            {option.label}
          </option>
        ))}
      </Field>
      {watchedStringValue !== undefined && watchedStringValue !== "" && <ResetFieldButton name={name} />}
    </div>
  );
};

export default SelectField;
