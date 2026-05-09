package com.dennisturco.controller;

import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import com.dennisturco.model.User;
import com.dennisturco.service.UserService;

@RestController
@RequestMapping("/api/v1/user")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public User login(@RequestBody User user) {
        return userService.getUserByEmailAndPassword(user.getEmail(), user.getPassword());
    }

    @PostMapping
    public void addNewCustomer(@RequestBody @NonNull User user) {
        userService.insertUser(user);
    }
}