package com.dennisturco.model;

import java.time.LocalDate;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Data
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
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

    @NotBlank
    @Column(nullable = false, unique = true)
    private String number;

    @NotBlank
    @Column(nullable = false)
    private LocalDate creationDate;

    private LocalDate validityDate;
}
