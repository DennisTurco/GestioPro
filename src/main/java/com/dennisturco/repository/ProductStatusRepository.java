package com.dennisturco.repository;

import com.dennisturco.enums.ProductStatusEnum;
import com.dennisturco.model.ProductStatus;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductStatusRepository extends JpaRepository<ProductStatus, Long> {
    Optional<ProductStatus> findByName(ProductStatusEnum name);
}
