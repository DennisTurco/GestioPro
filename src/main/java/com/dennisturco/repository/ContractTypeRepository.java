package com.dennisturco.repository;

import com.dennisturco.enums.ContractTypeEnum;
import com.dennisturco.model.ContractType;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractTypeRepository extends JpaRepository<ContractType, Long> {
    Optional<ContractType> findByName(ContractTypeEnum name);
}
