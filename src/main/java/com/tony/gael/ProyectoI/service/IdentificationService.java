package com.tony.gael.ProyectoI.service;

import org.springframework.beans.factory.annotation.Autowired;
import com.tony.gael.ProyectoI.model.Identification;
import com.tony.gael.ProyectoI.repo.IdentificationRepo;
import org.springframework.stereotype.Service;
import java.util.List;



@Service
public class IdentificationService {
    private final IdentificationRepo identificationRepo;

    @Autowired
    public IdentificationService(IdentificationRepo identificationRepo) {
        this.identificationRepo = identificationRepo;
    }

    public Identification saveIdentification(Identification identification) {
        return identificationRepo.save(identification);
    }

    public List<Identification> getAllIdentifications() {
        return identificationRepo.findAll();
    }

    public Identification getIdentificationById(Long id) {
        return identificationRepo.findById(id).orElseThrow(() -> new RuntimeException("Identification not found"));
    }

    public Identification updateIdentification(Long id, Identification identification) {
        if (identificationRepo.existsById(id)) {
            identification.setIdentification_id(id);
            return identificationRepo.save(identification);
        } else {
            throw new RuntimeException("Identification not found");
        }
    }

    public void deleteIdentification(Long id) {
        if (identificationRepo.existsById(id)) {
            identificationRepo.deleteById(id);
        } else {
            throw new RuntimeException("Identification not found");
        }
    }
}
