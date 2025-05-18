import { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from 'store';
import {
  appointmentsActions,
  availabilitiesActions,
  patientsActions,
  practitionersActions,
} from 'store/actions';
import {
  availabilitiesSelectors,
  patientsSelectors,
  practitionersSelectors,
} from 'store/selectors';
import AvailabilityField from './RHF/AvailabilityField';
import SelectField, { getOptionsDefault } from './RHF/SelectField';

type AppointmentFormValues = {
  practitionerId: number | null;
  patientId: number | null;
  availabilityId: number | null;
};

const AppointmentForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const methods = useForm<AppointmentFormValues>({
    defaultValues: {
      practitionerId: null,
      patientId: null,
      availabilityId: null,
    }
  });
  const { handleSubmit, setValue, reset, watch } = methods;

  const practitioners = useSelector(practitionersSelectors.selectAll);
  const patients = useSelector(patientsSelectors.selectAll);
  const allAvailabilities = useSelector(availabilitiesSelectors.selectEntities);
  const selectedPractitionerId = watch("practitionerId");

  useEffect(() => {
    dispatch(practitionersActions.getList());
    dispatch(patientsActions.getList());
  }, [dispatch]);

  const onPractitionerChange = useCallback(
    (practitionerId: number | null) => {
      setValue('availabilityId', null);
      if (practitionerId) {
        dispatch(
          availabilitiesActions.getList({
            params: {
              practitionerId,
            },
          }),
        );
      } else {
        dispatch(availabilitiesActions.reset());
      }
    },
    [setValue, dispatch],
  );

  const onSubmit = useCallback(
    (data: AppointmentFormValues) => {
      if (data.availabilityId === null) {
        console.error("Availability ID is null, cannot create appointment");
        return;
      }
      const selectedAvailability = allAvailabilities[data.availabilityId];
      
      if (!selectedAvailability) {
        console.error("Selected availability not found");
        return;
      }
      const { startDate, endDate } = selectedAvailability;
      const item = { practitionerId: data.practitionerId, patientId: data.patientId, startDate, endDate };
      dispatch(appointmentsActions.create({ item }));
      reset();
    },
    [allAvailabilities, dispatch, reset],
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <SelectField
          label="Practitioner"
          name="practitionerId"
          options={getOptionsDefault(practitioners)}
          placeholder="Select a practitioner"
          required="The practitioner field is required"
          onChange={onPractitionerChange}
          className="select"
        />
        <SelectField
          label="Patient"
          name="patientId"
          options={getOptionsDefault(patients)}
          placeholder="Select a patient"
          required="The patient field is required"
          className="select"
        />
        <AvailabilityField name="availabilityId" />
        <button className="cta" type="submit">
          Create appointment
        </button>
      </form>
    </FormProvider>
  );
};

export default AppointmentForm;
