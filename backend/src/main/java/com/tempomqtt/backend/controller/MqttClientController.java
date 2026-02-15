package com.tempomqtt.backend.controller;

import com.tempomqtt.backend.model.MqttClientConfig;
import com.tempomqtt.backend.service.MqttClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@CrossOrigin
public class MqttClientController {

    private final MqttClientService service;

    @PostMapping
    public MqttClientConfig create(@RequestBody MqttClientConfig client) {
        return service.createClient(client);
    }

    @GetMapping
    public List<MqttClientConfig> getAll() {
        return service.getAllClients();
    }

    @GetMapping("/{id}")
    public MqttClientConfig getById(@PathVariable Long id) {
        return service.getClient(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteClient(id);
    }
}