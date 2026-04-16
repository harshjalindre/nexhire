const isDev = import.meta.env.DEV;
const logger = {
  info: (...args: unknown[]) => isDev && console.info("[NexHire]", ...args),
  warn: (...args: unknown[]) => console.warn("[NexHire]", ...args),
  error: (...args: unknown[]) => console.error("[NexHire]", ...args),
  debug: (...args: unknown[]) => isDev && console.debug("[NexHire]", ...args),
};
export default logger;
