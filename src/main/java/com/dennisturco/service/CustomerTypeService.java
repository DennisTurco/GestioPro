package com.dennisturco.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.dennisturco.model.CustomerType;
import com.dennisturco.repository.CustomerTypeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerTypeService {
    private final CustomerTypeRepository customerTypeRepository;

    public List<CustomerType> getAllCustomerTypes() {
        return customerTypeRepository.findAll();
    }
}
