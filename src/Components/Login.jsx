import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useLanguage } from '../context/LanguageContext';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosConfig';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { t, currentLanguage, changeLanguage, availableLanguages, isRTL } = useLanguage();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
  };

  const validateForm = () => {
    const { email, password } = formData;

    if (!email || !password) {
      setError(t('required'));
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('invalidEmail'));
      return false;
    }

    if (password.length < 6) {
      setError(t('passwordMinLength'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, {
        email: formData.email,
        password: formData.password
      });

      const { user, token } = response.data;

      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      showSuccessToast(t('loginSuccess'));

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);

      if (error.response?.status === 401) {
        setError(t('invalidCredentials'));
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError(t('error'));
      }

      showErrorToast(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" dir={isRTL ? 'rtl' : 'ltr'}>
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={4}>
            <Card className="login-card shadow-lg">
              <Card.Body className="p-5">
                {/* Language Selector */}
                <div className="d-flex justify-content-end mb-3">
                  {availableLanguages.map((language) => (
                    <Button
                      key={language.code}
                      variant={currentLanguage === language.code ? 'primary' : 'outline-secondary'}
                      size="sm"
                      onClick={() => handleLanguageChange(language.code)}
                      className="me-2"
                    >
                      {language.flag} {language.name}
                    </Button>
                  ))}
                </div>

                {/* Login Header */}
                <div className="text-center mb-4">
                  <h2 className="login-title mb-3">{t('loginTitle')}</h2>
                  <p className="text-muted">{t('welcomeSubtitle')}</p>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                {/* Login Form */}
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('email')}</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t('email')}
                      required
                      isInvalid={validated && !formData.email}
                      disabled={loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      {t('required')}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>{t('password')}</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={t('password')}
                      required
                      isInvalid={validated && !formData.password}
                      disabled={loading}
                    />
                    <Form.Control.Feedback type="invalid">
                      {t('required')}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      name="rememberMe"
                      label={t('rememberMe')}
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
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
                        {t('loading')}
                      </>
                    ) : (
                      t('login')
                    )}
                  </Button>
                </Form>

                {/* Footer */}
                <div className="text-center mt-4">
                  <small className="text-muted">
                    © 2024 Ardore Perfumes Dashboard
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
