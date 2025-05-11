import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import SwiperCarouselDemo from './SwiperCarouselDemo';
import ProductCarousel from './ProductCarousel';
import TestimonialCarousel from './TestimonialCarousel';

// Custom styles for the demo page
const demoStyles = `
  .demo-section {
    padding: 40px 0;
    border-bottom: 1px solid #eee;
  }
  
  .demo-section:last-child {
    border-bottom: none;
  }
  
  .demo-title {
    margin-bottom: 30px;
    color: #2c3e50;
    font-weight: 700;
  }
  
  .demo-description {
    margin-bottom: 30px;
    color: #7f8c8d;
  }
  
  .demo-card {
    margin-bottom: 30px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  
  .demo-card-header {
    background-color: #3498db;
    color: white;
    padding: 15px 20px;
  }
  
  .demo-card-body {
    padding: 20px;
  }
  
  .code-block {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 5px;
    font-family: monospace;
    margin-bottom: 20px;
    overflow-x: auto;
  }
  
  .feature-list {
    list-style-type: none;
    padding-right: 0;
  }
  
  .feature-list li {
    margin-bottom: 10px;
    position: relative;
    padding-right: 25px;
  }
  
  .feature-list li:before {
    content: "✓";
    color: #2ecc71;
    position: absolute;
    right: 0;
    font-weight: bold;
  }
`;

const CarouselDemo = () => {
  return (
    <Container fluid className="py-4">
      <style>{demoStyles}</style>
      
      <Row className="mb-4">
        <Col>
          <h1 className="text-center demo-title">عروض الشرائح باستخدام Swiper</h1>
          <p className="text-center demo-description">
            مكتبة Swiper هي مكتبة عروض شرائح حديثة وسريعة ومتوافقة مع الأجهزة المحمولة. 
            تتيح لك إنشاء عروض شرائح متقدمة بسهولة.
          </p>
        </Col>
      </Row>
      
      <div className="demo-section">
        <Row className="mb-4">
          <Col>
            <h2 className="text-center">مميزات مكتبة Swiper</h2>
          </Col>
        </Row>
        
        <Row>
          <Col md={6}>
            <Card className="demo-card">
              <Card.Header className="demo-card-header">
                <h4 className="mb-0">المميزات الرئيسية</h4>
              </Card.Header>
              <Card.Body className="demo-card-body">
                <ul className="feature-list">
                  <li>متوافقة تماماً مع الأجهزة المحمولة</li>
                  <li>دعم كامل للمس والسحب</li>
                  <li>تدعم RTL (اليمين إلى اليسار)</li>
                  <li>تأثيرات انتقال متعددة (slide, fade, cube, coverflow)</li>
                  <li>دعم التنقل والترقيم</li>
                  <li>دعم التشغيل التلقائي</li>
                  <li>تخصيص كامل للمظهر</li>
                  <li>دعم الصور المتجاوبة</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card className="demo-card">
              <Card.Header className="demo-card-header">
                <h4 className="mb-0">كيفية الاستخدام</h4>
              </Card.Header>
              <Card.Body className="demo-card-body">
                <p>لاستخدام Swiper في مشروع React، قم بتثبيت المكتبة:</p>
                <div className="code-block">
                  npm install swiper
                </div>
                
                <p>ثم استيراد المكونات المطلوبة:</p>
                <div className="code-block">
                  {`import { Swiper, SwiperSlide } from 'swiper/react';\nimport { Navigation, Pagination } from 'swiper/modules';\n\n// Import Swiper styles\nimport 'swiper/css';\nimport 'swiper/css/navigation';\nimport 'swiper/css/pagination';`}
                </div>
                
                <Button 
                  variant="primary" 
                  href="https://swiperjs.com/react" 
                  target="_blank"
                  className="w-100"
                >
                  زيارة الموقع الرسمي للمكتبة
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
      
      <div className="demo-section">
        <Row className="mb-4">
          <Col>
            <h2 className="text-center">أمثلة على عروض الشرائح</h2>
          </Col>
        </Row>
        
        <SwiperCarouselDemo />
      </div>
      
      <div className="demo-section">
        <Row className="mb-4">
          <Col>
            <h2 className="text-center">عرض المنتجات</h2>
            <p className="text-center demo-description">
              مثال على استخدام Swiper لعرض المنتجات من API
            </p>
          </Col>
        </Row>
        
        <ProductCarousel 
          title="منتجاتنا المميزة" 
          limit={8}
          autoplay={true}
        />
      </div>
      
      <div className="demo-section">
        <Row className="mb-4">
          <Col>
            <h2 className="text-center">آراء العملاء</h2>
            <p className="text-center demo-description">
              مثال على استخدام Swiper لعرض آراء العملاء
            </p>
          </Col>
        </Row>
        
        <Row>
          <Col md={6} className="mb-4">
            <h4 className="text-center mb-3">تأثير الانزلاق (Slide)</h4>
            <TestimonialCarousel 
              title="آراء عملائنا" 
              effect="slide"
              autoplay={true}
            />
          </Col>
          
          <Col md={6} className="mb-4">
            <h4 className="text-center mb-3">تأثير التلاشي (Fade)</h4>
            <TestimonialCarousel 
              title="آراء عملائنا" 
              effect="fade"
              autoplay={true}
            />
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default CarouselDemo; 