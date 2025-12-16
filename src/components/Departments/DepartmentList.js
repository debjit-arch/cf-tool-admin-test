import React, { useState, useEffect } from "react";
import API from "../../api/api";
import DepartmentForm from "./DepartmentForm";

export default function DepartmentsList() {
  const [departments, setDepartments] = useState([]);
  const [editingDept, setEditingDept] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // <-- loading state
  const [searchTerm, setSearchTerm] = useState("");
  const user = JSON.parse(sessionStorage.getItem("user"))
  // Fetch all departments
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/users/departments");
      setDepartments(Array.isArray(data) ? data.filter((dept) => dept.organization === user.organization) : []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      setError(err.response?.data?.error || "Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const deleteDepartment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;

    try {
      await API.delete(`/users/departments/${id}`);
      setDepartments(departments.filter((d) => d._id !== id));
      if (editingDept && editingDept._id === id) setEditingDept(null);
      alert("Department deleted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to delete department");
    }
  };

  const handleEdit = (dept) => setEditingDept(dept);
  const handleSuccess = () => {
    fetchDepartments();
    setEditingDept(null);
  };

  // Filter departments based on search
  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ---------------- Loading Spinner ----------------
  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading departments...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Departments</h2>

      {error && <p style={styles.errorText}>{error}</p>}

      {/* Search input */}
      <input
        type="text"
        placeholder="Search departments..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
      />

      {/* Form */}
      <div style={styles.card}>
        <DepartmentForm deptToEdit={editingDept} onSuccess={handleSuccess} />
      </div>

      {/* Department Table */}
      <div style={{ overflowX: "auto", marginTop: "20px" }}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadTr}>
              <th style={styles.th}>Name</th>
              <th
                style={{
                  ...styles.th,
                  textAlign: "right",
                  paddingRight: "50px",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredDepartments.length === 0 ? (
              <tr>
                <td colSpan="2" style={styles.noData}>
                  No departments found.
                </td>
              </tr>
            ) : (
              filteredDepartments.map((dept, index) => (
                <tr
                  key={dept._id}
                  style={{
                    ...styles.tr,
                    backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e6f7ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      index % 2 === 0 ? "#fff" : "#f9f9f9")
                  }
                >
                  <td style={styles.td}>{dept.name}</td>
                  <td
                    style={{
                      ...styles.td,
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      style={styles.editBtn}
                      onClick={() => handleEdit(dept)}
                    >
                      Edit
                    </button>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => deleteDepartment(dept._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------- Styles ----------------
const styles = {
  container: {
    padding: "20px",
    maxWidth: "700px",
    margin: "auto",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "1.8rem",
    fontWeight: "600",
    color: "#111827",
  },
  errorText: { color: "#b91c1c", textAlign: "center", marginBottom: "10px" },
  searchInput: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "15px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  card: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  theadTr: { backgroundColor: "#2563eb", color: "#fff", textAlign: "left" },
  th: { padding: "12px 10px", borderBottom: "1px solid #e5e7eb" },
  tr: { transition: "background-color 0.3s" },
  td: { padding: "12px 10px", borderBottom: "1px solid #e5e7eb" },
  noData: { textAlign: "center", padding: "15px", color: "#6b7280" },
  editBtn: {
    marginRight: "10px",
    padding: "6px 14px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  deleteBtn: {
    padding: "6px 14px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f9fafb",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "6px solid #ddd",
    borderTop: "6px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: { marginTop: "15px", color: "#374151", fontWeight: "500" },
};

// Add spinner keyframes globally
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }",
  styleSheet.cssRules.length
);
