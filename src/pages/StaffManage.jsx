import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar, DollarSign, X, Check, UserPlus, Clock } from 'lucide-react';

const StaffManage = () => {
  const [activeTab, setActiveTab] = useState('staff');
  const [staffList, setStaffList] = useState([]);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showAdvance, setShowAdvance] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Form states
  const [newStaff, setNewStaff] = useState({
    name: '',
    phone: '',
    monthly_salary: '',
    salary_day: '1'
  });

  const [attendanceData, setAttendanceData] = useState({
    status: 'present',
    check_in_time: '',
    check_out_time: ''
  });

  const [advanceData, setAdvanceData] = useState({
    amount: '',
    reason: ''
  });

  // Load staff on mount
  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await supabase.from('staff').select('*');
    // if (data) setStaffList(data);
    
    // Demo data
    setStaffList([
      { id: '1', name: 'Rahul Kumar', phone: '9876543210', monthly_salary: 25000, salary_day: 5 },
      { id: '2', name: 'Priya Sharma', phone: '9876543211', monthly_salary: 30000, salary_day: 10 }
    ]);
  };

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.phone || !newStaff.monthly_salary) {
      alert('Please fill all required fields');
      return;
    }
    
    // TODO: Replace with actual Supabase insert
    // const { data, error } = await supabase.from('staff').insert([{
    //   name: newStaff.name,
    //   phone: newStaff.phone,
    //   monthly_salary: parseFloat(newStaff.monthly_salary),
    //   salary_day: parseInt(newStaff.salary_day)
    // }]);

    const newStaffMember = {
      id: Date.now().toString(),
      ...newStaff,
      monthly_salary: parseFloat(newStaff.monthly_salary),
      salary_day: parseInt(newStaff.salary_day)
    };

    setStaffList([...staffList, newStaffMember]);
    setNewStaff({ name: '', phone: '', monthly_salary: '', salary_day: '1' });
    setShowAddStaff(false);
  };

  const handleMarkAttendance = async () => {
    // TODO: Replace with actual Supabase insert
    // const { data, error } = await supabase.from('attendance').insert([{
    //   staff_id: selectedStaff.id,
    //   date: selectedDate,
    //   status: attendanceData.status,
    //   check_in_time: attendanceData.check_in_time || null,
    //   check_out_time: attendanceData.check_out_time || null
    // }]);

    alert(`Attendance marked for ${selectedStaff.name}: ${attendanceData.status}`);
    setShowAttendance(false);
    setAttendanceData({ status: 'present', check_in_time: '', check_out_time: '' });
  };

  const handleAddAdvance = async () => {
    if (!advanceData.amount || !advanceData.reason) {
      alert('Please fill all required fields');
      return;
    }
    
    const today = new Date();
    
    // TODO: Replace with actual Supabase insert
    // const { data, error } = await supabase.from('salary_advances').insert([{
    //   staff_id: selectedStaff.id,
    //   amount: parseFloat(advanceData.amount),
    //   reason: advanceData.reason,
    //   date: selectedDate,
    //   month: today.getMonth() + 1,
    //   year: today.getFullYear()
    // }]);

    alert(`Advance of ₹${advanceData.amount} recorded for ${selectedStaff.name}`);
    setShowAdvance(false);
    setAdvanceData({ amount: '', reason: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
              <p className="text-gray-600 mt-1">Manage your team, attendance, and salary advances</p>
            </div>
            <button
              onClick={() => setShowAddStaff(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <UserPlus size={20} />
              Add Staff
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'staff'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={20} />
              Staff Members
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'attendance'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar size={20} />
              Mark Attendance
            </button>
            <button
              onClick={() => setActiveTab('advance')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                activeTab === 'advance'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <DollarSign size={20} />
              Salary Advance
            </button>
          </div>

          <div className="p-6">
            {/* Staff List Tab */}
            {activeTab === 'staff' && (
              <div className="space-y-4">
                {staffList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No staff members yet. Add your first staff member!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {staffList.map((staff) => (
                      <div key={staff.id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{staff.name}</h3>
                            <p className="text-gray-600">📞 {staff.phone}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">₹{staff.monthly_salary.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Salary Day: {staff.salary_day}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <label className="text-gray-700 font-medium">Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                  />
                </div>
                
                <div className="grid gap-4">
                  {staffList.map((staff) => (
                    <div key={staff.id} className="border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{staff.name}</h3>
                        <p className="text-gray-600">{staff.phone}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedStaff(staff);
                          setShowAttendance(true);
                        }}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        <Check size={20} />
                        Mark Attendance
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advance Tab */}
            {activeTab === 'advance' && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {staffList.map((staff) => (
                    <div key={staff.id} className="border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{staff.name}</h3>
                        <p className="text-gray-600">Monthly Salary: ₹{staff.monthly_salary.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedStaff(staff);
                          setShowAdvance(true);
                        }}
                        className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
                      >
                        <DollarSign size={20} />
                        Give Advance
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Add New Staff</h2>
              <button onClick={() => setShowAddStaff(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter staff name"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Monthly Salary (₹) *</label>
                <input
                  type="number"
                  value={newStaff.monthly_salary}
                  onChange={(e) => setNewStaff({ ...newStaff, monthly_salary: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter monthly salary"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Salary Day (1-31) *</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newStaff.salary_day}
                  onChange={(e) => setNewStaff({ ...newStaff, salary_day: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddStaff(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStaff}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Add Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark Attendance Modal */}
      {showAttendance && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Mark Attendance</h2>
              <button onClick={() => setShowAttendance(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Staff:</strong> {selectedStaff.name}</p>
              <p className="text-gray-700"><strong>Date:</strong> {selectedDate}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Attendance Status *</label>
                <select
                  value={attendanceData.status}
                  onChange={(e) => setAttendanceData({ ...attendanceData, status: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="present">Present (Full Day)</option>
                  <option value="half_day">Half Day</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              {attendanceData.status !== 'absent' && (
                <>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Check-in Time</label>
                    <input
                      type="time"
                      value={attendanceData.check_in_time}
                      onChange={(e) => setAttendanceData({ ...attendanceData, check_in_time: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Check-out Time</label>
                    <input
                      type="time"
                      value={attendanceData.check_out_time}
                      onChange={(e) => setAttendanceData({ ...attendanceData, check_out_time: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAttendance(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAttendance}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Mark Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Advance Modal */}
      {showAdvance && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Salary Advance</h2>
              <button onClick={() => setShowAdvance(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Staff:</strong> {selectedStaff.name}</p>
              <p className="text-gray-700"><strong>Monthly Salary:</strong> ₹{selectedStaff.monthly_salary.toLocaleString()}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Advance Amount (₹) *</label>
                <input
                  type="number"
                  value={advanceData.amount}
                  onChange={(e) => setAdvanceData({ ...advanceData, amount: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Reason *</label>
                <textarea
                  value={advanceData.reason}
                  onChange={(e) => setAdvanceData({ ...advanceData, reason: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Enter reason for advance"
                />
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ This amount will be automatically deducted from the salary on payment day
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAdvance(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAdvance}
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
                >
                  Give Advance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManage;