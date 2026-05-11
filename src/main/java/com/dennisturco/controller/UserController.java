package com.dennisturco.controller;

import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dennisturco.dto.UserRequestDTO;
import com.dennisturco.dto.UserResponseDTO;
import com.dennisturco.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
@CrossOrigin
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public void addNewCustomer(@RequestBody @NonNull UserRequestDTO dto) {
        userService.registerUser(dto);
    }

    @GetMapping("/me")
    public UserResponseDTO me(Authentication authentication) {

        org.springframework.security.core.userdetails.User principal =
            (org.springframework.security.core.userdetails.User) authentication.getPrincipal();

        return userService.findDtoByUsername(principal.getUsername());
    }
}
