import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY=process.env.JWT_KEY;
//console.log("from middleware", SECRET_KEY)

export function middleware(req,res,next){
    if(req.path==='/login'){
        return next();
    }

    const jwtToken = req.header('Authorization')?.replace('Bearer ', '');
    if (!jwtToken) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try{
        const decodedToken = jwt.verify(jwtToken,SECRET_KEY);
        req.user=decodedToken;
        console.log("Middleware Passed")
        next();
    }
    catch(err){
        console.log(err);
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

export function socketMiddleware(socket, next) {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error: No token"));
    }
  
    try {
      const user = jwt.verify(token,SECRET_KEY);
      socket.user = user; 
      console.log("Socket Middleware Passed");
      next();
    } catch (err) {
      console.log(err);
      return next(new Error("Authentication error: Invalid token"));
    }
  }

