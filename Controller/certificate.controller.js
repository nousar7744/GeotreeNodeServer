import Certificate from "../Models/certificate.model.js";
import Plantation from "../Models/plantation.model.js";
import myUser from "../Models/user.model.js";

// API 17: Get certificate details
export const getCertificateDetails = async (req, res) => {
  try {
    const { certificate_id, user_id } = req.query;

    let certificate;
    if (certificate_id) {
      certificate = await Certificate.findOne({ certificate_id })
        .populate('user_id', 'name mobile email')
        .populate('plantation_id');
    } else if (user_id) {
      certificate = await Certificate.findOne({ user_id })
        .populate('user_id', 'name mobile email')
        .populate('plantation_id')
        .sort({ createdAt: -1 });
    } else {
      return res.status(400).json({
        status: false,
        message: "certificate_id or user_id is required",
        data: {}
      });
    }

    if (!certificate) {
      return res.json({
        status: false,
        message: "Certificate not found",
        data: {}
      });
    }

    return res.json({
      status: true,
      message: "Certificate details fetched",
      data: certificate
    });
  } catch (error) {
    console.error("Get Certificate Details Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API 21: Download certificate (returns certificate data)
export const downloadCertificate = async (req, res) => {
  try {
    const { certificate_id } = req.query;

    if (!certificate_id) {
      return res.status(400).json({
        status: false,
        message: "certificate_id is required",
        data: {}
      });
    }

    const certificate = await Certificate.findOne({ certificate_id })
      .populate('user_id', 'name mobile email')
      .populate('plantation_id');

    if (!certificate) {
      return res.json({
        status: false,
        message: "Certificate not found",
        data: {}
      });
    }

    return res.json({
      status: true,
      message: "Certificate data",
      data: certificate
    });
  } catch (error) {
    console.error("Download Certificate Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

// API 22: Verify certificate via QR
export const verifyCertificate = async (req, res) => {
  try {
    const { qr_code } = req.query;

    if (!qr_code) {
      return res.status(400).json({
        status: false,
        message: "qr_code is required",
        data: {}
      });
    }

    const certificate = await Certificate.findOne({ qr_code })
      .populate('user_id', 'name mobile email')
      .populate('plantation_id');

    if (!certificate) {
      return res.json({
        status: false,
        message: "Invalid QR code",
        data: {}
      });
    }

    return res.json({
      status: true,
      message: "Certificate verified",
      data: certificate
    });
  } catch (error) {
    console.error("Verify Certificate Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      data: {}
    });
  }
};

