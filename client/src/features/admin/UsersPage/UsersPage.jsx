// src/pages/admin/UsersPage.jsx
import { useState, useEffect, useRef } from 'react';
import Card from '../../../components/Card';
import Modal from '../../../components/Modal';
import useAppStore from '../../../store/useAppStore';
import { exportToCSV } from '../../../services/csvParser';
import gsap from 'gsap';

const UsersPage = () => {
  const { users, fetchUsers, addUser, updateUser, deleteUser } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Animate page on load
  useEffect(() => {
    fetchUsers(); // Load users from backend on mount
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, [fetchUsers]);

  const handleAddUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
      username: formData.get('username'),
      role: formData.get('role'),
      email: formData.get('email'),
      active: formData.get('active') === 'on',
      password: formData.get('password') || undefined, // optional
    };

    setLoading(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        await addUser(userData);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'Error saving user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`Are you sure you want to delete user "${user.username}"?`)) return;
    try {
      await deleteUser(user.id);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'Error deleting user');
    }
  };

  const handleExport = () => {
    exportToCSV(users, 'users_export.csv');
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User & Role Management</h1>
          <p className="text-gray-700 mt-1 font-medium">Manage hospital staff and permissions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition flex items-center gap-2"
          >
            <i className="ri-download-line"></i> Export
          </button>
          <button
            onClick={handleAddUser}
            className="bg-cta-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center gap-2"
          >
            <i className="ri-user-add-line"></i> Add User
          </button>
        </div>
      </div>

      {/* Search */}
      <Card title="Search Users" icon="ri-search-line">
        <input
          type="text"
          placeholder="Search by username, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-teal"
        />
      </Card>

      {/* Users Table */}
      <Card title={`All Users (${filteredUsers.length})`} icon="ri-team-line" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light-teal">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark-text">Username</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark-text">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark-text">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark-text">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-dark-text">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-light-teal transition">
                  <td className="px-6 py-4">{user.username}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4">
                    {user.active ? (
                      <span className="text-cta-green flex items-center gap-1">
                        <i className="ri-checkbox-circle-fill"></i> Active
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1">
                        <i className="ri-close-circle-fill"></i> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-primary-teal hover:bg-light-teal p-2 rounded transition"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              name="username"
              defaultValue={editingUser?.username}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-teal"
            />
          </div>

          {!editingUser && (
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-teal"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              defaultValue={editingUser?.email}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-teal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              name="role"
              defaultValue={editingUser?.role || 'Doctor'}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-teal"
            >
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="visitor">Visitor</option>
              <option value="patient">Patient</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="active"
              defaultChecked={editingUser?.active ?? true}
              className="w-5 h-5"
            />
            <label className="font-medium">Active User</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cta-green text-white py-3 rounded-lg hover:bg-opacity-90 transition font-semibold"
          >
            {editingUser ? 'Update User' : 'Add User'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
