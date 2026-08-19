/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EngineSuite } from './EngineSuite';

export interface ScenarioPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  setup: (suite: EngineSuite) => void;
  runStepByStep?: (suite: EngineSuite, step: number) => Promise<{ title: string; desc: string; done: boolean }>;
  runFullScenario: (suite: EngineSuite) => Promise<void>;
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'ecommerce_lifecycle',
    name: 'E-Commerce Order & Fraud Gate Pipeline',
    category: 'Fintech & Logistics',
    description:
      'Simulates order creation, VIP classification, high-value fraud detection, inventory reservation, and payment capture.',
    setup: (suite) => {
      suite.resetAll();

      // Create Order Context Scope
      const orderScope = suite.contextEngine.createScope('Order Processing Scope', 'global', {
        ordersCount: 0,
        totalRevenue: 0,
        flaggedForFraud: [],
        inventory: {
          'SKU-MACBOOK-M4': 15,
          'SKU-AIRPODS-PRO': 42,
          'SKU-IPHONE-16': 8,
        },
      });

      // Register Subscriptions & Handlers
      suite.eventEngine.subscribe('order.created', (event) => {
        const payload = event.payload as any;
        const currentOrders = suite.contextEngine.get('ordersCount', orderScope.id) || 0;
        const currentRevenue = suite.contextEngine.get('totalRevenue', orderScope.id) || 0;

        suite.contextEngine.set('ordersCount', currentOrders + 1, orderScope.id, event.id);
        suite.contextEngine.set('totalRevenue', currentRevenue + (payload.amount || 0), orderScope.id, event.id);

        // Store memory slot
        suite.contextEngine.setMemorySlot(`order_${payload.orderId}`, payload, {
          scopeId: orderScope.id,
          importance: payload.amount > 1000 ? 9 : 4,
          tags: ['ecommerce', 'order', payload.tier || 'STANDARD'],
          sourceEventId: event.id,
        });
      }, { name: 'OrderStatsTracker' });

      // Register Reactive Rules
      suite.ruleEngine.registerRule({
        id: 'rule_high_value_fraud_check',
        name: 'High Value Order (> $1,500) Security Audit',
        description: 'Flags transactions above $1,500 for secondary risk review',
        enabled: true,
        priority: 10,
        triggerTopicPattern: 'order.created',
        conditionLogic: 'AND',
        conditions: [
          {
            field: 'payload.amount',
            operator: 'gt',
            value: 1500,
          },
        ],
        actions: [
          {
            type: 'EMIT_EVENT',
            targetTopic: 'fraud.audit.required',
            payloadTemplate: {
              orderId: '{{payload.orderId}}',
              customer: '{{payload.customer}}',
              amount: '{{payload.amount}}',
              riskScore: 0.88,
              reason: 'TRANSACTION_THRESHOLD_EXCEEDED',
            },
          },
          {
            type: 'SET_CONTEXT',
            contextPath: 'lastHighValueAlert',
            contextScopeId: orderScope.id,
            valueTemplate: {
              orderId: '{{payload.orderId}}',
              amount: '{{payload.amount}}',
              at: Date.now(),
            },
          },
        ],
      });

      suite.ruleEngine.registerRule({
        id: 'rule_auto_fulfill',
        name: 'Auto-Fulfill Standard Orders',
        description: 'Emits inventory reservation for approved orders',
        enabled: true,
        priority: 5,
        triggerTopicPattern: 'order.created',
        conditionLogic: 'AND',
        conditions: [
          {
            field: 'payload.amount',
            operator: 'lte',
            value: 1500,
          },
        ],
        actions: [
          {
            type: 'EMIT_EVENT',
            targetTopic: 'inventory.reserve.approved',
            payloadTemplate: {
              orderId: '{{payload.orderId}}',
              item: '{{payload.item}}',
              status: 'RESERVED_FOR_SHIPPING',
            },
          },
        ],
      });
    },
    runFullScenario: async (suite) => {
      // 1. Publish standard order
      await suite.eventEngine.publish('order.created', {
        orderId: 'ORD-9821',
        customer: 'Alice Henderson',
        item: 'SKU-AIRPODS-PRO',
        amount: 249.99,
        tier: 'STANDARD',
      }, { source: 'storefront.web', priority: 'NORMAL' });

      await new Promise((r) => setTimeout(r, 400));

      // 2. Publish high-value VIP order (triggers Rule high value fraud audit)
      await suite.eventEngine.publish('order.created', {
        orderId: 'ORD-9822',
        customer: 'Bob Sterling (VIP)',
        item: 'SKU-MACBOOK-M4',
        amount: 3499.0,
        tier: 'VIP_PLATINUM',
      }, { source: 'storefront.mobile', priority: 'HIGH' });

      await new Promise((r) => setTimeout(r, 400));

      // 3. Complete payment settlement
      await suite.eventEngine.publish('payment.settled', {
        orderId: 'ORD-9821',
        transactionId: 'TX-7749102',
        gateway: 'Stripe',
        amount: 249.99,
        status: 'SUCCESS',
      }, { source: 'payment.gateway' });
    },
  },

  {
    id: 'ai_autonomous_agent',
    name: 'Autonomous AI Agent Reasoning Loop',
    category: 'GenAI & Cognitive Architecture',
    description:
      'Demonstrates real-time LLM context accumulation, memory ranking, tool trigger dispatches, and adaptive self-correction.',
    setup: (suite) => {
      suite.resetAll();

      const agentScope = suite.contextEngine.createScope('Agent Working Memory', 'global', {
        agentState: 'IDLE',
        taskQueue: ['Analyze server CPU spike', 'Scale worker pool'],
        activeGoal: 'Ensure 99.99% system availability',
        confidenceScore: 0.94,
      });

      // Populate initial long-term memories
      suite.contextEngine.setMemorySlot('agent_core_directive', {
        directive: 'Maintain cluster latency < 120ms and minimize cloud costs.',
      }, {
        scopeId: agentScope.id,
        importance: 10,
        tags: ['directive', 'system'],
      });

      suite.contextEngine.setMemorySlot('cluster_topology', {
        regions: ['us-west1', 'us-east1', 'europe-west3'],
        primaryDatabase: 'CloudSQL-Postgres-v16',
      }, {
        scopeId: agentScope.id,
        importance: 8,
        tags: ['infrastructure'],
      });

      // Rules for agent
      suite.ruleEngine.registerRule({
        id: 'rule_agent_anomaly_trigger',
        name: 'Agent Cognitive Trigger on Latency Spike',
        description: 'When cluster latency exceeds 250ms, wake agent reasoning cycle',
        enabled: true,
        priority: 10,
        triggerTopicPattern: 'telemetry.metric.anomaly',
        conditionLogic: 'AND',
        conditions: [
          {
            field: 'payload.latencyMs',
            operator: 'gt',
            value: 200,
          },
        ],
        actions: [
          {
            type: 'SET_CONTEXT',
            contextPath: 'agentState',
            contextScopeId: agentScope.id,
            valueTemplate: 'REASONING_ACTIVE',
          },
          {
            type: 'TRIGGER_AI',
            aiPromptTemplate:
              'Latency anomaly detected in region {{payload.region}}: {{payload.latencyMs}}ms. Reason over topology memory and generate remediation.',
          },
          {
            type: 'EMIT_EVENT',
            targetTopic: 'agent.decision.scale_up',
            payloadTemplate: {
              targetRegion: '{{payload.region}}',
              scaleFactor: 2,
              reason: 'AUTONOMOUS_LOAD_MITIGATION',
            },
          },
        ],
      });
    },
    runFullScenario: async (suite) => {
      // 1. Metric anomaly event
      await suite.eventEngine.publish('telemetry.metric.anomaly', {
        metric: 'api_gateway_p99',
        region: 'us-west1',
        latencyMs: 342,
        trafficRps: 45000,
      }, { source: 'datadog.webhook', priority: 'CRITICAL' });

      await new Promise((r) => setTimeout(r, 450));

      // 2. Agent response action
      await suite.eventEngine.publish('agent.action.executed', {
        action: 'PROVISION_CONTAINER_NODES',
        nodesAdded: 4,
        targetRegion: 'us-west1',
        newEstimatedLatencyMs: 85,
      }, { source: 'agent.executor', priority: 'HIGH' });
    },
  },

  {
    id: 'iot_smart_grid',
    name: 'Smart IoT Mesh & Energy Failover',
    category: 'IoT & Edge Systems',
    description:
      'Orchestrates smart grid telemetry, thermal overload trips, battery storage discharge, and grid stabilization.',
    setup: (suite) => {
      suite.resetAll();

      const gridScope = suite.contextEngine.createScope('Substation Grid Alpha', 'global', {
        substation: 'SUB-ALPHA-09',
        loadKw: 12400,
        maxCapacityKw: 15000,
        transformerTempC: 68,
        storageBatterySocPct: 88,
        gridStatus: 'NOMINAL',
      });

      // Rules
      suite.ruleEngine.registerRule({
        id: 'rule_grid_overload_protection',
        name: 'Thermal & Load Critical Protection',
        description: 'Activates emergency BESS discharge when load > 90% and temp > 80C',
        enabled: true,
        priority: 15,
        triggerTopicPattern: 'sensor.telemetry.substation',
        conditionLogic: 'AND',
        conditions: [
          {
            field: 'payload.tempC',
            operator: 'gt',
            value: 80,
          },
        ],
        actions: [
          {
            type: 'SET_CONTEXT',
            contextPath: 'gridStatus',
            contextScopeId: gridScope.id,
            valueTemplate: 'EMERGENCY_DISCHARGE_ACTIVE',
          },
          {
            type: 'EMIT_EVENT',
            targetTopic: 'grid.bess.discharge',
            payloadTemplate: {
              substation: '{{payload.substationId}}',
              dischargeRateKw: 3500,
              mode: 'PEAK_SHAVING',
            },
          },
        ],
      });
    },
    runFullScenario: async (suite) => {
      // 1. Normal telemetry
      await suite.eventEngine.publish('sensor.telemetry.substation', {
        substationId: 'SUB-ALPHA-09',
        tempC: 72,
        currentLoadKw: 13100,
      }, { source: 'modbus.gateway' });

      await new Promise((r) => setTimeout(r, 400));

      // 2. Critical surge trigger
      await suite.eventEngine.publish('sensor.telemetry.substation', {
        substationId: 'SUB-ALPHA-09',
        tempC: 86.5,
        currentLoadKw: 14800,
      }, { source: 'modbus.gateway', priority: 'CRITICAL' });
    },
  },
];
