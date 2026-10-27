export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
});

export const ALL_PAYMENT_STATUSES = Object.freeze(Object.values(PAYMENT_STATUS));

export const PAYMENT_METHODS = Object.freeze({
  CARD: 'CARD',
  UPI: 'UPI',
  NET_BANKING: 'NET_BANKING',
  WALLET: 'WALLET',
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
});

export const ALL_PAYMENT_METHODS = Object.freeze(Object.values(PAYMENT_METHODS));

/**
 * Strict state machine for payment transitions.
 */
export const PAYMENT_STATUS_TRANSITIONS = Object.freeze({
  [PAYMENT_STATUS.PENDING]: [
    PAYMENT_STATUS.AUTHORIZED,
    PAYMENT_STATUS.CAPTURED,
    PAYMENT_STATUS.FAILED,
  ],
  [PAYMENT_STATUS.AUTHORIZED]: [
    PAYMENT_STATUS.CAPTURED,
    PAYMENT_STATUS.FAILED,
  ],
  [PAYMENT_STATUS.CAPTURED]: [PAYMENT_STATUS.REFUNDED],
  [PAYMENT_STATUS.FAILED]: [],
  [PAYMENT_STATUS.REFUNDED]: [],
});

/**
 * Verifies if a transition between two payment states is permitted
 * @param {string} currentStatus
 * @param {string} targetStatus
 * @returns {boolean}
 */
export const isValidPaymentTransition = (currentStatus, targetStatus) => {
  const allowed = PAYMENT_STATUS_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(targetStatus);
};
