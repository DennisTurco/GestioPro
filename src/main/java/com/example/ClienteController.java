package com.example;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clienti")
@CrossOrigin
public class ClienteController {

    private final ClienteRepository repo;

    public ClienteController(ClienteRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Cliente> all() {
        return repo.findAll();
    }

    @PostMapping
    public Cliente add(@RequestBody Cliente c) {
        return repo.save(c);
    }
}