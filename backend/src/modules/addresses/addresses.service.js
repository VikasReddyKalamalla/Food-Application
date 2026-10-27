import crypto from 'node:crypto';
import { NotFoundError } from '../../common/errors/index.js';

/**
 * Address Service (Phase 1 Foundation Scaffold)
 * Ready for Phase 2 Mongoose Address Schema integration
 */
export class AddressesService {
  constructor() {
    this.addresses = new Map(); // addressId -> address
  }

  async getUserAddresses(userId) {
    const list = [];
    for (const addr of this.addresses.values()) {
      if (addr.userId === userId) {
        list.push(addr);
      }
    }
    return list;
  }

  async createAddress(userId, data) {
    const id = crypto.randomUUID();
    const address = {
      id,
      userId,
      label: data.label || 'Home',
      street: data.street,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      location: data.location || { lat: 0, lng: 0 },
      isDefault: Boolean(data.isDefault),
      createdAt: new Date(),
    };
    this.addresses.set(id, address);
    return address;
  }

  async deleteAddress(userId, addressId) {
    const address = this.addresses.get(addressId);
    if (!address || address.userId !== userId) {
      throw new NotFoundError('Address not found');
    }
    this.addresses.delete(addressId);
    return { deleted: true };
  }
}

export const addressesService = new AddressesService();
export default addressesService;
