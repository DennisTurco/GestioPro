package com.dennisturco.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Settings {
    @Id
    private String Code;

    @Column(length = 100)
    private String Value;

    @Column(length = 455)
    private String Description;

    private LocalDate lastUpdateDate;
}
