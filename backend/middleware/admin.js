export const adminCheck = (req, res, next) => {
  // Verifica si el usuario está autenticado y es admin
  if (!req.user) {
    return res.status(401).json({ message: 'No autorizado - Usuario no autenticado' });
  }

  // Verifica el rol del usuario
  if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
    return res.status(403).json({ 
      message: 'Acceso prohibido - Se requieren privilegios de administrador' 
    });
  }

  next();
};