import { Alert } from "../models/alert.model.js";
import { triggerAlertActions } from "./alert.actions.js";

export const receiveAlert = async (req, res) => {
  try {
    const alertData = req.body;

    console.log("🚨 ALERT RECEIVED:", alertData);

    // Save alert
    const alert = await Alert.create({
      type: alertData.type,
      gateId: alertData.gateId,
      current: alertData.current,
      allowed: alertData.allowed,
      timestamp: new Date()
    });

    // Trigger actions
    triggerAlertActions(alert);

    res.json({ success: true });

  } catch (err) {
    console.error("❌ Alert error:", err.message);
    res.status(500).json({ success: false });
  }
};
