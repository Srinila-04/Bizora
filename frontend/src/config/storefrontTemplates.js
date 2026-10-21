/**
 * Bizora Storefront Templates Entry Point
 *
 * Re-exports the authoritative category and template registry.
 * Maintains complete backward compatibility with existing components and tests
 * while enabling the scalable 5-templates-per-category system.
 */

import {
  STOREFRONT_TEMPLATE_REGISTRY,
  getTemplatesForCategory,
  getTemplateById,
  resolveStorefrontTemplate,
  UNIVERSAL_FALLBACK_TEMPLATES,
  LEGACY_TEMPLATE_ALIASES
} from './storefrontTemplateRegistry.js';

import {
  CATEGORIES_REGISTRY,
  SUPPORTED_CATEGORIES_LIST,
  normalizeCategoryKey,
  getCategoryMetadata,
  isCategoryConfigured
} from './categoryRegistry.js';

export const STOREFRONT_TEMPLATES = STOREFRONT_TEMPLATE_REGISTRY;

export const DEFAULT_STOREFRONT_TEMPLATE = STOREFRONT_TEMPLATE_REGISTRY['universal-classic'];

export const STOREFRONT_TEMPLATES_LIST = Object.values(STOREFRONT_TEMPLATE_REGISTRY);

/**
 * Backward compatible getStorefrontTemplate helper
 */
export const getStorefrontTemplate = (business, isPreview = false) => {
  return resolveStorefrontTemplate(business, isPreview);
};

export {
  STOREFRONT_TEMPLATE_REGISTRY,
  getTemplatesForCategory,
  getTemplateById,
  resolveStorefrontTemplate,
  UNIVERSAL_FALLBACK_TEMPLATES,
  LEGACY_TEMPLATE_ALIASES,
  CATEGORIES_REGISTRY,
  SUPPORTED_CATEGORIES_LIST,
  normalizeCategoryKey,
  getCategoryMetadata,
  isCategoryConfigured
};

export default STOREFRONT_TEMPLATES;
