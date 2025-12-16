import axios from "axios";

const API = axios.create({
  baseURL: "https://cftoolbackend.duckdns.org/api",
  withCredentials: true,
});

API.interceptors.request.use(async (config) => {
  // JWT
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Organization
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  if (user.organization) {
    config.headers["x-org"] = user.organization;
  }

  // --- START REGION LOGIC UPDATE ---
  let region = "US"; // Default region is US
  const manualRegion = sessionStorage.getItem("selected_region");

  // 1. Check for manually selected region (set on login form)
  if (manualRegion && manualRegion !== "AUTO") {
    region = manualRegion;
    // Remove the key to ensure subsequent non-login requests use the stored user region
    sessionStorage.removeItem("selected_region");
  }
  // 2. If 'AUTO' is selected (or no manual choice), run geolocation logic
  else if (manualRegion === "AUTO" || !manualRegion) {
    if (navigator.geolocation) {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;

            // Existing Bounding Box Logic
            if (
              latitude >= 8 &&
              latitude <= 37 &&
              longitude >= 68 &&
              longitude <= 97
            ) {
              region = "INDIA";
            } else if (
              latitude >= 35 &&
              latitude <= 70 &&
              longitude >= -10 &&
              longitude <= 40
            ) {
              region = "EU";
            } else {
              region = "US"; // Default fallback for valid coordinates outside INDIA/EU
            }

            // save user region to session (for post-login state)
            user.region = region;
            sessionStorage.setItem("user", JSON.stringify(user));

            resolve();
          },
          () => {
            // Geolocation permission denied or failed
            region = "US"; // Geolocation failover
            resolve();
          }
        );
      });
    } else {
      // Browser does not support geolocation
      region = "US";
    }
  }

  // Set the final region header
  config.headers["x-region"] = region;
  // --- END REGION LOGIC UPDATE ---

  return config;
});

export default API;
