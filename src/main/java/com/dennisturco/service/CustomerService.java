package com.dennisturco.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.dennisturco.dto.CustomerRequestDTO;
import com.dennisturco.dto.CustomerResponseDTO;
import com.dennisturco.exception.BusinessException;
import com.dennisturco.mapper.CustomerMapper;
import com.dennisturco.model.Customer;
import com.dennisturco.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final CustomerMapper mapper;

    public List<CustomerResponseDTO> getAllCustomers() {
        return customerRepository.findAll()
            .stream()
            .map(mapper::toResponseDto)
            .toList();
    }

    public void insertCustomer(@NonNull CustomerRequestDTO dto) {
        
        Customer customer = mapper.toEntity(dto);

        if (customer == null)
            throw new BusinessException("Errore creazione cliente");
        
        if (customerRepository.existsByEmail(customer.getEmail()))
            throw new BusinessException("Email già presente");

        customerRepository.save(customer);
    }

    public void deleteCustomer(@NonNull Long id) {
        customerRepository.deleteById(id);
    }

    public CustomerResponseDTO updateCustomerById(@NonNull Long id, CustomerRequestDTO dto) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Customer not found"));

        Customer customer = mapper.toEntity(dto);
        existing.setName(customer.getName());
        existing.setSurname(customer.getSurname());
        existing.setEmail(customer.getEmail());
        existing.setPhone(customer.getPhone());
        existing.setCompanyName(customer.getCompanyName());
        existing.setVatNumber(customer.getVatNumber());
        existing.setTaxCode(customer.getTaxCode());
        existing.setCountry(customer.getCountry());
        existing.setRegion(customer.getRegion());
        existing.setProvince(customer.getProvince());
        existing.setCity(customer.getCity());
        existing.setAddress(customer.getAddress());
        existing.setLat(customer.getLat());
        existing.setLon(customer.getLon());
        existing.setLandline(customer.getLandline());
        existing.setNotes(customer.getNotes());
        existing.setCustomerType(customer.getCustomerType());
        existing.setLastUpdateDate(LocalDate.now());

        customer = customerRepository.save(existing);
        return mapper.toResponseDto(customer);
    }
}
