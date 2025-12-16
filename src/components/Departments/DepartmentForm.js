import React, { useState, useEffect } from "react";
import API from "../../api/api";

export default function DepartmentForm({ deptToEdit = null, onSuccess }) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(deptToEdit ? deptToEdit.name || "" : "");
  }, [deptToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Department name is required!");

    try {
      if (deptToEdit) {
        await API.put(`/users/departments/${deptToEdit._id}`, { name });
        alert("Department updated successfully!");
      } else {
        await API.post("/users/departments", { name });
        alert("Department created successfully!");
      }
      setName("");
      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to save department");
    }
  };

  const handleCancel = () => {
    setName("");
    onSuccess && onSuccess();
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.heading}>
        {deptToEdit ? "Update Department" : "Add Department"}
      </h3>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Department Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter department name"
            style={styles.input}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.primaryBtn}>
            {deptToEdit ? "Update" : "Add"}
          </button>
          {deptToEdit && (
            <button type="button" style={styles.secondaryBtn} onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ---------------- Styles ----------------
const styles = {
  card: {
    maxWidth: "380px",       // smaller width
    margin: "30px auto",     // slightly less vertical margin
    backgroundColor: "#fff",
    padding: "20px",         // smaller padding
    borderRadius: "10px",    // slightly smaller radius
    boxShadow: "0 3px 15px rgba(0,0,0,0.05)", 
    transition: "all 0.3s ease",
  },
  heading: {
    textAlign: "center",
    color: "#111827",
    marginBottom: "20px",    // reduced spacing
    fontWeight: 600,
    fontSize: "1.2rem",      // smaller font
  },
  formGroup: {
    marginBottom: "15px",    // reduced spacing
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "6px",
    fontWeight: 500,
    color: "#374151",
    fontSize: "0.9rem",      // slightly smaller
  },
  input: {
    padding: "8px 12px",     // smaller input
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "0.9rem",
    outline: "none",
    transition: "0.3s",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",             // smaller gap
    justifyContent: "center",
    marginTop: "8px",
  },
  primaryBtn: {
    flex: 1,
    padding: "8px 0",        // smaller height
    borderRadius: "999px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: 500,
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "background 0.2s, transform 0.2s",
  },
  secondaryBtn: {
    flex: 1,
    padding: "8px 0",
    borderRadius: "999px",
    border: "1px solid #9ca3af",
    backgroundColor: "#f9fafb",
    color: "#374151",
    fontWeight: 500,
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "background 0.2s, transform 0.2s",
  },
};
