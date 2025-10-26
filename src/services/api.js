import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper function to generate unique IDs
const generateId = () => Date.now().toString();

export const studentAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students?studentId=${id}`).then(res => res.data[0]),
  create: (data) => api.post('/students', { ...data, id: generateId() }),
  update: (id, data) => {
    // Find by studentId first
    return api.get(`/students?studentId=${id}`)
      .then(res => {
        if (res.data.length > 0) {
          const dbId = res.data[0].id;
          return api.put(`/students/${dbId}`, data);
        }
        throw new Error('Student not found');
      });
  },
  delete: (id) => {
    // Find by studentId first, then delete by db id
    return api.get(`/students?studentId=${id}`)
      .then(res => {
        if (res.data.length > 0) {
          const dbId = res.data[0].id;
          return api.delete(`/students/${dbId}`);
        }
        throw new Error('Student not found');
      });
  }
};

export const courseAPI = {
  getAll: () => api.get('/courses'),
  create: (data) => api.post('/courses', { ...data, id: generateId() }),
  delete: (id) => {
    return api.get(`/courses?courseId=${id}`)
      .then(res => {
        if (res.data.length > 0) {
          const dbId = res.data[0].id;
          return api.delete(`/courses/${dbId}`);
        }
        throw new Error('Course not found');
      });
  }
};

export const teacherAPI = {
  getAll: () => api.get('/teachers'),
  create: (data) => api.post('/teachers', { ...data, id: generateId() })
};

export const enrollmentAPI = {
  getAll: () => api.get('/enrollments'),
  getByStudent: (studentId) => api.get(`/enrollments?studentId=${studentId}`),
  create: (data) => api.post('/enrollments', { ...data, id: generateId() })
};

export const examAPI = {
  getAll: () => api.get('/exams'),
  create: (data) => api.post('/exams', { ...data, id: generateId() })
};

export const resultAPI = {
  getAll: () => api.get('/results'),
  getByStudent: (studentId) => api.get(`/results?studentId=${studentId}`),
  create: (data) => api.post('/results', { ...data, id: generateId() })
};

export const attendanceAPI = {
  getAll: () => api.get('/attendance'),
  getByStudent: (studentId) => api.get(`/attendance?studentId=${studentId}`),
  create: (data) => api.post('/attendance', { ...data, id: generateId() })
};

export const achievementAPI = {
  getAll: () => api.get('/achievements'),
  getByStudent: (studentId) => api.get(`/achievements?studentId=${studentId}`),
  create: (data) => api.post('/achievements', { ...data, id: generateId() })
};

export default api;