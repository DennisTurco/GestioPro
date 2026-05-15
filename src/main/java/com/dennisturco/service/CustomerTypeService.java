package com.dennisturco.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dennisturco.model.CustomerType;
import com.dennisturco.repository.CustomerTypeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerTypeService {
    private final CustomerTypeRepository repo;

    public List<CustomerType> getAllCustomerTypes() {
        return repo.findAll();
    }

    public CustomerType getCustomerType(long id) {
        Optional<CustomerType> type = repo.findById(id);
        return type.orElse(null);
    }
}
