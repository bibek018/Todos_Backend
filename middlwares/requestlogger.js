import logger from "../utils/logger.js";
export const requestlogger = (req, res, next) => {
  logger.info("Incoming request", { method: req.method, url: req.url });
  next();
};
