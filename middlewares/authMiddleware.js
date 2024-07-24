import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import Users from '../models/userModel.js';

//Protect routes
const protect = asyncHandler(async (req, res, next) => {

  //Read the JWT from the cookie
  let token = req.cookies.jwt;

  if( token ){
    try{
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await Users.findById(decoded.userId)
        .select('-name -password -dni -category');

      next();

    } catch (error){
      res.status(401).json({ message: 'No autorizado'});
      throw new Error('No authorized, token failed');
    }
  } else {
    res.status(401).json({ message: 'No autorizado'});
    throw new Error('No authorized, no token');
  }
});

const professionalProtect = (req, res, next) => {
  if(req.user && req.user.isProfessional) {
    next();
    
  } else {
    res.status(401).json({ message: 'No autorizado'});
    throw new Error('No authorized as profesional');
  }
}

export { professionalProtect, protect };


