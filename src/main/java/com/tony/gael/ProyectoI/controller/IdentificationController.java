package com.tony.gael.ProyectoI.controller;
import com.tony.gael.ProyectoI.model.Identification;
import com.tony.gael.ProyectoI.service.IdentificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/identifications")
public class IdentificationController {

    @Autowired
    private IdentificationService identificationService;

    @GetMapping
    public List<Identification> getAllIdentifications() {
        return identificationService.getAllIdentifications();
    }

    @GetMapping("/{id}")
    public Identification getIdentificationById(@PathVariable Long id) {
        return identificationService.getIdentificationById(id);
    }

    @PostMapping
    public Identification createIdentification(@RequestBody Identification identification) {
        return identificationService.saveIdentification(identification);
    }

    @PutMapping("/{id}")
    public Identification updateIdentification(@PathVariable Long id, @RequestBody Identification identification) {
        return identificationService.updateIdentification(id, identification);
    }

    @DeleteMapping("/{id}")
    public void deleteIdentification(@PathVariable Long id) {
        identificationService.deleteIdentification(id);
    }
}
