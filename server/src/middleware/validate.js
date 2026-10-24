/**
 * Generic zod validation middleware factory.
 * Validates req.body, req.query, or req.params against a zod schema.
 *
 * Usage: validate(myZodSchema)          → validates req.body
 *        validate(myZodSchema, 'query') → validates req.query
 */
const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    // Re-throw as a ZodError so the error handler formats it
    const err = result.error;
    err.statusCode = 400;
    return next(err);
  }

  // Replace with parsed (coerced / defaulted) data
  req[source] = result.data;
  next();
};

export default validate;
