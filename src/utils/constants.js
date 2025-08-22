export const RESP = {
  OK: (data = {}) => ({ success: true, ...data }),
  ERR: (message = 'Error', code = 'ERROR') => ({ success: false, code, message })
};

export const FEED = {
  PAGE_SIZE: 20
};

export const PREMIUM = {
  REQUIRED_MSG: 'Premium content. Please subscribe to access.'
};
