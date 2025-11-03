// src/api/mqtt/mqttClient.ts
import mqtt, { MqttClient } from 'mqtt';

const options = {
  username: 'guest',
  password: 'guest',
  clientId: 'fish-dish-web-' + Math.random().toString(16).substr(2, 8),
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
};
//rabbitmq_web_mqtt 监听 15675 端口（WebSocket 协议）
const brokerUrl = 'ws://192.168.31.168:15675/ws';
//单例
let mqttClient: MqttClient | null = null;

export function getMqttClient(): MqttClient {
  if (!mqttClient) {
    mqttClient = mqtt.connect(brokerUrl, options);
  }
  return mqttClient;
}
