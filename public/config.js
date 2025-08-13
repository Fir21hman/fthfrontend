const API_BASE_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:5000"
  : "https://formasphere-backend.onrender.com";

export default API_BASE_URL;
