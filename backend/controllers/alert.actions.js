export const triggerAlertActions = (alert) => {

  switch (alert.type) {

    case "TAILGATING":
      console.log("Action: Tailgating detected at", alert.gateId);
      break;

    case "UNAUTHORIZED":
      console.log("Action: Unauthorized entry at", alert.gateId);
      break;

    default:
      console.log("Unknown alert type");
  }
};
