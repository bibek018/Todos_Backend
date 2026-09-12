import app from "./app.js";
import logger from "./utils/logger.js";
import { dbConnection } from "./config/dbConnection.js";

const PORT = process.env.PORT || 3000;
await dbConnection();
app.listen(PORT, () => {
  // console.log(`Server is listening at port:${process.env.PORT || 3000}`);
  logger.info(`Server is listening at port ${PORT}`);
});
