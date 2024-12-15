import supabase from "./db.js";

// Middleware to check if the user is authenticated
const authenticate = async (req, res, next) => {
  // Get the Authorization header from the request
  const { authorization } = req.headers;

  // If no token is provided, return an unauthorized error
  if (!authorization) {
    return res.status(403).json({ message: "Authorization token is required" });
  }

  // Extract the token (bearer token format: "Bearer <token>")
  const token = authorization.split(" ")[1];

  try {
    // Use Supabase's API to get the user from the token
    const {
      data: { user },
      error,
    } = await supabase.auth.api.getUser(token);

    // If there's an error or no user is found, return an unauthorized error
    if (error || !user) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Attach the user data to the request object for use in route handlers
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error verifying token" });
  }
};

// Function to check if a user is an admin (admin-specific routes)
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

// Function to check if a user is a passenger (passenger-specific routes)
const isPassenger = (req, res, next) => {
  if (req.user.role !== "passenger") {
    return res.status(403).json({ message: "Access denied: Passengers only" });
  }
  next();
};

// Function to check if a user is staff (staff-specific routes)
const isStaff = (req, res, next) => {
  if (req.user.role !== "staff") {
    return res.status(403).json({ message: "Access denied: Staff only" });
  }
  next();
};

export { authenticate, isAdmin, isPassenger, isStaff };
