package com.dennisturco.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dennisturco.dto.SettingsRequestDTO;
import com.dennisturco.dto.SettingsResponseDTO;
import com.dennisturco.service.SettingsService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService service;

    @GetMapping
    public List<SettingsResponseDTO> getAll() {
        return service.getAll();
    }

    @PutMapping
    public ResponseEntity<SettingsResponseDTO> updateQuotation(@RequestBody @NotNull @Valid SettingsRequestDTO dto) {
        SettingsResponseDTO updated = service.update(dto);
        return ResponseEntity.ok(updated);
    }
}
