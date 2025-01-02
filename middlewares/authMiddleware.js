const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");  
  if (!token) {
    return res.status(401).json({ message: "Accès refusé. Pas de token." });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.secret);  
    req.user = decoded;  
    next();  
  } catch (error) {
    res.status(400).json({ message: "  invalid toekn." });
  }
};

module.exports = authMiddleware;
