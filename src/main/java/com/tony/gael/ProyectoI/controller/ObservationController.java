package com.tony.gael.ProyectoI.controller;

import com.tony.gael.ProyectoI.model.Observation;
import com.tony.gael.ProyectoI.service.ObservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/observations")
public class ObservationController {

    @Autowired
    private ObservationService observationService;

    @GetMapping
    public List<Observation> getAllObservations() {
        return observationService.getAllObservations();
    }

    @GetMapping("/{id}")
    public Observation getObservationById(@PathVariable Long id) {
        return observationService.getObservationById(id);
    }

    @PostMapping
    public Observation createObservation(@RequestBody Observation observation) {
        return observationService.saveObservation(observation);
    }

    @PutMapping("/{id}")
    public Observation updateObservation(@PathVariable Long id, @RequestBody Observation observation) {
        return observationService.updateObservation(id, observation);
    }

    @DeleteMapping("/{id}")
    public void deleteObservation(@PathVariable Long id) {
        observationService.deleteObservation(id);
    }
}
