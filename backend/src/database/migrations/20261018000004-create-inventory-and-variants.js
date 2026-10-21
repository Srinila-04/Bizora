import crypto from 'crypto';

export const up = async (queryInterface, Sequelize, transaction) => {
  // 1. Create product_variants table
  await queryInterface.createTable(
    'product_variants',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      businessId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      barcode: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      attributes: {
        type: Sequelize.JSON,
        defaultValue: {}
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      costPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      physicalStock: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      reservedQuantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      stockQuantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      lowStockThreshold: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
        allowNull: false
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'archived'),
        defaultValue: 'active',
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    },
    { transaction }
  );

  // Add indexes to product_variants (businessId and productId are indexed automatically by MySQL FK)
  await queryInterface.addIndex('product_variants', ['sku'], { transaction });
  await queryInterface.addIndex('product_variants', ['businessId', 'sku'], {
    name: 'idx_business_variant_sku',
    transaction
  });

  // 2. Add physicalStock & reservedQuantity to products table
  await queryInterface.addColumn(
    'products',
    'physicalStock',
    {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    { transaction }
  );

  await queryInterface.addColumn(
    'products',
    'reservedQuantity',
    {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    { transaction }
  );

  // 3. Add variantId & sku to order_items table
  await queryInterface.addColumn(
    'order_items',
    'variantId',
    {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'product_variants',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    { transaction }
  );

  await queryInterface.addColumn(
    'order_items',
    'sku',
    {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    { transaction }
  );

  // 4. Create stock_movements table (Audit log)
  await queryInterface.createTable(
    'stock_movements',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      businessId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      variantId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'product_variants',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      movementType: {
        type: Sequelize.ENUM(
          'stock_received',
          'damage_loss',
          'correction',
          'return_restock',
          'order_reservation',
          'order_release',
          'order_fulfilled',
          'initial_setup',
          'manual_adjustment'
        ),
        allowNull: false
      },
      quantityChange: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      physicalStockBefore: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      physicalStockAfter: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reservedBefore: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      reservedAfter: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      availableBefore: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      availableAfter: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'orders',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      orderNumber: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      actorId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      actorRole: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    },
    { transaction }
  );

  // Add indexes to stock_movements (businessId, productId, variantId are indexed automatically by MySQL FK)
  await queryInterface.addIndex('stock_movements', ['movementType'], { transaction });
  await queryInterface.addIndex('stock_movements', ['createdAt'], { transaction });
  await queryInterface.addIndex('stock_movements', ['businessId', 'createdAt'], {
    name: 'idx_stock_movements_biz_created',
    transaction
  });

  // 5. Data Migration: Initialize physicalStock on existing products & create default variant records
  const [products] = await queryInterface.sequelize.query(
    'SELECT id, businessId, name, sku, price, costPrice, stockQuantity, lowStockThreshold, createdAt, updatedAt FROM products',
    { transaction }
  );

  const now = new Date();
  const seenSkus = new Set();
  for (const prod of products) {
    const physical = prod.stockQuantity || 0;
    const reserved = 0;
    const available = physical;

    // Update physicalStock on products
    await queryInterface.sequelize.query(
      'UPDATE products SET physicalStock = :physical, reservedQuantity = 0 WHERE id = :id',
      {
        replacements: { physical, id: prod.id },
        transaction
      }
    );

    // Stable SKU generation for products without SKU or duplicate SKU within business
    let finalSku = prod.sku;
    if (!finalSku) {
      const cleanPrefix = prod.name
        ? prod.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()
        : 'PRD';
      const cleanId = prod.id.replace(/-/g, '').slice(0, 6).toUpperCase();
      finalSku = `SKU-${cleanPrefix}-${cleanId}`;
      await queryInterface.sequelize.query(
        'UPDATE products SET sku = :sku WHERE id = :id',
        {
          replacements: { sku: finalSku, id: prod.id },
          transaction
        }
      );
    }

    const bizSkuKey = `${prod.businessId}:${finalSku}`;
    if (seenSkus.has(bizSkuKey)) {
      const shortSuffix = prod.id.replace(/-/g, '').slice(0, 4).toUpperCase();
      finalSku = `${finalSku}-${shortSuffix}`;
      await queryInterface.sequelize.query(
        'UPDATE products SET sku = :sku WHERE id = :id',
        {
          replacements: { sku: finalSku, id: prod.id },
          transaction
        }
      );
    }
    seenSkus.add(`${prod.businessId}:${finalSku}`);

    // Generate variant and movement UUIDs
    const variantId = crypto.randomUUID();
    const movementId = crypto.randomUUID();

    // Insert default variant
    await queryInterface.sequelize.query(
      `INSERT INTO product_variants 
        (id, businessId, productId, name, sku, barcode, attributes, price, costPrice, physicalStock, reservedQuantity, stockQuantity, lowStockThreshold, isDefault, status, createdAt, updatedAt)
       VALUES 
        (:id, :businessId, :productId, 'Default', :sku, NULL, JSON_OBJECT(), :price, :costPrice, :physicalStock, :reservedQuantity, :stockQuantity, :lowStockThreshold, true, 'active', :createdAt, :updatedAt)`,
      {
        replacements: {
          id: variantId,
          businessId: prod.businessId,
          productId: prod.id,
          sku: finalSku,
          price: prod.price || 0,
          costPrice: prod.costPrice || null,
          physicalStock: physical,
          reservedQuantity: reserved,
          stockQuantity: available,
          lowStockThreshold: prod.lowStockThreshold || 5,
          createdAt: prod.createdAt || now,
          updatedAt: prod.updatedAt || now
        },
        transaction
      }
    );

    // Insert initial setup stock movement
    await queryInterface.sequelize.query(
      `INSERT INTO stock_movements
        (id, businessId, productId, variantId, sku, movementType, quantityChange, physicalStockBefore, physicalStockAfter, reservedBefore, reservedAfter, availableBefore, availableAfter, reason, notes, createdAt, updatedAt)
       VALUES
        (:id, :businessId, :productId, :variantId, :sku, 'initial_setup', :quantityChange, 0, :physicalStock, 0, 0, 0, :available, 'Initial inventory setup', 'Migrated from product catalog', :createdAt, :updatedAt)`,
      {
        replacements: {
          id: movementId,
          businessId: prod.businessId,
          productId: prod.id,
          variantId,
          sku: finalSku,
          quantityChange: physical,
          physicalStock: physical,
          available,
          createdAt: prod.createdAt || now,
          updatedAt: prod.updatedAt || now
        },
        transaction
      }
    );
  }
};

export const down = async (queryInterface, Sequelize, transaction) => {
  await queryInterface.dropTable('stock_movements', { transaction });
  await queryInterface.removeColumn('order_items', 'variantId', { transaction });
  await queryInterface.removeColumn('order_items', 'sku', { transaction });
  await queryInterface.removeColumn('products', 'physicalStock', { transaction });
  await queryInterface.removeColumn('products', 'reservedQuantity', { transaction });
  await queryInterface.dropTable('product_variants', { transaction });
};
