const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'Token no proporcionado' });

  const cleanedToken = token.replace('Bearer ', '');
  jwt.verify(cleanedToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token inválido' });

    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  });
}

module.exports = verifyToken;
