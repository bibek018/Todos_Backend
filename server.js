import app from "./app.js";
import logger from "./utils/logger.js";
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // console.log(`Server is listening at port:${process.env.PORT || 3000}`);
  logger.info(`Server is listening at port ${PORT}`);
});
