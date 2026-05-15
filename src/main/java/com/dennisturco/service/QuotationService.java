package com.dennisturco.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.dennisturco.dto.QuotationRequestDTO;
import com.dennisturco.dto.QuotationResponseDTO;
import com.dennisturco.exception.BusinessException;
import com.dennisturco.mapper.QuotationMapper;
import com.dennisturco.model.Quotation;
import com.dennisturco.model.QuotationStatus;
import com.dennisturco.repository.QuotationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuotationService {
    private final QuotationRepository repo;
    private final QuotationMapper mapper;

    public List<QuotationResponseDTO> getAllQuotations() {
        return repo.findAll()
            .stream()
            .map(mapper::toDTO)
            .toList();
    }

    public void insertQuotation(QuotationRequestDTO dto) {
        Quotation quotation = mapper.toEntity(dto);

        if (quotation == null)
            throw new BusinessException("Errore creazione preventivo");
        if (repo.existsByNumber(quotation.getNumber()))
            throw new BusinessException("Numero preventivo già presente");

        repo.save(quotation);
    }

    public QuotationResponseDTO updateQuotationById(long id, QuotationRequestDTO dto) {
        Quotation existing = repo.findById(id)
            .orElseThrow(() -> new BusinessException("Preventivo non trovato"));

        Quotation quotation = mapper.toEntity(dto);
        existing.setCustomer(quotation.getCustomer());
        existing.setQuotationStatus(quotation.getQuotationStatus());
        existing.setNumber(quotation.getNumber());
        existing.setVatPercentage(quotation.getVatPercentage());
        existing.setDiscountPercentage(quotation.getDiscountPercentage());
        existing.setAmount(quotation.getAmount());
        existing.setDescription(quotation.getDescription());
        existing.setNotes(quotation.getNotes());
        existing.setIssueDate(quotation.getIssueDate());
        existing.setLastUpdateDate(LocalDate.now());
        existing.setValidityDate(quotation.getValidityDate());

        quotation = repo.save(existing);
        return mapper.toDTO(quotation);
    }

    public QuotationResponseDTO updateQuotationStatusById(long id, QuotationStatus status) {
        Quotation existing = repo.findById(id)
            .orElseThrow(() -> new BusinessException("Preventivo non trovato"));

        existing.setQuotationStatus(status);
        existing.setLastUpdateDate(LocalDate.now());

        existing = repo.save(existing);
        return mapper.toDTO(existing);
    }

    public void deleteQuotation(long id) {
        repo.deleteById(id);
    }
}
