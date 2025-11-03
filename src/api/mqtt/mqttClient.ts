import mqtt, { MqttClient } from 'mqtt';
import config from '@/config';

//单例
let mqttClient: MqttClient | null = null;

export function getMqttClient(): MqttClient {
  if (!mqttClient) {
    const mqttConfig = config.mqtt;
    const options = {
      username: mqttConfig.username,
      password: mqttConfig.password,
      clientId: mqttConfig.clientIdPrefix + Math.random().toString(16).slice(2, 10),
      clean: mqttConfig.clean,
      reconnectPeriod: mqttConfig.reconnectPeriod,
      connectTimeout: mqttConfig.connectTimeout,
    };
    mqttClient = mqtt.connect(mqttConfig.brokerUrl, options);
  }
  return mqttClient;
}
