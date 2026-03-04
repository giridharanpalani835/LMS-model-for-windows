// services/api.js
import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || '/api';

// FIX: interceptor ensures token is attached to every request,
// even if a component fires an API call before AuthContext finishes restoring.
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
}, (err) => Promise.reject(err));

export const authAPI = {
  login:    (d) => axios.post(BASE + '/auth/login', d),
  register: (d) => axios.post(BASE + '/auth/register', d),
  me:       ()  => axios.get(BASE + '/auth/me'),
};

export const studentAPI = {
  getAssignments: () => axios.get(BASE + '/student/assignments'),
  submit:         (d) => axios.post(BASE + '/student/submit', d),
  getGrades:      () => axios.get(BASE + '/student/grades'),
  getDashboard:   () => axios.get(BASE + '/student/dashboard'),
};

export const teacherAPI = {
  createAssignment:  (d)      => axios.post(BASE + '/teacher/assignments', d),
  getAssignments:    ()       => axios.get(BASE + '/teacher/assignments'),
  publishAssignment: (id)     => axios.put(BASE + '/teacher/assignments/' + id + '/publish'),
  deleteAssignment:  (id)     => axios.delete(BASE + '/teacher/assignments/' + id),
  addQuestion:       (d)      => axios.post(BASE + '/teacher/questions', d),
  editQuestion:      (id, d)  => axios.put(BASE + '/teacher/questions/' + id, d),
  deleteQuestion:    (id)     => axios.delete(BASE + '/teacher/questions/' + id),
  getStudents:       ()       => axios.get(BASE + '/teacher/students'),
  getPerformance:    ()       => axios.get(BASE + '/teacher/performance'),
  exportResults:     ()       => axios.get(BASE + '/teacher/export'),
};

export const adminAPI = {
  getUsers:    ()        => axios.get(BASE + '/admin/users'),
  changeRole:  (id, r)   => axios.put(BASE + '/admin/users/' + id + '/role', { role: r }),
  deleteUser:  (id)      => axios.delete(BASE + '/admin/users/' + id),
  toggleUser:  (id)      => axios.put(BASE + '/admin/users/' + id + '/toggle'),
  getOverview: ()        => axios.get(BASE + '/admin/overview'),
};

export const leaderboardAPI = {
  get:       (limit = 20) => axios.get(BASE + '/leaderboard?limit=' + limit),
  getMyRank: ()           => axios.get(BASE + '/leaderboard/me'),
};
