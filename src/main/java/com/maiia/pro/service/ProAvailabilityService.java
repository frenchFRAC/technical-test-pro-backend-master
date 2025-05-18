package com.maiia.pro.service;

import com.maiia.pro.entity.Availability;
import com.maiia.pro.entity.TimeSlot;
import com.maiia.pro.entity.Appointment;
import com.maiia.pro.repository.AppointmentRepository;
import com.maiia.pro.repository.AvailabilityRepository;
import com.maiia.pro.repository.TimeSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ProAvailabilityService {

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    public List<Availability> findByPractitionerId(Integer practitionerId) {
        return availabilityRepository.findByPractitionerId(practitionerId);
    }

    /**
     * Generates a list of availability slots for a given practitioner, considering existing appointments.
     *
     * The process is as follows:
     * 1. All existing availabilities for the specified practitioner are deleted.
     * 2. The practitioner's predefined work {@link TimeSlot}s are retrieved.
     * 3. Appointments for the practitioner are retrieved and sorted by start time.
     * 4. For each {@code TimeSlot}:
     *    a. The method identifies contiguous blocks of free time by navigating around existing appointments.
     *    b. Each block of free time is then divided into 15-minute {@link Availability} slots.
     *    c. If a remaining part of a free time block is shorter than 15 minutes, an availability slot
     *       for that shorter duration is generally created.
     *    d. **Exception**: A short availability slot (less than 15 minutes) that would end
     *       exactly when an existing appointment begins will *not* be created. This prevents
     *       very short, potentially unusable, slots immediately preceding a booked time.
     * 5. All newly generated valid availabilities are saved to the database.
     *
     * The method is transactional, ensuring atomicity for the delete and save operations.
     *
     * @param practitionerId The ID of the practitioner for whom to generate availabilities.
     * @return A {@link List} of {@link Availability} objects representing the newly generated and saved slots.
     *         Returns an empty list if no {@code TimeSlot}s are defined for the practitioner,
     *         or if no usable free time is found according to the described logic.
     */
    @Transactional
    public List<Availability> generateAvailabilities(Integer practitionerId) {
        availabilityRepository.deleteByPractitionerId(practitionerId);

        List<TimeSlot> timeSlots = timeSlotRepository.findByPractitionerId(practitionerId);
        List<Appointment> appointments = appointmentRepository.findByPractitionerId(practitionerId);
        appointments.sort(Comparator.comparing(Appointment::getStartDate));

        List<Availability> newAvailabilities = new ArrayList<>();
        final int AVAILABILITY_SLOT_MINUTES = 15;

        for (TimeSlot timeSlot : timeSlots) {
            LocalDateTime currentTime = timeSlot.getStartDate();

            while (currentTime.isBefore(timeSlot.getEndDate())) {
                LocalDateTime freeSegmentStart = currentTime;
                LocalDateTime freeSegmentEnd = timeSlot.getEndDate(); // Fin par défaut du segment libre

                // Vérifier si freeSegmentStart est couvert par un RDV existant
                Appointment coveringAppointment = null;
                for (Appointment appt : appointments) {
                    if ((appt.getStartDate().isBefore(freeSegmentStart) || appt.getStartDate().isEqual(freeSegmentStart)) &&
                        appt.getEndDate().isAfter(freeSegmentStart)) {
                        coveringAppointment = appt;
                        break;
                    }
                }

                if (coveringAppointment != null) {
                    // freeSegmentStart est dans un RDV. Avancer currentTime à la fin de ce RDV.
                    currentTime = coveringAppointment.getEndDate();
                } else {
                    // freeSegmentStart est libre. Déterminer la fin de ce segment libre.
                    // Il est limité par le début du prochain RDV ou la fin du TimeSlot.
                    for (Appointment appt : appointments) {
                        // Chercher le premier RDV qui commence à ou après freeSegmentStart
                        if (appt.getStartDate().isAfter(freeSegmentStart) || appt.getStartDate().isEqual(freeSegmentStart)) {
                            if (appt.getStartDate().isBefore(freeSegmentEnd)) {
                                freeSegmentEnd = appt.getStartDate();
                            }
                            // Puisque les RDV sont triés, le premier trouvé qui commence dans ou après freeSegmentStart
                            // et avant freeSegmentEnd (initialement timeSlot.getEndDate()) est celui qui limite.
                            break;
                        }
                    }

                    // Découper le bloc libre [freeSegmentStart, freeSegmentEnd) en créneaux
                    LocalDateTime slotGenPointer = freeSegmentStart;
                    while (slotGenPointer.isBefore(freeSegmentEnd)) {
                        LocalDateTime availabilityStartDate = slotGenPointer;
                        LocalDateTime proposedEndDate = slotGenPointer.plusMinutes(AVAILABILITY_SLOT_MINUTES);
                        LocalDateTime actualEndDate;

                        if (proposedEndDate.isAfter(freeSegmentEnd)) {
                            actualEndDate = freeSegmentEnd; // Le dernier slot peut être plus court
                        } else {
                            actualEndDate = proposedEndDate;
                        }

                        boolean createThisSlot = true;
                        // Condition pour ne pas créer un petit slot final (<15min) juste avant un RDV
                        if (actualEndDate.isEqual(freeSegmentEnd) && // Est-ce le dernier slot potentiel du segment ?
                            java.time.Duration.between(availabilityStartDate, actualEndDate).toMinutes() < AVAILABILITY_SLOT_MINUTES) { // Est-il plus court que 15 min ?

                            boolean endsAtAppointmentStart = false;
                            for (Appointment appt : appointments) { // appointments est la liste complète (déjà triée)
                                if (appt.getStartDate().isEqual(freeSegmentEnd)) {
                                    endsAtAppointmentStart = true;
                                    break;
                                }
                                if (appt.getStartDate().isAfter(freeSegmentEnd)) {
                                    // Optimisation: les RDV sont triés, inutile de chercher plus loin
                                    break;
                                }
                            }
                            if (endsAtAppointmentStart) {
                                createThisSlot = false; // Ne pas créer ce petit slot spécifique
                            }
                        }

                        if (availabilityStartDate.isBefore(actualEndDate) && createThisSlot) {
                            newAvailabilities.add(Availability.builder()
                                    .practitionerId(practitionerId)
                                    .startDate(availabilityStartDate)
                                    .endDate(actualEndDate)
                                    .build());
                        }
                        slotGenPointer = actualEndDate; // Toujours avancer pour éviter une boucle infinie
                    }
                    currentTime = freeSegmentEnd; // Avancer currentTime à la fin du bloc libre traité.
                }
            }
        }

        if (!newAvailabilities.isEmpty()) {
            List<Availability> savedAvailabilities = new ArrayList<>();
            // Utiliser une boucle pour saveAll car il peut y avoir des soucis avec forEach et le retour de saveAll
            for(Availability availability : availabilityRepository.saveAll(newAvailabilities)){
                savedAvailabilities.add(availability);
            }
            return savedAvailabilities;
        }
        return newAvailabilities;
    }
}
