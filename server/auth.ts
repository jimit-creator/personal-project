import type { RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";

export function getSession() {
  return session({
    secret: "studyhub-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
}

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.session || !(req.session as any).isAuthenticated) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export const loginHandler: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const isValid = await storage.validateAdmin(email, password);
  
  if (isValid) {
    (req.session as any).isAuthenticated = true;
    (req.session as any).user = { email };
    res.json({ message: "Login successful", user: { email } });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

export const logoutHandler: RequestHandler = (req, res) => {
  req.session?.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" });
    }
    res.json({ message: "Logout successful" });
  });
};

export const checkAuthHandler: RequestHandler = (req, res) => {
  if (req.session && (req.session as any).isAuthenticated) {
    res.json({ 
      isAuthenticated: true, 
      user: (req.session as any).user 
    });
  } else {
    res.json({ isAuthenticated: false });
  }
};