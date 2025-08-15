import React, { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const { path } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    try {
      await axios.patch(`${path}/api/user/updatepassword`, {
        email,
        password,
      });

      setMessage({ text: "Password updated successfully!", type: "success" });

      setTimeout(() => {
        navigate('/signup'); // Adjust route if using React Router
      }, 3000);
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Failed to reset password",
        type: "error",
      });
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <form onSubmit={handleSubmit}>
        <h3>Reset password</h3>

        <label htmlFor="email">Enter your email:</label>
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "15px" }}
        />

        <label htmlFor="password">Enter your new password:</label>
        <input
          type="password"
          name="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: "15px" }}
        />

        <button type="submit" style={{ padding: "10px 15px" }}>
          Reset Password
        </button>
      </form>

      {message.text && (
        <p
          style={{
            marginTop: "15px",
            padding: "10px",
            borderRadius: "4px",
            backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
            color: message.type === "success" ? "#155724" : "#721c24",
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
};

export default ResetPasswordPage;
