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

  // ===== REGION LOGIC =====
  if (user.region) {
    // already known
    config.headers["x-region"] = user.region;
    return config;
  }

  // detect via browser
  if (navigator.geolocation) {
    await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          let region = "US"; // default
          if (
            latitude >= 8 &&
            latitude <= 37 &&
            longitude >= 68 &&
            longitude <= 97
          )
            region = "INDIA";
          else if (
            latitude >= 35 &&
            latitude <= 70 &&
            longitude >= -10 &&
            longitude <= 40
          )
            region = "EU";

          // save once
          user.region = region;
          sessionStorage.setItem("user", JSON.stringify(user));

          config.headers["x-region"] = region;
          resolve();
        },
        () => {
          config.headers["x-region"] = "US";
          resolve();
        }
      );
    });
  } else {
    config.headers["x-region"] = "US";
  }

  return config;
});

export default API;
