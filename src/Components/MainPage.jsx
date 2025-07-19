import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Container, Row, Col } from "react-bootstrap";
import { useLanguage } from "../context/LanguageContext";
import "./MainPage.css";

export default function MainPage() {
  const { t, isRTL } = useLanguage();

  return (
    <Container fluid className="main-page">
      <Row className="align-items-center justify-content-center min-vh-50">
        <Col lg={6} md={12} className="order-md-2 text-center animation-container">
          <div className="lottie-wrapper">
            <DotLottieReact
              src="https://lottie.host/9492a228-9649-4f4b-9bd6-e0d3e2adc18b/KR4IWzq7gh.lottie"
              loop
              autoplay
            />
          </div>
        </Col>
        <Col lg={6} md={12} className="order-md-1 text-center welcome-content">
          <div className="welcome-text">
            <h2 className="welcome-title">
              {t('welcomeTitle')}
            </h2>
            <p className="welcome-subtitle">
              {t('welcomeSubtitle')}
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
