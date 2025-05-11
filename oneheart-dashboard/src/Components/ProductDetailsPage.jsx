import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab, Button, Spinner, Image, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

// Custom styles for the product page
const productPageStyles = `
  .product-main-swiper {
    margin-bottom: 20px;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .product-main-swiper .swiper-slide {
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
  }
  
  .product-main-swiper img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
  }
  
  .product-thumbs-swiper {
    height: 100px;
    margin-bottom: 30px;
  }
  
  .product-thumbs-swiper .swiper-slide {
    height: 100%;
    opacity: 0.6;
    cursor: pointer;
    border-radius: 5px;
    overflow: hidden;
    border: 2px solid transparent;
    transition: all 0.3s ease;
  }
  
  .product-thumbs-swiper .swiper-slide-thumb-active {
    opacity: 1;
    border-color: #3498db;
  }
  
  .product-thumbs-swiper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .product-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 10px;
  }
  
  .product-subtitle {
    font-size: 1.5rem;
    color: #666;
    margin-bottom: 20px;
  }
  
  .product-price {
    font-size: 1.8rem;
    font-weight: 700;
    color: #e74c3c;
    margin: 15px 0;
  }
  
  .product-category {
    margin-bottom: 15px;
  }
  
  .product-actions {
    margin: 20px 0;
  }
  
  .product-section {
    margin-bottom: 30px;
  }
  
  .product-section-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 2px solid #f0f0f0;
  }
  
  .feature-item {
    display: flex;
    margin-bottom: 10px;
  }
  
  .feature-icon {
    margin-left: 10px;
    color: #3498db;
  }
  
  .feature-title {
    font-weight: 600;
    margin-bottom: 5px;
  }
  
  .swiper-button-next, .swiper-button-prev {
    color: #3498db;
  }
  
  .swiper-pagination-bullet-active {
    background: #3498db;
  }
  
  /* RTL Support */
  [dir="rtl"] .feature-icon {
    margin-left: 10px;
    margin-right: 0;
  }
`;

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  // API URL
  const API_BASE_URL = "https://api.lineduc.com/api";
  const PRODUCTS_URL = `${API_BASE_URL}/products`;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${PRODUCTS_URL}/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setProduct(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('حدث خطأ أثناء جلب بيانات المنتج');
        
        // Show error notification
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'حدث خطأ أثناء جلب بيانات المنتج. يرجى المحاولة مرة أخرى.'
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Helper function to get image path safely
  const getImagePath = (image) => {
    if (!image) return '';
    
    // Handle different image formats
    if (typeof image === 'string') {
      return `https://api.lineduc.com/productsImages/${image}`;
    } else if (image.en || image.ar) {
      return `https://api.lineduc.com/productsImages/${image.en || image.ar}`;
    }
    
    return '';
  };

  // Render main features section
  const renderMainFeatures = (lang) => {
    if (!product?.mainFeatures || product.mainFeatures.length === 0) {
      return null;
    }

    return (
      <div className="product-section">
        <h5 className="product-section-title">
          {lang === 'ar' ? 'المميزات الرئيسية' : 'Main Features'}
        </h5>
        {product.mainFeatures.map((feature, index) => (
          <div key={index} className="feature-item">
            {feature.icon && (
              <div className="feature-icon">
                <i className={feature.icon}></i>
              </div>
            )}
            <div>
              <div className="feature-title">{feature.title?.[lang] || ''}</div>
              <div className="feature-description">{feature.description?.[lang] || ''}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render learning section
  const renderLearningSection = (lang) => {
    if (!product?.learnsSection || product.learnsSection.length === 0) {
      return null;
    }

    return (
      <div className="product-section">
        <h5 className="product-section-title">
          {lang === 'ar' ? 'ماذا ستتعلم' : 'What You Will Learn'}
        </h5>
        <ul>
          {product.learnsSection.map((item, index) => (
            <li key={index}>{item?.[lang] || ''}</li>
          ))}
        </ul>
      </div>
    );
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">جاري التحميل...</span>
        </Spinner>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger" role="alert">
          {error || 'لم يتم العثور على المنتج'}
        </div>
        <Button variant="primary" onClick={() => navigate('/products')}>
          العودة إلى قائمة المنتجات
        </Button>
      </Container>
    );
  }

  // Prepare images for the carousel
  const productImages = [];
  if (product.mainImage) {
    productImages.push(product.mainImage);
  }
  if (product.sliderImages && product.sliderImages.length > 0) {
    productImages.push(...product.sliderImages);
  }

  return (
    <Container className="py-5">
      <style>{productPageStyles}</style>
      
      <Button 
        variant="outline-secondary" 
        className="mb-4"
        onClick={() => navigate('/products')}
      >
        &larr; العودة إلى قائمة المنتجات
      </Button>
      
      <Row>
        <Col lg={6} className="mb-4">
          {productImages.length > 0 ? (
            <>
              {/* Main Swiper */}
              <Swiper
                modules={[Navigation, Pagination, Thumbs]}
                spaceBetween={10}
                navigation={true}
                pagination={{ clickable: true }}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                className="product-main-swiper"
              >
                {productImages.map((image, index) => (
                  <SwiperSlide key={index}>
                    <img 
                      src={getImagePath(image)} 
                      alt={`${product.title?.ar || product.title?.en} ${index + 1}`}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Thumbs Swiper */}
              {productImages.length > 1 && (
                <Swiper
                  modules={[Thumbs]}
                  watchSlidesProgress
                  onSwiper={setThumbsSwiper}
                  spaceBetween={10}
                  slidesPerView={4}
                  className="product-thumbs-swiper"
                >
                  {productImages.map((image, index) => (
                    <SwiperSlide key={index}>
                      <img 
                        src={getImagePath(image)} 
                        alt={`Thumbnail ${index + 1}`}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </>
          ) : (
            <div className="text-center p-5 bg-light rounded">
              <p>لا توجد صور متاحة</p>
            </div>
          )}
        </Col>
        
        <Col lg={6}>
          <h1 className="product-title">{product.title?.ar || product.title?.en}</h1>
          <h2 className="product-subtitle">{product.name?.ar || product.name?.en}</h2>
          
          {product.category && (
            <div className="product-category">
              <Badge bg="secondary">
                {product.category?.name?.ar || product.category?.name?.en || 'غير مصنف'}
              </Badge>
            </div>
          )}
          
          {product.price && (
            <div className="product-price">
              {product.price} ريال
            </div>
          )}
          
          {product.buyLink && (
            <div className="product-actions">
              <Button 
                variant="primary" 
                href={product.buyLink} 
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
              >
                شراء المنتج
              </Button>
            </div>
          )}
        </Col>
      </Row>
      
      <Row className="mt-5">
        <Col>
          <Tabs defaultActiveKey="ar" id="product-details-tabs" className="mb-4">
            <Tab eventKey="ar" title="العربية">
              <div className="product-section">
                <h5 className="product-section-title">الوصف</h5>
                <p>{product.description?.ar || "لا يوجد وصف بالعربية"}</p>
              </div>
              
              <div className="product-section">
                <h5 className="product-section-title">المواصفات</h5>
                <Row>
                  <Col md={6}>
                    <p><strong>الأبعاد:</strong> {product.features.dimensions?.ar || "غير محدد"}</p>
                    <p><strong>عدد الصفحات:</strong> {product.features.pageCount?.ar || "غير محدد"}</p>
                    <p><strong>مكان النشر:</strong> {product.features.publishingPlace?.ar || "غير محدد"}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>الطبعة:</strong> {product.features.edition?.ar || "غير محدد"}</p>
                    <p><strong>تاريخ النشر:</strong> {product.features.publishDate?.ar || "غير محدد"}</p>
                    <p><strong>اللغة:</strong> {product.features.language?.ar || "غير محدد"}</p>
                  </Col>
                </Row>
              </div>
              
              {renderMainFeatures('ar')}
              {renderLearningSection('ar')}
            </Tab>
            
            <Tab eventKey="en" title="English">
              <div className="product-section">
                <h5 className="product-section-title">Description</h5>
                <p>{product.description?.en || "No English description available"}</p>
              </div>
              
              <div className="product-section">
                <h5 className="product-section-title">Specifications</h5>
                <Row>
                  <Col md={6}>
                    <p><strong>Dimensions:</strong> {product.features.dimensions?.en || "Not specified"}</p>
                    <p><strong>Page Count:</strong> {product.features.pageCount?.en || "Not specified"}</p>
                    <p><strong>Publishing Place:</strong> {product.features.publishingPlace?.en || "Not specified"}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Edition:</strong> {product.features.edition?.en || "Not specified"}</p>
                    <p><strong>Publish Date:</strong> {product.features.publishDate?.en || "Not specified"}</p>
                    <p><strong>Language:</strong> {product.features.language?.en || "Not specified"}</p>
                  </Col>
                </Row>
              </div>
              
              {renderMainFeatures('en')}
              {renderLearningSection('en')}
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailsPage; 