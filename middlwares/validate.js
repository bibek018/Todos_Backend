export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[source]);

      if (!result.success) {
        const err = new Error(`Validation Failed`);
        err.statusCode = 400;
        err.details = result.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        }));
        console.log(err);
        throw err;
      }
      if (!req.validated) {
        req.validated = {};
      }
      req.validated[source] = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
};
