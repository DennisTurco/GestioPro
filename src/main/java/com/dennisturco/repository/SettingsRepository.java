package com.dennisturco.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dennisturco.model.Settings;

public interface SettingsRepository extends JpaRepository<Settings, String> { }
