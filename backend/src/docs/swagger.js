import swaggerUi from 'swagger-ui-express';
import config from '../config/env.js';

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Bizora API Documentation',
    version: '1.0.0',
    description:
      'AI-Powered Digital Business Platform for Small Businesses Backend REST API. Enables small businesses to create storefronts, sell products, manage orders, communicate in real time, and view sales analytics.'
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api/v1`,
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['customer', 'business_owner', 'admin'] },
          isEmailVerified: { type: 'boolean' },
          phone: { type: 'string' },
          avatar: { type: 'string' }
        }
      },
      Business: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          ownerId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          isPublished: { type: 'boolean' },
          themeSettings: { type: 'object' }
        }
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          businessId: { type: 'string', format: 'uuid' },
          categoryId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          slug: { type: 'string' },
          price: { type: 'number', format: 'float' },
          stockQuantity: { type: 'integer' },
          images: { type: 'array', items: { type: 'string' } }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          orderNumber: { type: 'string' },
          businessId: { type: 'string', format: 'uuid' },
          customerId: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] },
          paymentStatus: { type: 'string', enum: ['unpaid', 'paid', 'refunded', 'failed'] },
          totalAmount: { type: 'number', format: 'float' }
        }
      }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new customer or business owner',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'email', 'password'],
                properties: {
                  firstName: { type: 'string', example: 'Sarah' },
                  lastName: { type: 'string', example: 'Connor' },
                  email: { type: 'string', format: 'email', example: 'sarah@example.com' },
                  password: { type: 'string', example: 'SecurePassword123!' },
                  role: { type: 'string', enum: ['customer', 'business_owner'], example: 'customer' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Registration successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/StandardResponse' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Email already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Log in with email and password',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'sarah@example.com' },
                  password: { type: 'string', example: 'SecurePassword123!' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/auth/refresh': {
      post: {
        summary: 'Refresh access token using refresh token rotation',
        tags: ['Authentication'],
        responses: {
          200: { description: 'Tokens refreshed successfully' },
          401: { description: 'Invalid or revoked refresh token' }
        }
      }
    },
    '/auth/me': {
      get: {
        summary: 'Get currently authenticated user profile',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User profile retrieved' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/businesses': {
      get: {
        summary: 'List published storefronts in marketplace',
        tags: ['Businesses'],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } }
        ],
        responses: {
          200: { description: 'Marketplace businesses list' }
        }
      },
      post: {
        summary: 'Create a new business storefront',
        tags: ['Businesses'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Organic Bakery' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  address: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Business created' }
        }
      }
    },
    '/products': {
      get: {
        summary: 'List products with filters, search, and pagination',
        tags: ['Products'],
        parameters: [
          { name: 'businessId', in: 'query', schema: { type: 'string' } },
          { name: 'categoryId', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'inStock', in: 'query', schema: { type: 'boolean' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
        ],
        responses: {
          200: { description: 'Product list retrieved' }
        }
      },
      post: {
        summary: 'Create a product for a business',
        tags: ['Products'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['businessId', 'name', 'price'],
                properties: {
                  businessId: { type: 'string', format: 'uuid' },
                  categoryId: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                  price: { type: 'number' },
                  stockQuantity: { type: 'integer' },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Product created' }
        }
      }
    },
    '/orders': {
      post: {
        summary: 'Create a customer order with transactional stock reservation',
        tags: ['Orders'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['businessId', 'items'],
                properties: {
                  businessId: { type: 'string', format: 'uuid' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['productId', 'quantity'],
                      properties: {
                        productId: { type: 'string', format: 'uuid' },
                        quantity: { type: 'integer', minimum: 1 }
                      }
                    }
                  },
                  shippingAddress: { type: 'object' },
                  notes: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Order created' },
          400: { description: 'Insufficient stock or invalid business' }
        }
      },
      get: {
        summary: 'List customer orders',
        tags: ['Orders'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Customer orders list' }
        }
      }
    },
    '/payments/process': {
      post: {
        summary: 'Process payment transaction (clean payment provider integration boundary)',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orderId'],
                properties: {
                  orderId: { type: 'string', format: 'uuid' },
                  paymentMethod: { type: 'string', enum: ['card', 'bank_transfer', 'cash_on_delivery', 'wallet'] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Payment processed and verified' }
        }
      }
    },
    '/businesses/{id}/analytics': {
      get: {
        summary: 'Retrieve business monthly sales trends, order status breakdown, and top products',
        tags: ['Analytics'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Analytics retrieved' },
          403: { description: 'Forbidden: unauthorized business owner' }
        }
      }
    },
    '/chat/conversations': {
      get: {
        summary: 'List all chat conversations for authenticated user',
        tags: ['Chat'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Conversations list' }
        }
      },
      post: {
        summary: 'Start or get conversation with a business',
        tags: ['Chat'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['businessId'],
                properties: {
                  businessId: { type: 'string', format: 'uuid' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Conversation started' }
        }
      }
    }
  }
};

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;

