import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/homelogo.png";
import "./NavBar.css";
import Swal from "sweetalert2";
import { useState } from "react";
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { useLanguage } from "../context/LanguageContext";
import { showConfirmDialog, showSuccessToast } from "../utils/toast";

export default function NavBar() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const { currentLanguage, changeLanguage, t, availableLanguages, isRTL } = useLanguage();

  const handleLogout = () => {
    showConfirmDialog({
      title: t('deleteConfirm'),
      text: t('logoutConfirm'),
      icon: "warning",
      confirmButtonText: t('yes'),
      cancelButtonText: t('no'),
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        showSuccessToast(t('logoutSuccess'));

        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    });
  };

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setExpanded(false);
  };

  return (
    <Navbar
      expanded={expanded}
      expand="lg"
      className="navbar ms-lg-5 me-lg-5 mt-2"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          <img
            src={Logo}
            alt={t('dashboard')}
            className="navbar__logo"
            style={{ maxHeight: '50px' }}
          />
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded(!expanded)}
        />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className={isRTL ? "me-auto" : "ms-auto"}>
            <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>
              {t('home')}
            </Nav.Link>
            <Nav.Link as={Link} to="/products" onClick={() => setExpanded(false)}>
              {t('products')}
            </Nav.Link>
            <Nav.Link as={Link} to="/orders" onClick={() => setExpanded(false)}>
              {t('orders')}
            </Nav.Link>
            <Nav.Link as={Link} to="/discounts" onClick={() => setExpanded(false)}>
              {t('discounts')}
            </Nav.Link>
            <Nav.Link as={Link} to="/messages" onClick={() => setExpanded(false)}>
              {t('messages')}
            </Nav.Link>
            <Nav.Link as={Link} to="/users" onClick={() => setExpanded(false)}>
              {t('users')}
            </Nav.Link>
            <Nav.Link as={Link} to="/about" onClick={() => setExpanded(false)}>
              {t('about')}
            </Nav.Link>

            {/* Language Selector */}
            <Dropdown
              className="d-inline-block"
              drop={isRTL ? "start" : "end"}
            >
              <Dropdown.Toggle
                variant="outline-secondary"
                id="language-dropdown"
                size="sm"
                className="ms-2"
              >
                {availableLanguages.find(lang => lang.code === currentLanguage)?.flag} {t('language')}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {availableLanguages.map((language) => (
                  <Dropdown.Item
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    active={currentLanguage === language.code}
                  >
                    {language.flag} {language.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            {/* Logout Button */}
            <Nav.Link
              onClick={handleLogout}
              className="text-danger ms-2"
              style={{ cursor: 'pointer' }}
            >
              {t('logout')}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
