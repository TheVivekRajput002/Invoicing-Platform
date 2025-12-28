import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

const StaffAttendance = () => {
  // Current logged-in staff (in real app, get from auth)
  const currentStaff = {
    id: '1',
    name: 'Rahul Kumar',
    phone: '9876543210',
    monthly_salary: 25000,
    salary_day: 5
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState({
    status: 'present',
    check_in_time: '',
    check_out_time: ''
  });

  useEffect(() => {
    loadAttendance();
  }, [currentDate]);

  const loadAttendance = async () => {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await supabase
    //   .from('attendance')
    //   .select('*')
    //   .eq('staff_id', currentStaff.id)
    //   .gte('date', startOfMonth)
    //   .lte('date', endOfMonth);

    // Demo data
    setAttendance({
      '2024-12-01': { status: 'present', check_in_time: '09:00', check_out_time: '18:00' },
      '2024-12-02': { status: 'present', check_in_time: '09:15', check_out_time: '18:00' },
      '2024-12-03': { status: 'half_day', check_in_time: '09:00', check_out_time: '13:00' },
      '2024-12-04': { status: 'absent' },
      '2024-12-05': { status: 'present', check_in_time: '09:00', check_out_time: '18:00' },
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const getDateKey = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-500 hover:bg-green-600';
      case 'half_day':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'absent':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-200 hover:bg-gray-300';
    }
  };

  const handleDateClick = (day) => {
    const dateKey = getDateKey(day);
    const clickedDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (clickedDate > today) {
      alert('Cannot mark attendance for future dates');
      return;
    }

    setSelectedDate(dateKey);
    const existingAttendance = attendance[dateKey];
    if (existingAttendance) {
      setTodayAttendance(existingAttendance);
    } else {
      setTodayAttendance({ status: 'present', check_in_time: '', check_out_time: '' });
    }
    setShowMarkModal(true);
  };

  const handleMarkAttendance = async () => {
    if (!selectedDate) return;

    // TODO: Replace with actual Supabase insert/update
    // const { data, error } = await supabase
    //   .from('attendance')
    //   .upsert({
    //     staff_id: currentStaff.id,
    //     date: selectedDate,
    //     status: todayAttendance.status,
    //     check_in_time: todayAttendance.check_in_time || null,
    //     check_out_time: todayAttendance.check_out_time || null
    //   });

    setAttendance({
      ...attendance,
      [selectedDate]: { ...todayAttendance }
    });

    setShowMarkModal(false);
    setSelectedDate(null);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate attendance summary
  const presentDays = Object.values(attendance).filter(a => a.status === 'present').length;
  const halfDays = Object.values(attendance).filter(a => a.status === 'half_day').length;
  const absentDays = Object.values(attendance).filter(a => a.status === 'absent').length;
  const totalWorked = presentDays + (halfDays * 0.5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {currentStaff.name}!</h1>
              <p className="text-gray-600 mt-1">Track your attendance and manage your work schedule</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Monthly Salary</p>
              <p className="text-2xl font-bold text-green-600">₹{currentStaff.monthly_salary.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Present Days</p>
                <p className="text-2xl font-bold text-gray-900">{presentDays}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-500 rounded"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Half Days</p>
                <p className="text-2xl font-bold text-gray-900">{halfDays}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Absent Days</p>
                <p className="text-2xl font-bold text-gray-900">{absentDays}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-500" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Worked</p>
                <p className="text-2xl font-bold text-gray-900">{totalWorked}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dateKey = getDateKey(day);
              const attendanceData = attendance[dateKey];
              const isToday = new Date().getDate() === day && 
                             new Date().getMonth() === month && 
                             new Date().getFullYear() === year;

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-white font-semibold transition-all transform hover:scale-105 ${
                    attendanceData ? getStatusColor(attendanceData.status) : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                  } ${isToday ? 'ring-4 ring-blue-400' : ''}`}
                >
                  <span className="text-lg">{day}</span>
                  {attendanceData && (
                    <span className="text-xs mt-1">
                      {attendanceData.status === 'present' ? '✓' : 
                       attendanceData.status === 'half_day' ? '½' : '✗'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-600">Half Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <span className="text-sm text-gray-600">Not Marked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
              <p className="text-gray-600 mt-1">Date: {selectedDate}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Attendance Status *</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTodayAttendance({ ...todayAttendance, status: 'present' })}
                    className={`py-3 rounded-lg font-medium transition ${
                      todayAttendance.status === 'present'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => setTodayAttendance({ ...todayAttendance, status: 'half_day' })}
                    className={`py-3 rounded-lg font-medium transition ${
                      todayAttendance.status === 'half_day'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Half Day
                  </button>
                  <button
                    onClick={() => setTodayAttendance({ ...todayAttendance, status: 'absent' })}
                    className={`py-3 rounded-lg font-medium transition ${
                      todayAttendance.status === 'absent'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>

              {todayAttendance.status !== 'absent' && (
                <>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      <Clock size={16} className="inline mr-1" />
                      Check-in Time
                    </label>
                    <input
                      type="time"
                      value={todayAttendance.check_in_time}
                      onChange={(e) => setTodayAttendance({ ...todayAttendance, check_in_time: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      <Clock size={16} className="inline mr-1" />
                      Check-out Time
                    </label>
                    <input
                      type="time"
                      value={todayAttendance.check_out_time}
                      onChange={(e) => setTodayAttendance({ ...todayAttendance, check_out_time: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowMarkModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAttendance}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Save Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAttendance;