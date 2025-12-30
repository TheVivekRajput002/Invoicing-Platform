import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';


const StaffManagement = () => {

  const getLocalDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Modals
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Add Staff Form
  const [newStaff, setNewStaff] = useState({
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    designation: '',
    monthly_salary: '',
    date_of_joining: getLocalDateString()
  });

  // Advance Form
  const [advanceForm, setAdvanceForm] = useState({
    amount: '',
    reason: '',
    advance_date: getLocalDateString()
  });

  // Staff Analytics
  const [staffAttendance, setStaffAttendance] = useState([]);
  const [staffAdvances, setStaffAdvances] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [monthlyStats, setMonthlyStats] = useState(null);

  useEffect(() => {
    fetchAllStaff();
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      fetchStaffAnalytics(selectedStaff.id);
    }
  }, [selectedStaff, selectedMonth]);

  const fetchAllStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setStaffList(data);
    setLoading(false);
  };

  const fetchStaffAnalytics = async (staffId) => {
    const firstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).toISOString().split('T')[0];

    // Fetch attendance
    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('*')
      .eq('staff_id', staffId)
      .gte('date', firstDay)
      .lte('date', lastDay)
      .order('date', { ascending: true });

    // Fetch advances
    const { data: advancesData } = await supabase
      .from('salary_advances')
      .select('*')
      .eq('staff_id', staffId)
      .gte('advance_date', firstDay)
      .lte('advance_date', lastDay)
      .order('advance_date', { ascending: false });

    setStaffAttendance(attendanceData || []);
    setStaffAdvances(advancesData || []);

    // Calculate stats
    const totalDays = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
    const presentDays = attendanceData?.filter(a => a.status === 'present').length || 0;
    const halfDays = attendanceData?.filter(a => a.status === 'half_day').length || 0;
    const absentDays = attendanceData?.filter(a => a.status === 'absent').length || 0;
    const unmarkedDays = totalDays - presentDays - halfDays - absentDays;

    const staff = staffList.find(s => s.id === staffId);
    if (staff) {
      const perDaySalary = staff.monthly_salary / totalDays;
      const halfDayDeduction = halfDays * (perDaySalary * 0.5);
      const absentDeduction = absentDays * perDaySalary;
      const totalAdvances = advancesData?.reduce((sum, adv) => sum + parseFloat(adv.amount), 0) || 0;
      const netSalary = staff.monthly_salary - halfDayDeduction - absentDeduction - totalAdvances;

      setMonthlyStats({
        totalDays,
        presentDays,
        halfDays,
        absentDays,
        unmarkedDays,
        baseSalary: staff.monthly_salary,
        perDaySalary,
        halfDayDeduction,
        absentDeduction,
        totalAdvances,
        netSalary,
        attendancePercentage: ((presentDays + halfDays * 0.5) / totalDays * 100).toFixed(1)
      });
    }
  };

  const handleAddStaff = async () => {
    if (!newStaff.full_name || !newStaff.email || !newStaff.password || !newStaff.monthly_salary) {
      alert('Please fill all required fields');
      return;
    }

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newStaff.email,
        password: newStaff.password,
        options: {
          data: {
            full_name: newStaff.full_name
          }
        }
      });

      if (authError) throw authError;

      // Insert into staff table
      const { error: staffError } = await supabase
        .from('staff')
        .insert({
          user_id: authData.user.id,
          full_name: newStaff.full_name,
          email: newStaff.email,
          phone_number: newStaff.phone_number,
          designation: newStaff.designation,
          monthly_salary: parseFloat(newStaff.monthly_salary),
          date_of_joining: newStaff.date_of_joining
        });

      if (staffError) throw staffError;

      alert('Staff added successfully!');
      setShowAddStaffModal(false);
      setNewStaff({
        full_name: '',
        email: '',
        password: '',
        phone_number: '',
        designation: '',
        monthly_salary: '',
        date_of_joining: getLocalDateString()
      });
      fetchAllStaff();
    } catch (error) {
      alert('Error adding staff: ' + error.message);
    }
  };

  const handleGiveAdvance = async () => {
    if (!advanceForm.amount || parseFloat(advanceForm.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const { error } = await supabase
      .from('salary_advances')
      .insert({
        staff_id: selectedStaff.id,
        amount: parseFloat(advanceForm.amount),
        advance_date: advanceForm.advance_date,
        reason: advanceForm.reason
      });

    if (!error) {
      alert('Advance added successfully!');
      setShowAdvanceModal(false);
      setAdvanceForm({
        amount: '',
        reason: '',
        advance_date: new Date().toISOString().split('T')[0]
      });
      fetchStaffAnalytics(selectedStaff.id);
    } else {
      alert('Error adding advance: ' + error.message);
    }
  };

  const handleUpdateStaff = async () => {
    const { error } = await supabase
      .from('staff')
      .update({
        full_name: selectedStaff.full_name,
        phone_number: selectedStaff.phone_number,
        designation: selectedStaff.designation,
        monthly_salary: parseFloat(selectedStaff.monthly_salary),
        date_of_joining: selectedStaff.date_of_joining
      })
      .eq('id', selectedStaff.id);

    if (!error) {
      alert('Staff updated successfully!');
      setShowEditModal(false);
      fetchAllStaff();
    } else {
      alert('Error updating staff: ' + error.message);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!confirm('Are you sure you want to delete this staff member? This will also delete all their attendance and advance records.')) {
      return;
    }

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', staffId);

    if (!error) {
      alert('Staff deleted successfully!');
      setSelectedStaff(null);
      fetchAllStaff();
    } else {
      alert('Error deleting staff: ' + error.message);
    }
  };

  const filteredStaff = staffList.filter(staff =>
    staff.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.designation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Staff Management</h1>
              <p className="text-gray-600">Manage your team and track performance</p>
            </div>
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg transition transform hover:scale-105"
            >
              + Add Staff
            </button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!selectedStaff ? (
          /* Staff List View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search staff by name, email, or designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-gray-600 text-sm font-medium">Total Staff</h3>
                <p className="text-4xl font-bold text-purple-600 mt-2">{staffList.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-gray-600 text-sm font-medium">Total Monthly Salary</h3>
                <p className="text-4xl font-bold text-pink-600 mt-2">
                  ₹{staffList.reduce((sum, s) => sum + parseFloat(s.monthly_salary), 0).toFixed(0)}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-gray-600 text-sm font-medium">Active Today</h3>
                <p className="text-4xl font-bold text-green-600 mt-2">{staffList.length}</p>
              </div>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.map((staff) => (
                <motion.div
                  key={staff.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedStaff(staff)}
                  className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {staff.full_name.charAt(0)}
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                      Active
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-1">{staff.full_name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{staff.designation || 'Staff'}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-800 font-medium truncate ml-2">{staff.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salary:</span>
                      <span className="text-gray-800 font-medium">₹{parseFloat(staff.monthly_salary).toFixed(0)}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joined:</span>
                      <span className="text-gray-800 font-medium">
                        {new Date(staff.date_of_joining).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredStaff.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                No staff members found
              </div>
            )}
          </motion.div>
        ) : (
          /* Staff Detail View */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Back Button & Actions */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setSelectedStaff(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              >
                ← Back to Staff List
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Edit Details
                </button>
                <button
                  onClick={() => setShowAdvanceModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  Give Advance
                </button>
                <button
                  onClick={() => handleDeleteStaff(selectedStaff.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Delete Staff
                </button>
              </div>
            </div>

            {/* Staff Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {selectedStaff.full_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-800">{selectedStaff.full_name}</h2>
                  <p className="text-gray-600 text-lg">{selectedStaff.designation || 'Staff Member'}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="text-sm font-medium text-gray-800">{selectedStaff.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Phone</p>
                      <p className="text-sm font-medium text-gray-800">{selectedStaff.phone_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Monthly Salary</p>
                      <p className="text-sm font-medium text-gray-800">₹{parseFloat(selectedStaff.monthly_salary).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Joining Date</p>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(selectedStaff.date_of_joining).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Month Selector */}
            <div className="flex justify-center items-center space-x-4 mb-6">
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
                className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                ← Previous
              </button>
              <span className="text-xl font-semibold text-gray-800">
                {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}
                className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                Next →
              </button>
            </div>

            {monthlyStats && (
              <>
                {/* Attendance Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <p className="text-3xl font-bold text-green-600">{monthlyStats.presentDays}</p>
                    <p className="text-sm text-gray-600 mt-1">Present</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <p className="text-3xl font-bold text-yellow-600">{monthlyStats.halfDays}</p>
                    <p className="text-sm text-gray-600 mt-1">Half Days</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <p className="text-3xl font-bold text-red-600">{monthlyStats.absentDays}</p>
                    <p className="text-sm text-gray-600 mt-1">Absent</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <p className="text-3xl font-bold text-gray-600">{monthlyStats.unmarkedDays}</p>
                    <p className="text-sm text-gray-600 mt-1">Unmarked</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-center text-white">
                    <p className="text-3xl font-bold">{monthlyStats.attendancePercentage}%</p>
                    <p className="text-sm mt-1">Attendance</p>
                  </div>
                </div>

                {/* Salary Breakdown */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Salary Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-gray-600">Base Salary</span>
                      <span className="font-semibold text-gray-800">₹{monthlyStats.baseSalary.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-gray-600">Per Day Salary</span>
                      <span className="font-semibold text-gray-800">₹{monthlyStats.perDaySalary.toFixed(2)}</span>
                    </div>
                    {monthlyStats.halfDayDeduction > 0 && (
                      <div className="flex justify-between items-center text-red-600">
                        <span>Half Day Deduction ({monthlyStats.halfDays} days)</span>
                        <span className="font-semibold">- ₹{monthlyStats.halfDayDeduction.toFixed(2)}</span>
                      </div>
                    )}
                    {monthlyStats.absentDeduction > 0 && (
                      <div className="flex justify-between items-center text-red-600">
                        <span>Absent Deduction ({monthlyStats.absentDays} days)</span>
                        <span className="font-semibold">- ₹{monthlyStats.absentDeduction.toFixed(2)}</span>
                      </div>
                    )}
                    {monthlyStats.totalAdvances > 0 && (
                      <div className="flex justify-between items-center text-red-600">
                        <span>Salary Advances</span>
                        <span className="font-semibold">- ₹{monthlyStats.totalAdvances.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t-2 border-purple-200">
                      <span className="text-xl font-bold text-gray-800">Net Salary</span>
                      <span className="text-2xl font-bold text-purple-600">₹{monthlyStats.netSalary.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Attendance Calendar */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Attendance Calendar</h3>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                {(() => {
                  const year = selectedMonth.getFullYear();
                  const month = selectedMonth.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const days = [];

                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
                  }

                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const attendance = staffAttendance.find(a => a.date === dateStr);

                    days.push(
                      <div
                        key={day}
                        className={`aspect-square flex flex-col items-center justify-center rounded-lg border-2 transition ${attendance?.status === 'present'
                          ? 'bg-green-100 border-green-300'
                          : attendance?.status === 'half_day'
                            ? 'bg-yellow-100 border-yellow-300'
                            : attendance?.status === 'absent'
                              ? 'bg-red-100 border-red-300'
                              : 'bg-white border-gray-200'
                          }`}
                      >
                        <span className="text-sm font-medium text-gray-700">{day}</span>
                        {attendance && (
                          <span className="text-xs mt-1">
                            {attendance.status === 'present' ? '✓' : attendance.status === 'half_day' ? 'H' : 'X'}
                          </span>
                        )}
                      </div>
                    );
                  }
                  return days;
                })()}
              </div>
            </div>

            {/* Advances History */}
            {staffAdvances.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Salary Advances</h3>
                <div className="space-y-3">
                  {staffAdvances.map((advance) => (
                    <div
                      key={advance.id}
                      className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {new Date(advance.advance_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        {advance.reason && (
                          <p className="text-sm text-gray-600">{advance.reason}</p>
                        )}
                      </div>
                      <span className="text-red-600 font-bold text-lg">₹{parseFloat(advance.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddStaffModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddStaffModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Add New Staff</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newStaff.full_name}
                      onChange={(e) => setNewStaff({ ...newStaff, full_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="Min. 6 characters"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newStaff.phone_number}
                      onChange={(e) => setNewStaff({ ...newStaff, phone_number: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={newStaff.designation}
                      onChange={(e) => setNewStaff({ ...newStaff, designation: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="Sales Executive"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Salary *
                    </label>
                    <input
                      type="number"
                      value={newStaff.monthly_salary}
                      onChange={(e) => setNewStaff({ ...newStaff, monthly_salary: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      placeholder="30000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    value={newStaff.date_of_joining}
                    onChange={(e) => setNewStaff({ ...newStaff, date_of_joining: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={handleAddStaff}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition"
                >
                  Add Staff
                </button>
                <button
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Give Advance Modal */}
      <AnimatePresence>
        {showAdvanceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAdvanceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Give Salary Advance</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={advanceForm.amount}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={advanceForm.advance_date}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, advance_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={advanceForm.reason}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    rows="3"
                    placeholder="Medical emergency, personal loan, etc."
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleGiveAdvance}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                >
                  Give Advance
                </button>
                <button
                  onClick={() => setShowAdvanceModal(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Staff Modal */}
      <AnimatePresence>
        {showEditModal && selectedStaff && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Staff Details</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={selectedStaff.full_name}
                      onChange={(e) => setSelectedStaff({ ...selectedStaff, full_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={selectedStaff.phone_number || ''}
                      onChange={(e) => setSelectedStaff({ ...selectedStaff, phone_number: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={selectedStaff.designation || ''}
                      onChange={(e) => setSelectedStaff({ ...selectedStaff, designation: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Salary
                    </label>
                    <input
                      type="number"
                      value={selectedStaff.monthly_salary}
                      onChange={(e) => setSelectedStaff({ ...selectedStaff, monthly_salary: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    value={selectedStaff.date_of_joining}
                    onChange={(e) => setSelectedStaff({ ...selectedStaff, date_of_joining: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleUpdateStaff}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  Update Staff
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffManagement;