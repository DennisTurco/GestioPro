package com.dennisturco.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dennisturco.model.User;

public interface UserRepository extends JpaRepository<User, UUID> {
    User findByEmail(String email);
}
