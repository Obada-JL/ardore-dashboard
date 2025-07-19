export const BASE_URL = 'https://api.ardoreperfume.com/api';
// export const BASE_URL = 'http://api.ardoreperfume.com/api';
export const API_ENDPOINTS = {
    // Students
    GET_STUDENTS: `${BASE_URL}/api/getStudents`,
    ADD_STUDENT: `${BASE_URL}/api/addStudent`,
    UPDATE_STUDENT: `${BASE_URL}/api/updateStudent`,
    DELETE_STUDENT: `${BASE_URL}/api/deleteStudent`,
    
    // Finished Students
    GET_FINISHED_STUDENTS: `${BASE_URL}/api/getFinishedStudents`,
    ADD_FINISHED_STUDENT: `${BASE_URL}/api/addFinishedStudent`,
    UPDATE_FINISHED_STUDENT: `${BASE_URL}/api/updateFinishedStudent`,
    DELETE_FINISHED_STUDENT: `${BASE_URL}/api/deleteFinishedStudent`,
    
    // Messages
    GET_MESSAGES: `${BASE_URL}/api/getMessages`,
    ADD_MESSAGE: `${BASE_URL}/api/addMessage`,
    UPDATE_MESSAGE: `${BASE_URL}/api/updateMessage`,
    DELETE_MESSAGE: `${BASE_URL}/api/deleteMessage`,
    
    // Images
    STUDENT_IMAGES: `${BASE_URL}/studentsImages`
}; 