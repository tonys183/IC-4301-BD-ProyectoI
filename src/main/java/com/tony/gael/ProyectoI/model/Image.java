package com.tony.gael.ProyectoI.model;

import jakarta.persistence.*; // for Spring Boot 3
import java.util.Date;

@Entity
@Table(name = "image", schema = "biodiversidad")

public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long image_id;
    @Column(name = "date_img")
    private Date date_img;
    @Column(name = "user_id")
    private Integer user_id;
    @Column(name = "taxon_id")
    private Integer taxon_id;
    @Column(name = "license")
    private String license;
    @Column(name = "latitude_img")
    private Float latitude_img;
    @Column(name = "longitude_img")
    private Float longitude_img;
    @Column(name = "url", columnDefinition = "TEXT")
    private String url;
    @Column(name = "owner", columnDefinition = "TEXT")
    private String owner;

    public long getImage_id() {
        return image_id;
    }
    public Integer getUser_id() {return user_id;}
    public Integer getTaxon_id() {return taxon_id;}
    public Date getDate_img() {
        return date_img;
    }
    public String getOwner() {
        return owner;
    }
    public String getLicense() {
        return license;
    }
    public Float getLatitude_img() {
        return latitude_img;
    }
    public Float getLongitude_img() { return longitude_img; }
    public String getUrl() {return url;}

    public void setImage_id(long image_id) { this.image_id = image_id; }
    public void setUser_id(Integer user_id) { this.user_id = user_id; }
    public void setTaxon_id(Integer taxon_id) { this.taxon_id = taxon_id; }
    public void setDate_img(Date date_img) { this.date_img = date_img; }
    public void setLicense(String license) { this.license = license; }
    public void setLatitude_img(Float latitude) { this.latitude_img = latitude; }
    public void setLongitude_img(Float longitude) { this.longitude_img = longitude; }
    public void setUrl(String url) {this.url = url;}
    public void setOwner(String owner) { this.owner = owner; }
}
