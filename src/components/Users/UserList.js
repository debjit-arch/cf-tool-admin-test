import React, { Component } from "react";
import API from "../../api/api";
import { Link } from "react-router-dom";

class UserList extends Component {
  state = {
    users: [],
    departments: [],
    loading: true,
    error: "",
    success: "",
    searchTerm: "",
    editMode: false,
    updatingUserId: null, // to show spinner on individual row
  };

  componentDidMount() {
    this.fetchUsers();
    this.fetchDepartments();
  }

  fetchUsers = async () => {
    try {
      const { data } = await API.get("/users");
      const users = data.map((u) => ({
        ...u,
        departmentName: u.departmentName || "-",
      }));
      this.setState({ users, loading: false, error: "", success: "" });
    } catch (err) {
      this.setState({
        error: err.response?.data?.error || "Failed to fetch users",
        loading: false,
      });
    }
  };

  fetchDepartments = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const res = await API.get("/users/departments");
      const data = res.data;
      this.setState({
        departments: Array.isArray(data)
          ? data.filter((dept) => dept.organization === user.organization)
          : [],
      });
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/users/${id}`);
      this.setState({ success: "User deleted successfully!" });
      this.fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  handleSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value });
  };

  handleEditToggle = () => {
    this.setState((prev) => ({
      editMode: !prev.editMode,
      success: "",
    }));
  };

  handleRoleChange = (id, newRole) => {
    this.setState((prev) => ({
      users: prev.users.map((u) =>
        u._id === id ? { ...u, role: newRole } : u
      ),
    }));
  };

  handleDeptChange = (id, newDeptId) => {
    this.setState((prev) => ({
      users: prev.users.map((u) => {
        const dept = prev.departments.find((d) => d._id === newDeptId);
        return u._id === id
          ? { ...u, department: dept, departmentName: dept?.name || "-" }
          : u;
      }),
    }));
  };

  handleSave = async (user) => {
    this.setState({ updatingUserId: user._id });
    try {
      const payload = {
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId:
          user.role !== "super_admin" ? user.department?._id || null : null,
        isAuditor: user.isAuditor || false, // <-- new field
      };
      await API.put(`/users/${user._id}`, payload);
      this.setState({ success: `${user.name} updated successfully!` });
      this.fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    } finally {
      this.setState({ updatingUserId: null });
    }
  };

  handleAuditorToggle = (id, checked) => {
    this.setState((prev) => ({
      users: prev.users.map((u) =>
        u._id === id ? { ...u, isAuditor: checked } : u
      ),
    }));
  };

  render() {
    const {
      users,
      departments,
      loading,
      error,
      success,
      searchTerm,
      editMode,
      updatingUserId,
    } = this.state;

    const roles = ["root", "risk_owner", "risk_manager", "risk_identifier"];

    const filteredUsers = users.filter((u) =>
      [u.name, u.email, u.role, u.departmentName]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    if (loading)
      return (
        <div style={styles.loaderContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading users...</p>
        </div>
      );

    if (error)
      return (
        <p style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
          {error}
        </p>
      );

    return (
      <div style={styles.container}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Users</h2>

        {success && <div style={styles.successBox}>{success}</div>}

        {/* Add and Edit Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link style={styles.addBtn} to="/users/create">
            Add User
          </Link>

          <button onClick={this.handleEditToggle} style={styles.editMainBtn}>
            {editMode ? "Cancel Edit" : "Edit User"}
          </button>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={this.handleSearchChange}
          style={styles.searchInput}
        />

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={{ backgroundColor: "#d9edf7", textAlign: "left" }}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Auditor</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "12px" }}
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => (
                  <tr
                    key={u._id}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#fff" : "#f3f3f3",
                      transition: "background-color 0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e6f7ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        index % 2 === 0 ? "#fff" : "#f3f3f3")
                    }
                  >
                    <td style={styles.td}>{u.name}</td>
                    <td style={styles.td}>{u.email}</td>

                    {/* Role */}
                    <td style={styles.td}>
                      {editMode ? (
                        <select
                          value={u.role}
                          onChange={(e) =>
                            this.handleRoleChange(u._id, e.target.value)
                          }
                          style={styles.dropdown}
                        >
                          {roles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      ) : (
                        u.role
                      )}
                    </td>

                    {/* Department */}
                    <td style={styles.td}>
                      {editMode && u.role !== "super_admin" ? (
                        <select
                          value={u.department?._id || ""}
                          onChange={(e) =>
                            this.handleDeptChange(u._id, e.target.value)
                          }
                          style={styles.dropdown}
                        >
                          <option value="">Select Department</option>
                          {departments.map((d) => (
                            <option key={d._id} value={d._id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        u.departmentName
                      )}
                    </td>
                    <td style={styles.td}>
                      {editMode ? (
                        <input
                          type="checkbox"
                          checked={u.isAuditor || false}
                          onChange={(e) =>
                            this.handleAuditorToggle(u._id, e.target.checked)
                          }
                        />
                      ) : u.isAuditor ? (
                        "Yes"
                      ) : (
                        "No"
                      )}
                    </td>

                    <td style={styles.td}>
                      {editMode ? (
                        <button
                          onClick={() => this.handleSave(u)}
                          style={styles.saveBtn}
                          disabled={updatingUserId === u._id}
                        >
                          {updatingUserId === u._id ? "Saving..." : "Save"}
                        </button>
                      ) : (
                        <button
                          onClick={() => this.handleDelete(u._id)}
                          style={styles.deleteBtn}
                        >
                          Delete
                        </button>
                      )}
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
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "900px",
    margin: "auto",
    fontFamily: "Arial, sans-serif",
  },
  successBox: {
    backgroundColor: "#dff0d8",
    color: "#3c763d",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  addBtn: {
    display: "inline-block",
    padding: "8px 16px",
    backgroundColor: "#5cb85c",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "4px",
  },
  editMainBtn: {
    padding: "8px 16px",
    backgroundColor: "#0275d8",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  searchInput: {
    width: "100%",
    padding: "8px 12px",
    marginTop: "15px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: { padding: "10px", border: "1px solid #ccc" },
  td: { padding: "10px", border: "1px solid #ccc" },
  deleteBtn: {
    padding: "5px 12px",
    backgroundColor: "#d9534f",
    color: "#fff",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
  },
  saveBtn: {
    padding: "5px 12px",
    backgroundColor: "#5bc0de",
    color: "#fff",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
  },
  dropdown: {
    width: "100%",
    padding: "6px 8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
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

// Spinner keyframes
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }",
  styleSheet.cssRules.length
);

export default UserList;
