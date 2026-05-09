package com.dennisturco.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.dennisturco.model.Customer;
import com.dennisturco.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public void insertCustomer(@NonNull Customer c) {

        LocalDate now = LocalDate.now();

        c.setId(null);
        c.setInsertDate(now);
        c.setLastUpdateDate(now);

        customerRepository.save(c);
    }

    public void deleteCustomer(@NonNull Long id) {
        customerRepository.deleteById(id);
    }

    public void updateCustomerById(@NonNull Long id, Customer customer) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

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

        customerRepository.save(existing);
    }
}
