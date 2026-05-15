package com.dennisturco.mapper;

import java.time.LocalDate;

import org.springframework.stereotype.Component;

import com.dennisturco.dto.QuotationRequestDTO;
import com.dennisturco.dto.QuotationResponseDTO;
import com.dennisturco.model.Customer;
import com.dennisturco.model.Quotation;
import com.dennisturco.model.QuotationStatus;
import com.dennisturco.service.CustomerService;
import com.dennisturco.service.QuotationStatusService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class QuotationMapper {
    private final CustomerService customerService;
    private final QuotationStatusService quotationStatusService;

    public Quotation toEntity(QuotationRequestDTO dto) {
        Customer customer = customerService.getCustomerById(dto.getCustomerId());
        QuotationStatus quotationStatus = quotationStatusService.getQuotationStatus(dto.getCustomerId());
        LocalDate now = LocalDate.now();

        return Quotation.builder()
            .id(null)
            .customer(customer)
            .quotationStatus(quotationStatus)
            .number(dto.getNumber())
            .amount(dto.getAmount())
            .vatPercentage(dto.getVatPercentage())
            .discountPercentage(dto.getDiscountPercentage())
            .description(dto.getDescription())
            .notes(dto.getNotes())
            .creationDate(now)
            .lastUpdateDate(now)
            .issueDate(dto.getIssueDate())
            .validityDate(dto.getValidityDate())
            .build();
    }

    public QuotationResponseDTO toDTO(Quotation quotation) {
        return QuotationResponseDTO.builder()
            .id(quotation.getId())
            .customerId(quotation.getCustomer().getId())
            .customerSurname(quotation.getCustomer().getSurname())
            .quotationStatusId(quotation.getQuotationStatus().getId())
            .quotationStatusName(quotation.getQuotationStatus().getName().name())
            .number(quotation.getNumber())
            .amount(quotation.getAmount())
            .vatPercentage(quotation.getVatPercentage())
            .discountPercentage(quotation.getDiscountPercentage())
            .description(quotation.getDescription())
            .notes(quotation.getNotes())
            .creationDate(quotation.getCreationDate())
            .lastUpdateDate(quotation.getLastUpdateDate())
            .issueDate(quotation.getIssueDate())
            .validityDate(quotation.getValidityDate())
            .build();
    }
}
