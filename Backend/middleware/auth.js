import { User } from "../models/User.model.js";
import asyncHandler from "./asyncHandler.js";
import jwt from 'jsonwebtoken';
import { ApiError } from "../utils/ApiError.js";

export const protect = asyncHandler(async (req, res, next) => {
  console.log("[AUTH] Protect middleware invoked");
  console.log("[AUTH] Starting authentication middleware with req:", req);
  // Check if the token is present in cookies or Authorization header
  let token;
  console.log("[AUTH] starting authentication middleware");
  console.log("[AUTH] Request Headers:", req.headers);
  console.log("[AUTH] Raw Headers:", req.headers);

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log("[AUTH] Token found in cookies:", token);
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(" ")[1];
    console.log("[AUTH] Token found in Authorization header:", token);
  } else {
    console.log("[AUTH] No token found in cookies or Authorization header");
  }

  if (!token) {
    console.log("[AUTH] No token provided");
    throw new ApiError(401, 'Not authorized to access this route');
  }

  try {
    console.log("[AUTH] Verifying token:", token);
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("[AUTH] Token decoded successfully:", decoded);
    // Find the user by ID from the decoded token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      // If no user is found, throw an error
      console.log("[AUTH] No user found with id:", decoded.id);
      throw new ApiError(401, 'No user found with this id');
    }
    next();
  } catch (error) {
    console.error("[AUTH] Error during jwt token verification:", error);
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired');
    }
    console.log("[AUTH] JWT verification error:", error);
    throw new ApiError(401, 'Not authorized to access this route');
  }
});


export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `User role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};

export { protect as authMiddleware };

