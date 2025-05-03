package com.tony.gael.ProyectoI.model;

import jakarta.persistence.*; // for Spring Boot 3

@Entity
@Table(name = "taxon", schema = "biodiversidad")
public class Taxon {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long taxon_id;
    @Column(name = "parent_id")
    private Integer parent_id;
    @Column(name = "rank")
    private String rank;
    @Column(name = "taxon_name")
    private String taxon_name;
    @Column(name = "common_name")
    private String common_name;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", insertable = false, updatable = false)
    private Taxon parent;

    public long getTaxon_id() { return taxon_id; }
    public Integer getParent_id() { return parent_id; }
    public String getRank() { return rank; }
    public String getTaxon_name() { return taxon_name; }
    public String getCommon_name() { return common_name; }
    public Taxon getParent() { return parent; }

    public void setTaxon_id(long taxon_id) { this.taxon_id = taxon_id; }
    public void setParent_id(Integer parent_id) { this.parent_id = parent_id; }
    public void setRank(String rank) { this.rank = rank; }
    public void setTaxon_name(String taxon_name) { this.taxon_name = taxon_name; }
    public void setCommon_name(String common_name) { this.common_name = common_name; }
}
