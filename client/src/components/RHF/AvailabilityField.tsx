import { Typography, Grid, Button, Box } from '@mui/material';
import { Availability, Appointment } from 'store/types';
import { useMemo } from 'react';
import { Controller, useFormContext, FieldError } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { availabilitiesSelectors } from 'store/selectors';
import { formatDate, formatTimeRange } from 'utils/format';
import { appointmentsActions } from '../../store/actions';

type Props = {
  name: string;
  practitionerId: number;
};

const groupAvailabilitiesByDate = (availabilities: Availability[]) =>
  availabilities.reduce((result, availability) => {
    const formatedDate = formatDate(availability.startDate);
    if (result[formatedDate]) {
      return {
        ...result,
        [formatedDate]: [...result[formatedDate], availability],
      };
    }
    return { ...result, [formatedDate]: [availability] };
  }, {} as Record<string, Availability[]>);

const AvailabilityField = (props: Props) => {
  const { name, practitionerId } = props;
  const { control, formState: { errors: formHookErrors }, getValues } = useFormContext();
  const dispatch = useDispatch();

  const allAvailabilities = useSelector(availabilitiesSelectors.selectAll);
  const loading = useSelector(availabilitiesSelectors.selectLoading);

  const availabilitiesById = useMemo(() => 
    allAvailabilities.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {} as Record<string, Availability>)
  , [allAvailabilities]);

  const availabilitiesGroupByDate = useMemo(
    () => groupAvailabilitiesByDate(allAvailabilities),
    [allAvailabilities],
  );

  if (!allAvailabilities.length) return null;

  const fieldError = formHookErrors?.[name] as FieldError | undefined;

  const handleAvailabilityClick = (availabilityId: string, currentSelectedId: string | number) => {
    const isSelected = currentSelectedId === availabilityId;
    const newSelectedId = isSelected ? '' : availabilityId;
    onChange(newSelectedId);

    if (newSelectedId && newSelectedId !== '') {
      const patientId = getValues('patientId');
      const selectedAvailability = availabilitiesById[availabilityId];

      if (!practitionerId) {
        console.error('Practitioner ID is missing.');
        return;
      }

      if (!patientId) {
        console.error('Patient ID is missing. Please select a patient.');
        return;
      }

      if (selectedAvailability) {
        const appointmentData: Omit<Appointment, 'id'> = {
          practitionerId: practitionerId,
          patientId: parseInt(String(patientId), 10),
          startDate: selectedAvailability.startDate,
          endDate: selectedAvailability.endDate,
        };
        dispatch(appointmentsActions.create({ item: appointmentData }));
      }
    }
  };

  let onChange: (value: any) => void;

  return (
    <Controller
      control={control}
      defaultValue=""
      name={name}
      rules={{ required: 'The availability field is required' }}
      render={({ field }) => {
        onChange = field.onChange;
        const { value: currentSelectedValue } = field;
        return (
          <Grid container spacing={3}>
            {Object.keys(availabilitiesGroupByDate).map((dayOfAvailabilities) => {
              const sortedAvailabilities = availabilitiesGroupByDate[dayOfAvailabilities];
              return (
                <Grid item key={dayOfAvailabilities} xs={12} sm={6} md={4} lg={3}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {dayOfAvailabilities}
                  </Typography>
                  <Grid container spacing={1}>
                    {sortedAvailabilities.map(({ id, startDate, endDate }) => {
                      return (
                        <Grid item xs={6} key={id}>
                          <Button
                            fullWidth
                            variant="outlined"
                            disabled={loading}
                            onClick={() => handleAvailabilityClick(id, currentSelectedValue)}
                            sx={{
                              py: 1,
                              borderColor: currentSelectedValue === id ? 'black' : 'grey.500',
                              backgroundColor: currentSelectedValue === id ? 'grey.100' : 'transparent',
                              color: currentSelectedValue === id ? 'black' : 'grey.700',
                              '&:hover': {
                                borderColor: currentSelectedValue === id ? 'black' : 'grey.700',
                                backgroundColor: currentSelectedValue === id ? 'grey.200' : 'action.hover',
                              },
                            }}
                          >
                            <Typography variant="body2" component="span">
                              {formatTimeRange({
                                from: startDate,
                                to: endDate,
                              })}
                            </Typography>
                          </Button>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Grid>
              );
            })}
            {fieldError?.message ? (
              <Grid item xs={12}>
                <Typography color="error" sx={{ mt: 1 }}>{fieldError.message}</Typography>
              </Grid>
            ) : null}
          </Grid>
        );
      }}
    />
  );
};

export default AvailabilityField;
