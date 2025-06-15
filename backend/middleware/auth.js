import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    
    if (!token) {
      return res.status(403).json({ 
        success: false,
        message: 'Token no proporcionado' 
      });
    }

    const cleanedToken = token.replace('Bearer ', '');
    
    jwt.verify(cleanedToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          success: false,
          message: 'Token inválido o expirado' 
        });
      }

      req.userId = decoded.id;
      req.role = decoded.role;
      next();
    });

  } catch (error) {
    console.error('Error in token verification:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al verificar el token'
    });
  }
};

export default verifyToken;