package com.tony.gael.ProyectoI.model;

import jakarta.persistence.*; // for Spring Boot 3

@Entity
@Table(name = "user", schema = "biodiversidad")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "user_id")
    private long user_id;
    @Column(name = "first_name")
    private String first_name;
    @Column(name = "last_name")
    private String last_name;
    @Column(name = "country_id")
    private Integer country_id;
    @Column(name = "address")
    private String address;
    @Column(name = "email")
    private String email;

    public long getUser_id() { return user_id; }
    public String getAddress() { return address; }
    public String getFirst_name() { return first_name; }
    public String getLast_name() { return last_name; }
    public Integer getCountry_id() { return country_id; }
    public String getEmail() { return email; }

    public void setUser_id(long user_id) { this.user_id = user_id; }
    public void setFirst_name(String first_name) { this.first_name = first_name; }
    public void setLast_name(String last_name) { this.last_name = last_name; }
    public void setCountry_id(Integer country) { this.country_id = country; }
    public void setEmail(String email) { this.email = email; }
    public void setAddress(String address) { this.address = address; }
}
