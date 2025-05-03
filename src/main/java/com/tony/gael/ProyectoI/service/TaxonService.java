package com.tony.gael.ProyectoI.service;

import org.springframework.beans.factory.annotation.Autowired;
import com.tony.gael.ProyectoI.model.Taxon;
import com.tony.gael.ProyectoI.repo.TaxonRepo;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TaxonService {
    private final TaxonRepo taxonRepo;

    @Autowired
    public TaxonService(TaxonRepo taxonRepo) {
        this.taxonRepo = taxonRepo;
    }

    public Taxon saveTaxon(Taxon taxon) {
        return taxonRepo.save(taxon);
    }

    public List<Taxon> getAllTaxons() {
        return taxonRepo.findAll();
    }

    public Taxon getTaxonById(Long id) {
        Optional<Taxon> optionalTaxon = taxonRepo.findById(id);
        return optionalTaxon.orElseThrow(() -> new RuntimeException("Taxon not found"));
    }

    public Taxon updateTaxon(Long id, Taxon updatedTaxon) {
        Optional<Taxon> existingTaxon = taxonRepo.findById(id);
        if (existingTaxon.isPresent()) {
            updatedTaxon.setTaxon_id(id);
            return taxonRepo.save(updatedTaxon);
        } else {
            throw new RuntimeException("Taxon not found");
        }
    }

    public void deleteTaxon(Long id) {
        if (taxonRepo.existsById(id)) {
            taxonRepo.deleteById(id);
        } else {
            throw new RuntimeException("Taxon not found");
        }
    }
}