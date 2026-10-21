import sequelize from '../config/database.js';
import { Address } from '../database/models/index.js';
import { ApiError } from '../utils/apiError.js';

export class AddressService {
  static async getAddresses(userId) {
    return Address.findAll({
      where: { userId },
      order: [
        ['isDefault', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });
  }

  static async getAddressById(userId, addressId) {
    const address = await Address.findOne({
      where: { id: addressId, userId }
    });
    if (!address) {
      throw ApiError.notFound('Address not found');
    }
    return address;
  }

  static async createAddress(userId, data) {
    const t = await sequelize.transaction();
    try {
      const count = await Address.count({ where: { userId }, transaction: t });
      // If it's the first address, it must be default. Otherwise respect data.isDefault.
      const shouldBeDefault = count === 0 ? true : Boolean(data.isDefault);

      if (shouldBeDefault && count > 0) {
        await Address.update(
          { isDefault: false },
          { where: { userId }, transaction: t }
        );
      }

      const address = await Address.create(
        {
          userId,
          recipientName: data.recipientName.trim(),
          phone: data.phone.trim(),
          addressLine1: data.addressLine1.trim(),
          addressLine2: data.addressLine2 ? data.addressLine2.trim() : null,
          city: data.city.trim(),
          state: data.state.trim(),
          postalCode: data.postalCode.trim(),
          country: data.country ? data.country.trim() : 'India',
          isDefault: shouldBeDefault
        },
        { transaction: t }
      );

      await t.commit();
      return address;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async updateAddress(userId, addressId, data) {
    const t = await sequelize.transaction();
    try {
      const address = await Address.findOne({
        where: { id: addressId, userId },
        transaction: t
      });

      if (!address) {
        throw ApiError.notFound('Address not found');
      }

      if (data.isDefault && !address.isDefault) {
        await Address.update(
          { isDefault: false },
          { where: { userId }, transaction: t }
        );
        address.isDefault = true;
      }

      if (data.recipientName !== undefined) address.recipientName = data.recipientName.trim();
      if (data.phone !== undefined) address.phone = data.phone.trim();
      if (data.addressLine1 !== undefined) address.addressLine1 = data.addressLine1.trim();
      if (data.addressLine2 !== undefined) address.addressLine2 = data.addressLine2 ? data.addressLine2.trim() : null;
      if (data.city !== undefined) address.city = data.city.trim();
      if (data.state !== undefined) address.state = data.state.trim();
      if (data.postalCode !== undefined) address.postalCode = data.postalCode.trim();
      if (data.country !== undefined) address.country = data.country.trim();

      await address.save({ transaction: t });
      await t.commit();
      return address;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async deleteAddress(userId, addressId) {
    const t = await sequelize.transaction();
    try {
      const address = await Address.findOne({
        where: { id: addressId, userId },
        transaction: t
      });

      if (!address) {
        throw ApiError.notFound('Address not found');
      }

      const wasDefault = address.isDefault;
      await address.destroy({ transaction: t });

      // If default was deleted, promote the most recently created address as default
      if (wasDefault) {
        const nextDefault = await Address.findOne({
          where: { userId },
          order: [['createdAt', 'DESC']],
          transaction: t
        });

        if (nextDefault) {
          nextDefault.isDefault = true;
          await nextDefault.save({ transaction: t });
        }
      }

      await t.commit();
      return { message: 'Address deleted successfully' };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async setDefaultAddress(userId, addressId) {
    const t = await sequelize.transaction();
    try {
      const address = await Address.findOne({
        where: { id: addressId, userId },
        transaction: t
      });

      if (!address) {
        throw ApiError.notFound('Address not found');
      }

      await Address.update(
        { isDefault: false },
        { where: { userId }, transaction: t }
      );

      address.isDefault = true;
      await address.save({ transaction: t });

      await t.commit();
      return address;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

export default AddressService;

