import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Modal, Form, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import axiosInstance from '../utils/axiosConfig';
import { API_ENDPOINTS } from '../config/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [validated, setValidated] = useState(false);
  const [selectedUser, setSelectedUser] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    role: 'user',
    active: true
  });
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_USERS);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Error handling is managed by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle modal show
  const handleShowModal = (user = null, mode = 'add') => {
    setModalMode(mode);
    setPasswordError('');
    setEmailError('');

    if (mode === 'edit' && user) {
      setSelectedUser({
        ...user,
        password: '', // Don't show existing password
        confirmPassword: '' // Reset confirm password
      });
    } else {
      setSelectedUser({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        email: '',
        role: 'user',
        active: true
      });
    }
    setShowModal(true);
    setValidated(false);
  };

  // Validate email format
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // Reset error messages
    setPasswordError('');
    setEmailError('');

    // Custom validation
    let isValid = true;

    // Validate email format
    if (!validateEmail(selectedUser.email)) {
      setEmailError('يرجى إدخال بريد إلكتروني صحيح');
      isValid = false;
    }

    // Validate password match if adding user or changing password
    if (modalMode === 'add' || (modalMode === 'edit' && selectedUser.password)) {
      if (selectedUser.password !== selectedUser.confirmPassword) {
        setPasswordError('كلمات المرور غير متطابقة');
        isValid = false;
      }

      // Check password strength
      if (selectedUser.password.length < 6) {
        setPasswordError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
        isValid = false;
      }
    }

    if (form.checkValidity() === false || !isValid) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    try {
      if (modalMode === 'add') {
        // Remove confirmPassword before sending to API
        const { confirmPassword, ...userData } = selectedUser;

        await axiosInstance.post(API_ENDPOINTS.ADD_USER, userData);
        Swal.fire({
          icon: 'success',
          title: 'تم',
          text: 'تمت إضافة المستخدم بنجاح'
        });
      } else {
        // Remove confirmPassword before sending to API
        const { confirmPassword, ...updateData } = selectedUser;

        if (!updateData.password) {
          delete updateData.password; // Don't send empty password
        }
        await axiosInstance.put(API_ENDPOINTS.UPDATE_USER(selectedUser._id), updateData);
        Swal.fire({
          icon: 'success',
          title: 'تم',
          text: 'تم تحديث بيانات المستخدم بنجاح'
        });
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: error.response?.data?.message || 'حدث خطأ أثناء حفظ بيانات المستخدم'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'لن تتمكن من التراجع عن هذا الإجراء!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذف!',
      cancelButtonText: 'إلغاء'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(API_ENDPOINTS.DELETE_USER(id));
          Swal.fire({
            icon: 'success',
            title: 'تم الحذف!',
            text: 'تم حذف المستخدم بنجاح'
          });
          fetchUsers();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'خطأ',
            text: 'حدث خطأ أثناء حذف المستخدم'
          });
        }
      }
    });
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-center">إدارة المستخدمين</h2>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col className="d-flex justify-content-end">
          <Button variant="primary" onClick={() => handleShowModal()}>
            إضافة مستخدم جديد
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          {loading ? (
            <div className="text-center my-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">جاري التحميل...</span>
              </Spinner>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center my-3">
              <p>لا يوجد مستخدمين حالياً</p>
            </div>
          ) : (
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>اسم المستخدم</th>
                  <th>الاسم الكامل</th>
                  <th>البريد الإلكتروني</th>
                  <th>الدور</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td>{user.username}</td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.role === 'admin' ? 'مدير' : 'مستخدم'}</td>
                    <td>
                      <span className={`badge bg-${user.active ? 'success' : 'danger'}`}>
                        {user.active ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(user, 'edit')}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(user._id)}
                      >
                        حذف
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>

      {/* Add/Edit User Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'add' ? 'إضافة مستخدم جديد' : 'تعديل بيانات المستخدم'}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>اسم المستخدم</Form.Label>
              <Form.Control
                type="text"
                value={selectedUser.username}
                onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                required
              />
              <Form.Control.Feedback type="invalid">
                يرجى إدخال اسم المستخدم
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{modalMode === 'add' ? 'كلمة المرور' : 'كلمة المرور (اتركها فارغة إذا لم ترد تغييرها)'}</Form.Label>
              <Form.Control
                type="password"
                value={selectedUser.password}
                onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                required={modalMode === 'add'}
                isInvalid={passwordError !== ''}
              />
              <Form.Control.Feedback type="invalid">
                {passwordError || 'يرجى إدخال كلمة المرور'}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{modalMode === 'add' ? 'تأكيد كلمة المرور' : 'تأكيد كلمة المرور (اتركها فارغة إذا لم ترد تغييرها)'}</Form.Label>
              <Form.Control
                type="password"
                value={selectedUser.confirmPassword}
                onChange={(e) => setSelectedUser({ ...selectedUser, confirmPassword: e.target.value })}
                required={modalMode === 'add'}
                isInvalid={passwordError !== ''}
              />
              <Form.Control.Feedback type="invalid">
                {passwordError || 'يرجى تأكيد كلمة المرور'}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>الاسم الكامل</Form.Label>
              <Form.Control
                type="text"
                value={selectedUser.fullName}
                onChange={(e) => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                required
              />
              <Form.Control.Feedback type="invalid">
                يرجى إدخال الاسم الكامل
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>البريد الإلكتروني</Form.Label>
              <Form.Control
                type="email"
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                required
                isInvalid={emailError !== ''}
              />
              <Form.Control.Feedback type="invalid">
                {emailError || 'يرجى إدخال بريد إلكتروني صحيح'}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>الدور</Form.Label>
              <Form.Select
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                required
              >
                <option value="user">مستخدم</option>
                <option value="admin">مدير</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="active-switch"
                label="حساب نشط"
                checked={selectedUser.active}
                onChange={(e) => setSelectedUser({ ...selectedUser, active: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              إلغاء
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="ms-2">جاري الحفظ...</span>
                </>
              ) : (
                'حفظ'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
} 