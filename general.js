import supabase from "../config/db.js";

// Sign Up function
const signup = async (req, res) => {
  const { email, password, name, phone } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Use Supabase to create a new user, email is unique, and password meets complexity requirements
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    // Extract the user data from authData
    const user = authData.user;

    // Insert the email and other non-sensitive data into the passenger table
    const { data: passengerData, error: dbError } = await supabase
      .from("passenger") // Name of your table
      .insert([
        {
          email: user.email, // Store the email from the newly created user
          name: name, // Add other user details if needed
          phone: phone,
        },
      ])
      .select();

    if (dbError) {
      return res.status(500).json({
        message: "Error storing email in passenger table",
        error: dbError.message,
      });
    }

    // Respond with success
    res.status(200).json({
      // user,
      passengerData,
      message: "User created and email stored in passenger table.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during sign up", error: error.message });
  }
};

// Login function
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Authenticate the user with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    // Extract user and JWT token (access_token) from the response
    const { user, session } = data;

    res.status(200).json({
      message: "Login successful",
      user,
      token: session.access_token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
};

// Logout function (invalidates the session)
const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error during logout" });
  }
};

// Session management (get the current session)
const getSession = async (req, res) => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(200).json({ session });
  } catch (error) {
    res.status(500).json({ message: "Error fetching session" });
  }
};

export { signup, login, logout, getSession };
