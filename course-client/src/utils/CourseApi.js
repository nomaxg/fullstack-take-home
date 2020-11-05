import axios from "axios";

// Export base axios object we can use to make API requests
export default axios.create({
  baseURL: "http://localhost:8080"
})
