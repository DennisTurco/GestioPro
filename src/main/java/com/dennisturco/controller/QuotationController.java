package com.dennisturco.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dennisturco.dto.QuotationRequestDTO;
import com.dennisturco.dto.QuotationResponseDTO;
import com.dennisturco.model.QuotationStatus;
import com.dennisturco.service.QuotationService;
import com.dennisturco.service.QuotationStatusService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/v1/quotations")
@RequiredArgsConstructor
public class QuotationController {

    private final QuotationService quotationService;
    private final QuotationStatusService quotationStatusService;

    @GetMapping
    public List<QuotationResponseDTO> getAllQuotations() {
        return quotationService.getAllQuotations();
    }

    @PostMapping
    public ResponseEntity<Void> addNewQuotation(@RequestBody @NotNull @Valid QuotationRequestDTO dto) {
        quotationService.insertQuotation(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable long id) {
        quotationService.deleteQuotation(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuotationResponseDTO> updateQuotation(@PathVariable long id, @RequestBody @NotNull @Valid QuotationRequestDTO dto) {
        QuotationResponseDTO updated = quotationService.updateQuotationById(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/status-update/{id}")
    public ResponseEntity<QuotationResponseDTO> updateQuotaionStatusToAccepted(@PathVariable long id, @RequestBody int statusId) {
        QuotationStatus status = quotationStatusService.getQuotationStatus(statusId);
        QuotationResponseDTO updated = quotationService.updateQuotationStatusById(id, status);
        return ResponseEntity.ok(updated);
    }
}
