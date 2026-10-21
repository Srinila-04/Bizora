export const PAYMENT_METHODS = {
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  CASH_ON_DELIVERY: 'cash_on_delivery',
  WALLET: 'wallet',
  UPI: 'upi',
  OTHER: 'other'
};

export const PAYMENT_METHOD_LIST = Object.values(PAYMENT_METHODS);

export const PAYMENT_TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const PAYMENT_TRANSACTION_STATUS_LIST = Object.values(PAYMENT_TRANSACTION_STATUS);

export const COD_STATUS = {
  PENDING: 'pending',
  COLLECTED: 'collected',
  FAILED: 'failed'
};

export const COD_STATUS_LIST = Object.values(COD_STATUS);

export default {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LIST,
  PAYMENT_TRANSACTION_STATUS,
  PAYMENT_TRANSACTION_STATUS_LIST,
  COD_STATUS,
  COD_STATUS_LIST
};
