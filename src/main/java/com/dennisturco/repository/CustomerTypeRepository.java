package com.dennisturco.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dennisturco.enums.CustomerTypeEnum;
import com.dennisturco.model.CustomerType;

public interface CustomerTypeRepository extends JpaRepository<CustomerType, Long> {
    Optional<CustomerType> findByName(CustomerTypeEnum name);
}
