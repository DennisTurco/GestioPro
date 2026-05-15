package com.dennisturco.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dennisturco.model.QuotationStatus;
import com.dennisturco.service.QuotationStatusService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/quotation-statuses")
@RequiredArgsConstructor
public class QuotationStatusController {
    private final QuotationStatusService service;

    @GetMapping
    public List<QuotationStatus> getAllQuotationStatuses() {
        return service.getAllQuotationStatuses();
    }
}
