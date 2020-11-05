import CourseApi from "./CourseApi.js";

// Storing session tokens in local storage is not considered good practice.
// Anything stored in local storage is accessible by scripts.
// A better choice would be to store the session token in the app storage.
// Even better would be not implement my own auth and use something like passport!
export async function isAuthenticated() {
  const sessionToken = localStorage.getItem("sessionToken");
  try {
    const res = await CourseApi.post("/authenticate", { sessionToken });
    const { userId } = res.data;
    localStorage.setItem("userId", userId);
    return true;
  } catch (e) {
    return false;
  }
}

// Better name would be something like registerOrLogin. This function
// attempts to register a new user. If the user exists, it tries to log
// that user in.
export async function login(username, password) {
  try {
    const res = await CourseApi.post("/register", { username, password });

    const { sessionToken } = res.data;
    localStorage.setItem("sessionToken", sessionToken);
  } catch (e) {
    // Now try to login
    const loginRes = await CourseApi.post("/login", { username, password });
    const { sessionToken } = loginRes.data;
    localStorage.setItem("sessionToken", sessionToken);
  }
}

export function getUser() {
  return parseInt(localStorage.getItem("userId"));
}

export function logout() {
  localStorage.clear();
}
