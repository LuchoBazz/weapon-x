import { Config } from './types';
import { DEFAULT_BOOLEAN_SCHEMA, DEFAULT_STRING_SCHEMA, DEFAULT_SECRET_SCHEMA } from './constants';

export const INITIAL_DATA: Config[] = [
  {
    id: "92521932-2bc1-4e12-8086-89812abd0ec5",
    project_reference: "DEADPOOL_STAGING",
    key: "new_checkout_flow",
    description: "Toggles the new streamlined 3-step checkout flow.",
    type: "BOOLEAN",
    is_active: true,
    default_value: false,
    validation_schema: DEFAULT_BOOLEAN_SCHEMA,
    rules: [
      {
        id: "rule_vip_co_001",
        name: "VIP Customers in Colombia",
        return_value: true,
        conditions: [
          { attribute: "client_id", operator: "IN", value: "VIP_01, VIP_02" },
          { attribute: "country", operator: "EQUALS", value: "CO" }
        ]
      }
    ],
    updated_at: new Date().toISOString()
  },
  {
    id: "2aff679c-f2d3-40f6-9c2c-c750e0f692a0",
    project_reference: "ECOM_STOREFRONT_PROD",
    key: "seasonal_promo_banner",
    description: "Configuration for the Black Friday banner.",
    type: "JSON",
    is_active: true,
    default_value: {
      is_visible: true,
      headline: "Black Friday Madness!",
      background_color: "#D32F2F",
      cta_url: "/deals/black-friday"
    },
    validation_schema: {
      type: "object",
      required: ["is_visible", "headline"],
      properties: {
        is_visible: { type: "boolean", title: "Show Banner?" },
        headline: { type: "string", minLength: 5 },
        background_color: { type: "string", pattern: "^#([A-Fa-f0-9]{6})$" }
      }
    },
    rules: [],
    updated_at: new Date().toISOString()
  },
  {
    id: "f7a31b04-8e6c-4d2a-b519-3c8ef10da74b",
    project_reference: "DEADPOOL_STAGING",
    key: "onboarding_steps",
    description: "Controls the onboarding wizard steps and copy for new users.",
    type: "JSON",
    is_active: true,
    default_value: {
      steps: ["welcome", "profile", "preferences"],
      skip_allowed: false,
      timeout_seconds: 300
    },
    validation_schema: {
      type: "object",
      required: ["steps", "skip_allowed"],
      properties: {
        steps: { type: "array", items: { type: "string" }, minItems: 1 },
        skip_allowed: { type: "boolean" },
        timeout_seconds: { type: "number", minimum: 30 }
      }
    },
    rules: [
      {
        id: "rule_internal_testers",
        name: "Internal Testers Get Short Flow",
        return_value: {
          steps: ["welcome", "preferences"],
          skip_allowed: true,
          timeout_seconds: 60
        },
        conditions: [
          { attribute: "email", operator: "CONTAINS", value: "@weaponx.dev" }
        ]
      }
    ],
    updated_at: new Date().toISOString()
  },
  {
    id: "a1c4e7b2-3d9f-4a6e-8b12-5f0d3c7e9a1b",
    project_reference: "DEADPOOL_STAGING",
    key: "welcome_message",
    description: "Customizable welcome greeting shown on the dashboard landing page.",
    type: "STRING",
    is_active: true,
    default_value: "Welcome back, Agent!",
    validation_schema: DEFAULT_STRING_SCHEMA,
    rules: [
      {
        id: "rule_vip_greeting",
        name: "VIP Personalized Greeting",
        return_value: "Welcome back, Commander. Your mission awaits.",
        conditions: [
          { attribute: "client_id", operator: "IN", value: "VIP_01, VIP_02" }
        ]
      },
      {
        id: "rule_co_locale",
        name: "Colombia Locale Greeting",
        return_value: "¡Bienvenido de nuevo, Agente!",
        conditions: [
          { attribute: "country", operator: "EQUALS", value: "CO" }
        ]
      }
    ],
    updated_at: new Date().toISOString()
  },
  {
    id: "b3d5f8a1-6c2e-4b7d-9e01-4a8f2d6c3b5e",
    project_reference: "DEADPOOL_STAGING",
    key: "third_party_api_key",
    description: "Encrypted API key for the external payment gateway.",
    type: "SECRET",
    is_active: true,
    default_value: "sk_live_default_key_placeholder",
    validation_schema: DEFAULT_SECRET_SCHEMA,
    rules: [
      {
        id: "rule_staging_key",
        name: "Staging Environment Key",
        return_value: "sk_test_staging_key_placeholder",
        conditions: [
          { attribute: "environment", operator: "EQUALS", value: "staging" }
        ]
      }
    ],
    updated_at: new Date().toISOString()
  }
];
