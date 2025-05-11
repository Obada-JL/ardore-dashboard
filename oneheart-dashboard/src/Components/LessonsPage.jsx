import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Form, Spinner, Container, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  // Backend API URL
  const API_BASE_URL = "https://api.lineduc.com/api";
  const GET_LESSONS_URL = `${API_BASE_URL}/lessons`;
  const ADD_LESSON_URL = `${API_BASE_URL}/lessons`;
  const UPDATE_LESSON_URL = `${API_BASE_URL}/lessons`;
  const DELETE_LESSON_URL = `${API_BASE_URL}/lessons`;

  // Fetch lessons from the backend
  const fetchLessons = async () => {
    setLoading(true);
    try {
      const response = await axios.get(GET_LESSONS_URL);
      setLessons(response.data);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء جلب بيانات الدروس",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load lessons on component mount
  useEffect(() => {
    fetchLessons();
  }, []);

  // Handle showing the modal for add/edit
  const handleShowModal = (lesson = {}, mode = "add") => {
    setModalMode(mode);
    setSelectedLesson(lesson);
    setShowModal(true);
    setValidated(false);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLesson({});
    setValidated(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedLesson({ ...selectedLesson, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    try {
      if (modalMode === "add") {
        // Create new lesson
        await axios.post(ADD_LESSON_URL, selectedLesson);
        Swal.fire({
          icon: "success",
          title: "تم",
          text: "تمت إضافة الدرس بنجاح",
        });
      } else {
        // Update existing lesson
        await axios.put(`${UPDATE_LESSON_URL}/${selectedLesson._id}`, selectedLesson);
        Swal.fire({
          icon: "success",
          title: "تم",
          text: "تم تحديث بيانات الدرس بنجاح",
        });
      }
      handleCloseModal();
      fetchLessons();
    } catch (error) {
      console.error("Error saving lesson:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء حفظ بيانات الدرس",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle lesson deletion
  const handleDeleteLesson = async (id) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await axios.delete(`${DELETE_LESSON_URL}/${id}`);
          Swal.fire({
            icon: "success",
            title: "تم الحذف!",
            text: "تم حذف الدرس بنجاح.",
          });
          fetchLessons();
        } catch (error) {
          console.error("Error deleting lesson:", error);
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "حدث خطأ أثناء حذف الدرس",
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-center">إدارة الدروس</h2>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col className="d-flex justify-content-end">
          <Button variant="primary" onClick={() => handleShowModal()}>
            إضافة درس جديد
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          {loading && (
            <div className="text-center my-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">جاري التحميل...</span>
              </Spinner>
            </div>
          )}
          
          {!loading && lessons.length === 0 ? (
            <div className="text-center my-3">
              <p>لا يوجد دروس حالياً</p>
            </div>
          ) : (
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>العنوان</th>
                  <th>الوصف</th>
                  <th>المدة (دقائق)</th>
                  <th>المستوى</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson, index) => (
                  <tr key={lesson._id}>
                    <td>{index + 1}</td>
                    <td>{lesson.title}</td>
                    <td>{lesson.description && lesson.description.length > 50 
                      ? `${lesson.description.substring(0, 50)}...` 
                      : lesson.description}</td>
                    <td>{lesson.duration}</td>
                    <td>{lesson.level}</td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(lesson, "edit")}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteLesson(lesson._id)}
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

      {/* Add/Edit Lesson Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "add" ? "إضافة درس جديد" : "تعديل بيانات الدرس"}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>العنوان</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={selectedLesson.title || ""}
                onChange={handleInputChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                يرجى إدخال عنوان الدرس
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>الوصف</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={selectedLesson.description || ""}
                onChange={handleInputChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                يرجى إدخال وصف الدرس
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>المدة (دقائق)</Form.Label>
              <Form.Control
                type="number"
                name="duration"
                value={selectedLesson.duration || ""}
                onChange={handleInputChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                يرجى إدخال مدة الدرس
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>المستوى</Form.Label>
              <Form.Select
                name="level"
                value={selectedLesson.level || ""}
                onChange={handleInputChange}
                required
              >
                <option value="">اختر المستوى</option>
                <option value="مبتدئ">مبتدئ</option>
                <option value="متوسط">متوسط</option>
                <option value="متقدم">متقدم</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                يرجى اختيار مستوى الدرس
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>رابط الفيديو</Form.Label>
              <Form.Control
                type="url"
                name="videoUrl"
                value={selectedLesson.videoUrl || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>المواد المرفقة (رابط)</Form.Label>
              <Form.Control
                type="url"
                name="materialsUrl"
                value={selectedLesson.materialsUrl || ""}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
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
                "حفظ"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
} 