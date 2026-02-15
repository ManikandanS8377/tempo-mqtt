package com.tempomqtt.backend.repository;

import com.tempomqtt.backend.model.MqttClientConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MqttClientRepository extends JpaRepository<MqttClientConfig, Long> {
}