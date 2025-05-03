package com.tony.gael.ProyectoI.controller;

import com.tony.gael.ProyectoI.model.Taxon;
import com.tony.gael.ProyectoI.service.TaxonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/taxons")
@CrossOrigin(origins = "*")
public class TaxonController {

    @Autowired
    private TaxonService taxonService;

    @GetMapping
    public List<Taxon> getAllTaxons() {
        return taxonService.getAllTaxons();
    }

    @GetMapping("/{id}")
    public Taxon getTaxonById(@PathVariable Long id) {
        return taxonService.getTaxonById(id);
    }

    @PostMapping
    public Taxon createTaxon(@RequestBody Taxon taxon) {
        return taxonService.saveTaxon(taxon);
    }

    @PutMapping("/{id}")
    public Taxon updateTaxon(@PathVariable Long id, @RequestBody Taxon taxon) {
        return taxonService.updateTaxon(id, taxon);
    }

    @DeleteMapping("/{id}")
    public void deleteTaxon(@PathVariable Long id) {
        taxonService.deleteTaxon(id);
    }
}