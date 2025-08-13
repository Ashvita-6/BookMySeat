const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === '23505') { // PostgreSQL unique violation
    return res.status(400).json({ error: 'Duplicate entry' });
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    return res.status(400).json({ error: 'Referenced record not found' });
  }

  res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;