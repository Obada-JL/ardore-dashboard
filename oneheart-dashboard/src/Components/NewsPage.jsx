import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Table,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";
import "./NewsPage.css";

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [validated, setValidated] = useState(false);
  const [selectedNews, setSelectedNews] = useState({
    newsImage: null,
    newsDate: "",
    newsTitle: { en: "", ar: "" },
    newsCategory: { en: "", ar: "" },
    newsDescription: { en: "", ar: "" },
  });
  const [previewImage, setPreviewImage] = useState(null);

  // API URLs
  const API_BASE_URL = "https://api.lineduc.com/api";
  const BASE_URL = "https://api.lineduc.com";
  const NEWS_URL = `${API_BASE_URL}/getNews`;

  // Fetch news
  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(NEWS_URL);
      setNews(response.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء جلب البيانات",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedNews({ ...selectedNews, newsImage: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle modal show
  const handleShowModal = (newsItem = null, mode = "add") => {
    setModalMode(mode);
    if (mode === "edit" && newsItem) {
      setSelectedNews(newsItem);
      setPreviewImage(
        newsItem.newsImage
          ? `${BASE_URL}/newsImages/${newsItem.newsImage}`
          : null
      );
    } else {
      setSelectedNews({
        newsImage: null,
        newsDate: "",
        newsTitle: { en: "", ar: "" },
        newsCategory: { en: "", ar: "" },
        newsDescription: { en: "", ar: "" },
      });
      setPreviewImage(null);
    }
    setShowModal(true);
    setValidated(false);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    const formData = new FormData();

    // Append all fields to FormData
    if (selectedNews.newsImage) {
      formData.append("newsImage", selectedNews.newsImage);
    }
    formData.append("newsDate", selectedNews.newsDate);
    formData.append("newsTitle_en", selectedNews.newsTitle.en);
    formData.append("newsTitle_ar", selectedNews.newsTitle.ar);
    formData.append("newsCategory_en", selectedNews.newsCategory.en);
    formData.append("newsCategory_ar", selectedNews.newsCategory.ar);
    formData.append("newsDescription_en", selectedNews.newsDescription.en);
    formData.append("newsDescription_ar", selectedNews.newsDescription.ar);

    try {
      if (modalMode === "add") {
        await axios.post(`${API_BASE_URL}/addNews`, formData);
        Swal.fire({
          icon: "success",
          title: "تم",
          text: "تمت إضافة الخبر بنجاح",
        });
      } else {
        await axios.put(
          `${API_BASE_URL}/updateNews/${selectedNews._id}`,
          formData
        );
        Swal.fire({
          icon: "success",
          title: "تم",
          text: "تم تحديث الخبر بنجاح",
        });
      }
      setShowModal(false);
      fetchNews();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء حفظ البيانات",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/deleteNews/${id}`);
          Swal.fire({
            icon: "success",
            title: "تم الحذف!",
            text: "تم حذف الخبر بنجاح",
          });
          fetchNews();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "حدث خطأ أثناء حذف الخبر",
          });
        }
      }
    });
  };

  return (
    <Container fluid className="news-page">
      <Row className="mb-4">
        <Col>
          <h2 className="text-center">إدارة الأخبار</h2>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col className="d-flex justify-content-end">
          <Button variant="primary" onClick={() => handleShowModal()}>
            إضافة خبر جديد
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
          ) : news.length === 0 ? (
            <div className="text-center my-3">
              <p>لا توجد أخبار حالياً</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الصورة</th>
                    <th>التاريخ</th>
                    <th>العنوان (عربي)</th>
                    <th>العنوان (إنجليزي)</th>
                    <th>التصنيف</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {news.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td>
                        {item.newsImage && (
                          <img
                            src={`${BASE_URL}/newsImages/${item.newsImage}`}
                            alt="News"
                            className="news-thumbnail"
                          />
                        )}
                      </td>
                      <td>{item.newsDate}</td>
                      <td>{item.newsTitle.ar}</td>
                      <td>{item.newsTitle.en}</td>
                      <td>{item.newsCategory.ar}</td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => handleShowModal(item, "edit")}
                        >
                          تعديل
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(item._id)}
                        >
                          حذف
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Col>
      </Row>

      {/* Add/Edit News Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "add" ? "إضافة خبر جديد" : "تعديل الخبر"}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>صورة الخبر</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Form.Group>
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="img-preview mb-3"
                  />
                )}
                <Form.Group className="mb-3">
                  <Form.Label>التاريخ</Form.Label>
                  <Form.Control
                    type="date"
                    value={selectedNews.newsDate}
                    onChange={(e) =>
                      setSelectedNews({ ...selectedNews, newsDate: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>العنوان (عربي)</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedNews.newsTitle.ar}
                    onChange={(e) =>
                      setSelectedNews({
                        ...selectedNews,
                        newsTitle: { ...selectedNews.newsTitle, ar: e.target.value },
                      })
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>العنوان (إنجليزي)</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedNews.newsTitle.en}
                    onChange={(e) =>
                      setSelectedNews({
                        ...selectedNews,
                        newsTitle: { ...selectedNews.newsTitle, en: e.target.value },
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>التصنيف (عربي)</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedNews.newsCategory.ar}
                    onChange={(e) =>
                      setSelectedNews({
                        ...selectedNews,
                        newsCategory: { ...selectedNews.newsCategory, ar: e.target.value },
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>التصنيف (إنجليزي)</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedNews.newsCategory.en}
                    onChange={(e) =>
                      setSelectedNews({
                        ...selectedNews,
                        newsCategory: { ...selectedNews.newsCategory, en: e.target.value },
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>الوصف (عربي)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedNews.newsDescription.ar}
                    onChange={(e) =>
                      setSelectedNews({
                        ...selectedNews,
                        newsDescription: { ...selectedNews.newsDescription, ar: e.target.value },
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>الوصف (إنجليزي)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedNews.newsDescription.en}
                    onChange={(e) =>
                      setSelectedNews({
                        ...selectedNews,
                        newsDescription: { ...selectedNews.newsDescription, en: e.target.value },
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
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
                    className="me-2"
                  />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                "حفظ"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
} 