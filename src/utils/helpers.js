/**
 * Utility helper functions
 */

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const noop = () => {};

export const isObject = (value) => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

export const isEmpty = (value) => {
  if (value == null) return true;
  if (Array.isArray(value) || typeof value === "string") return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
};

/**
 * Normalize API error responses (strings, arrays, objects) into a readable message
 */
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (!error && error !== 0) return fallback;

  if (typeof error === "string") {
    return error;
  }

  if (Array.isArray(error)) {
    return error
      .map((item) => getErrorMessage(item, fallback))
      .filter(Boolean)
      .join(" ");
  }

  if (typeof error === "object") {
    if (error.message) {
      return getErrorMessage(error.message, fallback);
    }

    if (error.msg) {
      return getErrorMessage(error.msg, fallback);
    }

    if (error.detail) {
      return getErrorMessage(error.detail, fallback);
    }

    if (error.error) {
      return getErrorMessage(error.error, fallback);
    }

    if (error.loc && error.msg) {
      const location = Array.isArray(error.loc) ? error.loc.join(".") : error.loc;
      return `${location ? `${location}: ` : ""}${error.msg}`;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return fallback;
    }
  }

  return fallback;
};

