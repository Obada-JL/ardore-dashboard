import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Spinner, Navbar, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Logo from "../assets/homelogo.png";
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("https://api.lineduc.com/api/users/login", {
        username,
        password
      });

      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Check user role
      if (user.role !== "admin") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "ليس لديك صلاحية الوصول إلى لوحة التحكم"
        });
        return;
      }

      // Show success message
      Swal.fire({
        icon: "success",
        title: "مرحباً بك",
        text: "تم تسجيل الدخول بنجاح",
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        // Redirect to dashboard
        window.location.href = "/"
      });
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with an error status
        if (error.response.status === 401) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "اسم المستخدم أو كلمة المرور غير صحيحة"
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: error.response.data?.message || "حدث خطأ أثناء تسجيل الدخول"
          });
        }
      } else if (error.request) {
        // Request was made but no response received (network error)
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت."
        });
      } else {
        // Something else caused the error
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
        });
      }
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
                <Form onSubmit={handleSubmit} className="login-form">
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">اسم المستخدم</Form.Label>
                    <Form.Control
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="login-input"
                      placeholder="أدخل اسم المستخدم"
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">كلمة المرور</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
