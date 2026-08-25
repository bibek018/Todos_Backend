export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
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
      req.body = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
};
