package com.tony.gael.ProyectoI.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.tony.gael.ProyectoI.model.Observation;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource
public interface ObservationRepo extends JpaRepository<Observation, Long> {
}
