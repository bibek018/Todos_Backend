import logger from "../utils/logger";

export const notFound=(req, res, next)=>{
    logger.warn(`Route not found: [${req.method}] ${req.url}`)
    res.status(404).json({message:"Bad Request, Not Found!"});
}