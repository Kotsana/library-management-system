import React, { useState } from "react";

function Login({ onGuestLogin, onAdminLogin }) {
  const [screen, setScreen] = useState("roles");
  const [guestName, setGuestName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function submitGuest(event) {
    event.preventDefault();
    const name = guestName.trim();

    if (name.length < 2) {
      setMessage("Please enter a valid name.");
      return;
    }

    onGuestLogin(name);
  }

  function submitAdmin(event) {
    event.preventDefault();

    if (!onAdminLogin(username.trim(), password)) {
      setMessage("Invalid username or password.");
    }
  }

  function backToRoles() {
    setScreen("roles");
    setMessage("");
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Community Library</h1>
          <p>Library Management System</p>
        </div>

        {screen === "roles" && (
          <div className="role-selection">
            <h2>Welcome</h2>
            <p>Select how you would like to continue</p>

            <button className="role-btn guest-btn" onClick={() => setScreen("guest")}>
              Continue as Guest
            </button>

            <button className="role-btn admin-btn" onClick={() => setScreen("admin")}>
              Admin Login
            </button>
          </div>
        )}

        {screen === "guest" && (
          <div className="login-form-container">
            <h2>Guest Access</h2>
            <p>Enter your name to continue</p>

            <form onSubmit={submitGuest}>
              <div className="form-group">
                <label htmlFor="guestName">Your Name</label>
                <input
                  type="text"
                  id="guestName"
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  required
                />
              </div>

              <button type="submit" className="primary-btn">Continue</button>
            </form>

            <button className="back-btn" onClick={backToRoles}>Back</button>
          </div>
        )}

        {screen === "admin" && (
          <div className="login-form-container">
            <h2>Admin Login</h2>
            <p>Enter your administrator credentials</p>

            <form onSubmit={submitAdmin}>
              <div className="form-group">
                <label htmlFor="adminUsername">Username</label>
                <input
                  type="text"
                  id="adminUsername"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="adminPassword">Password</label>
                <input
                  type="password"
                  id="adminPassword"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <button type="submit" className="primary-btn">Login</button>
            </form>

            <button className="back-btn" onClick={backToRoles}>Back</button>
            <p className="demo-info">Demo: admin / admin123</p>
          </div>
        )}

        {message && <div id="loginMessage" className="show">{message}</div>}
      </div>
    </div>
  );
}

export default Login;