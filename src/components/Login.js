import React, { Component } from "react";
import API from "../api/api";
import { setToken } from "../utils/auth";

class Login extends Component {
  // Add 'region' state, defaulted to 'US' for VPN users
  state = { email: "", password: "", region: "US", error: "", loading: false };

  handleChange = (e) => this.setState({ [e.target.name]: e.target.value });

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, error: "" });
    const { email, password, region } = this.state;

    try {
      // 1. SAVE THE SELECTED REGION TO SESSION STORAGE
      // This is crucial: The API Interceptor reads this key before sending the login request.
      sessionStorage.setItem("selected_region", region);

      const { data } = await API.post("/users/login", {
        email: email,
        password: password,
      });

      // Save token for API auth
      setToken(data.token);

      // ✅ Save logged-in user info (and persist the selected region)
      if (data.user) {
        // Ensure the saved user object also reflects the selected region for future session checks
        const user = { ...data.user, region: region };
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      // Redirect
      this.props.history.push("/");
    } catch (err) {
      // Clean up the temporary session item on failure
      sessionStorage.removeItem("selected_region");

      this.setState({
        error: err.response?.data?.error || "Login failed",
        loading: false,
      });
    }
  };

  render() {
    const { email, password, region, error, loading } = this.state;

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Admin Login</h2>
          <p style={styles.subtitle}>Access your dashboard securely</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={this.handleSubmit} style={styles.form}>
            {/* --- NEW REGION SELECTOR --- */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Region for Admin Tool</label>
              <select
                name="region"
                value={region}
                onChange={this.handleChange}
                disabled={loading}
                style={styles.input}
              >
                <option value="US">United States (US)</option>
                <option value="EU">European Union (EU)</option>
                <option value="INDIA">India</option>
                <option value="AUTO">Auto (Geolocation)</option>
              </select>
            </div>
            {/* --------------------------- */}

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={this.handleChange}
                required
                disabled={loading}
                style={styles.input}
                placeholder="you@example.com"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={this.handleChange}
                required
                disabled={loading}
                style={styles.input}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
              }}
            >
              {loading ? (
                <div style={styles.spinnerContainer}>
                  <div style={styles.spinner}></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

const styles = {
  // ... (Your styles remain the same)
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #f6f8fb 0%, #e9edf5 100%)",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    padding: "2rem",
    textAlign: "center",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "0.3rem",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "0.95rem",
    marginBottom: "1.5rem",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "0.75rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  formGroup: {
    textAlign: "left",
  },
  label: {
    display: "block",
    fontSize: "0.9rem",
    color: "#374151",
    marginBottom: "0.3rem",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s",
  },
  button: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "0.8rem",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "0.5rem",
    transition: "background 0.3s, transform 0.1s",
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
    cursor: "not-allowed",
  },
  spinnerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.5rem",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid #fff",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

// Spinner keyframes
const styleSheet = document.styleSheets[0];
const keyframes = `@keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

export default Login;
