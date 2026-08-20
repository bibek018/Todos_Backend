export const requestlogger = (req, res, next) => {
  console.log(
    `New request received \n Request Method :${req.method} \n Request URL :${req.url}`
  );
  next();
};
