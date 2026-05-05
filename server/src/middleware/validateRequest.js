const validateRequest = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  if (source === "query") {
    Object.assign(req.query, result.data);
  } else {
    req[source] = result.data;
  }

  next();
};

export default validateRequest;
