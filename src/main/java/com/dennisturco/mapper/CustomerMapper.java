package com.dennisturco.mapper;

import java.time.LocalDate;

import org.springframework.stereotype.Component;

import com.dennisturco.dto.CustomerRequestDTO;
import com.dennisturco.dto.CustomerResponseDTO;
import com.dennisturco.model.Customer;
import com.dennisturco.service.CustomerTypeService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CustomerMapper {

    private final CustomerTypeService customerTypeService;

    public CustomerResponseDTO toResponseDto(Customer c) {
        return CustomerResponseDTO.builder()
            .id(c.getId())
            .customerTypeId(c.getCustomerType().getId())
            .customerTypeName(c.getCustomerType().getName().name())
            .name(c.getName())
            .surname(c.getSurname())
            .email(c.getEmail())
            .phone(c.getPhone())
            .country(c.getCountry())
            .region(c.getRegion())
            .city(c.getCity())
            .province(c.getProvince())
            .address(c.getAddress())
            .vatNumber(c.getVatNumber())
            .companyName(c.getCompanyName())
            .taxCode(c.getTaxCode())
            .landline(c.getLandline())
            .lat(c.getLat())
            .lon(c.getLon())
            .notes(c.getNotes())
            .build();
    }

    public Customer toEntity(CustomerRequestDTO dto) {
        long customerTypeId = dto.getCustomerTypeId();
        LocalDate now = LocalDate.now();

        return Customer.builder()
            .id(null)
            .customerType(customerTypeService.getCustomerType(customerTypeId))
            .name(dto.getName())
            .surname(dto.getSurname())
            .email(dto.getEmail())
            .phone(dto.getPhone())
            .country(dto.getCountry())
            .region(dto.getRegion())
            .city(dto.getCity())
            .province(dto.getProvince())
            .address(dto.getAddress())
            .vatNumber(dto.getVatNumber())
            .companyName(dto.getCompanyName())
            .taxCode(dto.getTaxCode())
            .landline(dto.getLandline())
            .lat(dto.getLat())
            .lon(dto.getLon())
            .insertDate(now)
            .lastUpdateDate(now)
            .notes(dto.getNotes())
            .build();
    }
}
