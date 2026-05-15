package com.dennisturco.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dennisturco.model.Quotation;

public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    Optional<Quotation> findByNumber(String number);
    boolean existsByNumber(String number);
}
