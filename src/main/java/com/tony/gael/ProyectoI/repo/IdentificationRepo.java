package com.tony.gael.ProyectoI.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.tony.gael.ProyectoI.model.Identification;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource
public interface IdentificationRepo extends JpaRepository<Identification, Long>{

}
