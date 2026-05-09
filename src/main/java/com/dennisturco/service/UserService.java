package com.dennisturco.service;

import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.dennisturco.model.User;
import com.dennisturco.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User getUserByEmailAndPassword(String email, String password) {
        User user = userRepository.findByEmail(email);

        if (user == null)
            throw new RuntimeException("User not found");
        if(!passwordEncoder.matches(password, user.getPassword()))
            throw new RuntimeException("Wrong password");

        return user;
    }

    public User insertUser(@NonNull User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
}
