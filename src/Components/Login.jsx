import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosInstance from "../utils/axiosConfig";
import { API_ENDPOINTS } from "../config/api";
import { showSuccessToast, showErrorToast, showLoading, closeLoading } from "../utils/toast";
import Logo from "../assets/homelogo.png";
import "./Login.css";

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    showLoading('Logging in...');

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, credentials);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        closeLoading();
        showSuccessToast('تم تسجيل الدخول بنجاح');

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        closeLoading();
        showErrorToast('Login failed. Invalid response received.');
      }
    } catch (err) {
      closeLoading();
      console.error('Login error:', err);

      let errorMessage = 'Failed to login. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }

      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background"></div>

      <Container className="vh-100 d-flex align-items-center justify-content-center position-relative">
        <Row className="w-100">
          <Col md={6} className="mx-auto">
            <Card className="login-card">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <img src={Logo} alt="Logo" className="login-logo mb-3" />
                  <h2 className="login-title">لوحة التحكم</h2>
                  <p className="text-muted">قم بتسجيل الدخول للوصول إلى لوحة التحكم</p>
                </div>
                <Form onSubmit={handleLogin} className="login-form">
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">الاسم المستخدم</Form.Label>
                    <Form.Control
                      type="text"
                      id="username"
                      name="username"
                      value={credentials.username}
                      onChange={handleInputChange}
                      required
                      className="login-input"
                      placeholder="أدخل الاسم المستخدم"
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">كلمة المرور</Form.Label>
                    <Form.Control
                      type="password"
                      id="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleInputChange}
                      required
                      className="login-input"
                      placeholder="أدخل كلمة المرور"
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 login-button"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        <span>جاري تسجيل الدخول...</span>
                      </>
                    ) : (
                      "تسجيل الدخول"
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
