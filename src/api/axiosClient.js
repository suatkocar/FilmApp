import axios from "axios";

// Initialise the default response format in local storage
if (!localStorage.getItem("selectedFormat")) {
  localStorage.setItem("selectedFormat", "json");
}
// Create an Axios client instance with a predefined configuration
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_HOSTINGER_VPS,
});

// Add a request interceptor to modify the request headers based on the selected format
axiosClient.interceptors.request.use((config) => {
  const format = localStorage.getItem("selectedFormat") || "json";
  console.log(`Request made with format: ${format}`); // Log the format of the request

  // Set the 'Accept' and 'Content-Type' headers according to the selected format
  switch (format) {
    case "json":
      config.headers["Accept"] = "application/json";
      config.headers["Content-Type"] = "application/json; charset=UTF-8";
      break;
    case "xml":
      config.headers["Accept"] = "application/xml";
      config.headers["Content-Type"] = "application/xml; charset=UTF-8";
      break;
    case "text":
      config.headers["Accept"] = "text/plain";
      config.headers["Content-Type"] = "text/plain; charset=UTF-8";
      break;
    case "yaml":
      config.headers["Accept"] = "application/x-yaml";
      config.headers["Content-Type"] = "application/x-yaml; charset=UTF-8";
      break;
    default:
      config.headers["Accept"] = "application/json";
      config.headers["Content-Type"] = "application/json; charset=UTF-8";
  }
  return config; // Return the modified config to the Axios pipeline
});

// Export the custom configured Axios client
export default axiosClient;