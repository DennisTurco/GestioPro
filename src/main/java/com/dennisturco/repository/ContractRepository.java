package com.dennisturco.repository;

import com.dennisturco.model.Contract;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractRepository extends JpaRepository<Contract, Long> { }
