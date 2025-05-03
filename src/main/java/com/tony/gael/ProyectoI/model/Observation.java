package com.tony.gael.ProyectoI.model;

import jakarta.persistence.*; // for Spring Boot 3
import java.sql.Date;

@Entity
@Table(name = "observation", schema = "biodiversidad")
public class Observation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long observation_id;

    @Column(name = "user_id")
    private Integer user_id;
    @Column(name = "taxon_id")
    private Integer taxon_id;
    @Column(name = "image_id")
    private Integer image_id;
    @Column(name = "date_obs")
    private Date date_obs;
    @Column(name = "latitude_obs")
    private Float latitude_obs;
    @Column(name = "longitude_obs")
    private Float longitude_obs;
    @Column(name = "note")
    private String note;



    public long getObservation_id() { return observation_id; }
    public Integer getUser_id() { return user_id; }
    public Integer getTaxon_id() { return taxon_id; }
    public Integer getImage_id() { return image_id; }
    public Date getDate_obs() { return date_obs; }
    public Float getLatitude_obs() { return latitude_obs; }
    public Float getLongitude_obs() { return longitude_obs; }
    public String getNote() { return note; }

    public void setObservation_id(long observation_id) { this.observation_id = observation_id; }
    public void setUser_id(Integer user_id) { this.user_id = user_id; }
    public void setTaxon_id(Integer taxon_id) { this.taxon_id = taxon_id; }
    public void setImage_id(Integer image_id) { this.image_id = image_id; }
    public void setDate_obs(Date date) { this.date_obs = date; }
    public void setLatitude_obs(Float latitude) { this.latitude_obs = latitude; }
    public void setLongitude_obs(Float longitude) { this.longitude_obs = longitude; }
    public void setNote(String note) { this.note = note; }
}
