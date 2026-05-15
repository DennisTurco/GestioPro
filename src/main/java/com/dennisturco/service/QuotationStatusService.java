package com.dennisturco.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.dennisturco.model.QuotationStatus;
import com.dennisturco.repository.QuotationStatusRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuotationStatusService {
    private final QuotationStatusRepository repo;

    public List<QuotationStatus> getAllQuotationStatuses() {
        return repo.findAll();
    }

    public QuotationStatus getQuotationStatus(long id) {
        Optional<QuotationStatus> type = repo.findById(id);
        return type.orElse(null);
    }
}

