import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';

/**
 * Standard OpenAPI setup using @asteasolutions/zod-to-openapi
 * This is the industry-standard approach for Zod + OpenAPI
 */

// Create the registry
export const registry = new OpenAPIRegistry();

// Register bearer auth security scheme
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

/**
 * Generate the OpenAPI document
 */
export function generateOpenAPI() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Healthcare App API',
      description: 'API for WDS Healthcare Application',
    },
    servers: [{ url: '/api' }],
    security: [{ bearerAuth: [] }],
  });
}
