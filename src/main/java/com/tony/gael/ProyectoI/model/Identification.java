package com.tony.gael.ProyectoI.model;

import jakarta.persistence.*; // for Spring Boot 3
import java.sql.Date;

@Entity
@Table(name = "identification", schema = "biodiversidad")
public class Identification {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long identification_id;
    @Column(name = "observation_id")
    private Integer observation_id;
    @Column(name = "taxon_id")
    private Integer taxon_id;
    @Column(name = "user_id")
    private Integer user_id;
    @Column(name = "date_identifi")
    private Date date_identifi;

    public long getIdentification_id() { return identification_id; }
    public Integer getObservation_id() { return observation_id; }
    public Integer getTaxon_id() { return taxon_id; }
    public Integer getUser_id() { return user_id; }
    public Date getDate_identifi() { return date_identifi; }

    public void setIdentification_id(long identification_id) { this.identification_id = identification_id; }
    public void setObservation_id(Integer observation_id) { this.observation_id = observation_id; }
    public void setTaxon_id(Integer taxon_id) { this.taxon_id = taxon_id; }
    public void setUser_id(Integer user_id) { this.user_id = user_id; }
    public void setDate_identifi(Date date) { this.date_identifi = date; }
}
