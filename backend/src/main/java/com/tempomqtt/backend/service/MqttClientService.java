package com.tempomqtt.backend.service;


import com.tempomqtt.backend.repository.MqttClientRepository;
import com.tempomqtt.backend.model.MqttClientConfig;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MqttClientService {

    private final MqttClientRepository repository;

    public MqttClientConfig createClient(MqttClientConfig client) {
        return repository.save(client);
    }

    public List<MqttClientConfig> getAllClients() {
        return repository.findAll();
    }

    public MqttClientConfig getClient(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found"));
    }

    public void deleteClient(Long id) {
        repository.deleteById(id);
    }
}