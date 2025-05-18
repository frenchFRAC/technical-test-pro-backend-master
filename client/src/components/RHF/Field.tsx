import { Typography } from '@mui/material';
import { memoize } from 'lodash';
import { ComponentPropsWithoutRef, ElementType, useMemo } from 'react';
import { FieldError, useFormContext, UseFormReturn } from 'react-hook-form';

export type FieldProps<C extends ElementType> = {
  autoComplete?: string;
  component?: C;
  error?: FieldError;
  label?: string;
  name: string;
  placeholder?: string;
  required?: string;
} & Omit<
  C extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[C] & { gridkey?: string }
    : ComponentPropsWithoutRef<C>,
  'required'
>;
const disableAutocompleteHack = memoize((placeholder: string) =>
  placeholder?.split('').join('\u200b'),
);
const Field = <C extends keyof JSX.IntrinsicElements | ElementType = 'input'>(
  props: FieldProps<C>,
) => {
  const {
    autoComplete = 'off',
    children,
    component: Component = 'input',
    label,
    name,
    placeholder,
    required = '',
    ...rest
  } = props;

  const formContext = useFormContext();

  if (!formContext) {
    console.warn(`RHF/Field: Form context not available for field "${name}". Ensure Field is rendered within a FormProvider.`);
    return (
      <Component
        name={name}
        autoComplete={autoComplete}
        placeholder={placeholder}
        {...rest}
      >
        {children}
      </Component>
    );
  }

  const { register, formState: { errors: formErrors } } = formContext;
  const error = formErrors?.[name];

  const placeholderValue = useMemo(() => {
    if (!placeholder) return;
    if (autoComplete === 'off') return disableAutocompleteHack(placeholder);
    return placeholder;
  }, [autoComplete, placeholder]);
  const field = useMemo(
    () => (
      <Component
        name={name}
        autoComplete={autoComplete}
        placeholder={placeholderValue}
        {...register(name, { required: required || undefined })}
        gridkey={label ? undefined : name}
        {...rest}
      >
        {children}
      </Component>
    ),
    [
      Component,
      name,
      autoComplete,
      placeholderValue,
      register,
      required,
      rest,
      children,
      label,
    ],
  );
  const fieldError = useMemo(
    () =>
      error && error.message ? <Typography color="error">{error.message as string}</Typography> : null,
    [error],
  );
  if (label) {
    return (
      <label>
        <span>{`${label}${required ? '*' : ''}`}</span>
        {field}
        {fieldError}
      </label>
    );
  }
  return (
    <>
      {fieldError}
      {field}
    </>
  );
};

export default Field;
