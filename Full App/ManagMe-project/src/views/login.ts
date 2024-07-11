import { jwtDecode } from "jwt-decode";

interface LoginResponse {
  token: string;
  refreshToken: string;
  message?: string;
}

async function handleLogin(event: Event): Promise<void> {
  event.preventDefault();

  const login = (document.getElementById("login") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;

  const response = await fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login, password }),
  });

  const data: LoginResponse = await response.json();

  const { token, refreshToken } = data;

  if (response.ok) {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    alert("Zalogowano pomyślnie!");
    window.location.href = "/projectManager";
  } else {
    alert("Błąd logowania: " + data.message);
  }
}

function checkForJwtOnLoad() {
  const token = localStorage.getItem("token");
  if (token) {
    window.location.href = "/projectManager";
  }
}

async function displayLoggedInUser() {
  await fetch("http://localhost:5000/api/userinfo", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Unauthorized") {
        alert("You are not authorized to view this page. Please log in.");
        window.location.href = "/";
      }
      console.log("User data:", data);
      const userNameSpan = document.getElementById("user-name");
      if (userNameSpan) {
        userNameSpan.textContent = data.user.name;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  window.location.href = "/";
}

const isTokenExpired = (token: string) => {
  if (!token) return true;
  try {
    const decodedToken = jwtDecode(token);
    console.log("Decoded token:", decodedToken);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp !== undefined && decodedToken.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    console.log("No refresh token available.");
    return null;
  }

  try {
    const response = await fetch("http://localhost:5000/api/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.error("Failed to refresh access token.");
      return null;
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);

    return data.token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
}

export async function makeApiCall() {
  let token = localStorage.getItem("token");

  if (token && isTokenExpired(token)) {
    console.log("Token expired. Refreshing...");
    token = await refreshAccessToken();
    console.log("New token:", token);
    if (!token) {
      console.error("Failed to refresh token. Redirecting to login.");
      window.location.href = "/";
      return;
    } else {
      displayLoggedInUser();
    }
  } else {
    displayLoggedInUser();
  }
}

document.getElementById("login-form")?.addEventListener("submit", handleLogin);

document.addEventListener("DOMContentLoaded", checkForJwtOnLoad);
