import admin from "../firebase.js";

// API: Verify Firebase ID token
export const verifyFirebaseUser = async (req, res) => {
  try {
    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({
        status: false,
        message: "id_token is required",
        data: {}
      });
    }

    if (!admin.apps.length) {
      return res.status(500).json({
        status: false,
        message: "Firebase admin is not initialized",
        data: {}
      });
    }

    const decoded = await admin.auth().verifyIdToken(id_token);

    return res.json({
      status: true,
      message: "Firebase user verified",
      data: decoded
    });
  } catch (error) {
    console.error("Verify Firebase User Error:", error);
    return res.status(401).json({
      status: false,
      message: "Invalid Firebase token",
      data: {}
    });
  }
};
