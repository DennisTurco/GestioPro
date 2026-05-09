package com.dennisturco.repository;

import com.dennisturco.enums.QuotationStatusEnum;
import com.dennisturco.model.QuotationStatus;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface QuotationStatusRepository extends JpaRepository<QuotationStatus, Long> {
    Optional<QuotationStatus> findByName(QuotationStatusEnum name);
}
