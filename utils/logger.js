import winston from "winston";
const logger = winston.createLogger({
    level:"info",
    format:winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({timestamp, level, message, ...meta})=>{
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
        })
    ),
    transports:[new winston.transports.Console()],
})
export default logger;