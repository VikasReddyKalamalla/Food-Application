export const ROLES = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  RESTAURANT_OWNER: 'RESTAURANT_OWNER',
  DELIVERY_PARTNER: 'DELIVERY_PARTNER',
  ADMIN: 'ADMIN',
});

export const ALL_ROLES = Object.freeze(Object.values(ROLES));

export const ACCOUNT_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
});

export const ALL_ACCOUNT_STATUSES = Object.freeze(Object.values(ACCOUNT_STATUS));
