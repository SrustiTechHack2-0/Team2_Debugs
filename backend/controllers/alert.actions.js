export const triggerAlertActions = (alert) => {

  switch (alert.type) {

    case "TAILGATING":
      console.log("🚨 ACTION: Tailgating detected at", alert.gateId);
      break;

    case "UNAUTHORIZED":
      console.log("🚨 ACTION: Unauthorized entry at", alert.gateId);
      break;

    default:
      console.log("⚠️ Unknown alert type");
  }
};
