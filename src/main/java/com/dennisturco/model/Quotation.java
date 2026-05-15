package com.dennisturco.model;

import java.time.LocalDate;

import org.hibernate.annotations.Check;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Check(constraints = "vat_percentage >= 0 AND vat_percentage <= 100")
@Check(constraints = "discount_percentage >= 0 AND discount_percentage <= 100")
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "quotation_status_id", nullable = false)
    private QuotationStatus quotationStatus;

    @Column(nullable = false, unique = true)
    private String number;

    @Column(nullable = false)
    private Float amount;

    @Column(nullable = false)
    private Integer vatPercentage;

    @Column(nullable = false)
    private Integer discountPercentage;

    @Column(length = 2000)
    private String description;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false)
    private LocalDate creationDate;

    @Column(nullable = false)
    private LocalDate lastUpdateDate;

    private LocalDate issueDate;
    private LocalDate validityDate;
}
