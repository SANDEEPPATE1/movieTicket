import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please sign in to access the admin area.",
      });
    }

    const user = await clerkClient.users.getUser(userId);
    const metadata = user.privateMetadata || {};

    // Support both metadata formats used by this project.
    const isAdmin = metadata.isAdmin === true || metadata.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access is required for this action.",
      });
    }

    return next();
  } catch (error) {
    console.error("Admin authorization failed:", error.message);
    return res.status(401).json({
      success: false,
      message: "Unable to verify your admin session. Please sign in again.",
    });
  }
};
