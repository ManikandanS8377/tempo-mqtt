package com.tempomqtt.backend.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class HealthCheck {

    @GetMapping("/health")
    public String health() {
        return "Tempo Backend Running 🚀";
    }
}