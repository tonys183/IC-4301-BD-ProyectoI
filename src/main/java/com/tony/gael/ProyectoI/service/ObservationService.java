package com.tony.gael.ProyectoI.service;

import com.tony.gael.ProyectoI.model.Observation;
import com.tony.gael.ProyectoI.repo.ObservationRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ObservationService {
    private final ObservationRepo observationRepo;
    @Autowired
    public ObservationService(ObservationRepo observationRepo) {
        this.observationRepo = observationRepo;
    }

    public Observation saveObservation(Observation observation) {
        return observationRepo.save(observation);
    }

    public List<Observation> getAllObservations() {
        return observationRepo.findAll();
    }

    public Observation getObservationById(Long id) {
        return observationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Observation not found"));
    }

    public Observation updateObservation(Long id, Observation observation) {
        Optional<Observation> existingTaxon = observationRepo.findById(id);
        if (existingTaxon.isPresent()) {
            observation.setObservation_id(id);
            return observationRepo.save(observation);
        } else {
            throw new RuntimeException("Observation not found");
        }
    }

    public void deleteObservation(Long id) {
        if (observationRepo.existsById(id)) {
            observationRepo.deleteById(id);
        } else {
            throw new RuntimeException("Observation not found");
        }
    }
}
