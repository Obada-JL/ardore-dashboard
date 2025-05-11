import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Modal, Button, Table, Form, Spinner, Container, Row, Col, Card, Tabs, Tab, Image, Badge } from "react-bootstrap";
import Swal from "sweetalert2";

export default function CoursesPage() {
  // States for categories
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({
    categoryTitle: { en: "", ar: "" },
    categoryImage: null
  });
  const [categoryModalMode, setCategoryModalMode] = useState("add");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // States for courses
  const [courses, setCourses] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState({
    mainTitle: { en: "", ar: "" },
    courseField: { en: "", ar: "" },
    description: { en: "", ar: "" },
    courseMainImage: null,
    courseImages: [],
    videos: [],
    games: [],
    category: null, // Add category field
    newLink: "",
    oldLink: ""
  });
  const [courseModalMode, setCourseModalMode] = useState("add");

  // Common states
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [activeTab, setActiveTab] = useState("categories");
  const [viewMode, setViewMode] = useState("grid"); // Changed default to grid

  // Image preview states
  const [categoryImagePreview, setCategoryImagePreview] = useState("");
  const [courseMainImagePreview, setCourseMainImagePreview] = useState("");
  const [courseImagesPreview, setCourseImagesPreview] = useState([]);

  // Backend API URLs
  const API_BASE_URL = "https://api.lineduc.com/api";
  
  // Category endpoints
  const GET_CATEGORIES_URL = `${API_BASE_URL}/getCategorys`;
  const ADD_CATEGORY_URL = `${API_BASE_URL}/addCategory`;
  const UPDATE_CATEGORY_URL = `${API_BASE_URL}/updateCategory`;
  const DELETE_CATEGORY_URL = `${API_BASE_URL}/deleteCategory`;

  // Course endpoints
  const GET_COURSES_URL = `${API_BASE_URL}/getCourses`;
  const GET_COURSE_URL = `${API_BASE_URL}/getCourse`;
  const ADD_COURSE_URL = `${API_BASE_URL}/addCourse`;
  const UPDATE_COURSE_URL = `${API_BASE_URL}/updateCourse`;
  const DELETE_COURSE_URL = `${API_BASE_URL}/deleteCourse`;

  // Filter courses by category
  const getFilteredCourses = () => {
    if (!selectedCategoryId) return courses;
    return courses.filter(course => {
      const category = categories.find(cat => cat._id === selectedCategoryId);
      console.log(category,course.courseField_ar)
      return course.courseField.ar === category?.categoryTitle_ar;
    });
  };

  // Fetch categories from the backend
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(GET_CATEGORIES_URL);
      // Sort categories by Arabic title
      const sortedCategories = response.data.sort((a, b) => 
        (a.categoryTitle_ar || '').localeCompare(b.categoryTitle_ar || '', 'ar')
      );
      setCategories(sortedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء جلب بيانات الفئات",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses from the backend
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(GET_COURSES_URL);
      // Sort courses by Arabic title
      const sortedCourses = response.data.sort((a, b) => 
        (a.mainTitle_ar || '').localeCompare(b.mainTitle_ar || '', 'ar')
      );
      setCourses(sortedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء جلب بيانات الدورات",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, []);

  // Handle showing the category modal for add/edit
  const handleShowCategoryModal = (category = null, mode = "add") => {
    setCategoryModalMode(mode);
    if (mode === "edit" && category) {
      setSelectedCategory({
        ...category,
        categoryTitle: {
          en: category.categoryTitle_en || "",
          ar: category.categoryTitle_ar || ""
        }
      });
      if (category.categoryImage) {
        setCategoryImagePreview(`https://api.lineduc.com/categoryImages/${category.categoryImage}`);
      }
    } else {
      setSelectedCategory({ categoryTitle: { en: "", ar: "" }, categoryImage: null });
      setCategoryImagePreview("");
    }
    setShowCategoryModal(true);
    setValidated(false);
  };

  // Handle showing the course modal for add/edit
  const handleShowCourseModal = (course = null, mode = "add") => {
    setCourseModalMode(mode);
    if (mode === "edit" && course) {
      // Transform videos and games to match the frontend format
      const transformedCourse = {
        ...course,
        videos: course.videos?.map(video => ({
          url: video.url || '',
          title_en: video.title?.en || '',
          title_ar: video.title?.ar || '',
          description_en: video.description?.en || '',
          description_ar: video.description?.ar || ''
        })) || [],
        games: course.games?.map(game => ({
          url: game.url || '',
          title_en: game.title?.en || '',
          title_ar: game.title?.ar || '',
          description_en: game.description?.en || '',
          description_ar: game.description?.ar || ''
        })) || [],
        newLink: course.newLink || '',
        oldLink: course.oldLink || ''
      };
      
      setSelectedCourse(transformedCourse);
      
      if (course.courseMainImage) {
        setCourseMainImagePreview(`https://api.lineduc.com/courseImages/${course.courseMainImage}`);
      }
      if (course.courseImages && course.courseImages.length > 0) {
        setCourseImagesPreview(
          course.courseImages.map(img => `https://api.lineduc.com/courseImages/${img}`)
        );
      }
    } else {
      setSelectedCourse({
        mainTitle: { en: "", ar: "" },
        courseField: { en: "", ar: "" },
        description: { en: "", ar: "" },
        courseMainImage: null,
        courseImages: [],
        videos: [],
        games: [],
        category: null,
        newLink: "",
        oldLink: ""
      });
      setCourseMainImagePreview("");
      setCourseImagesPreview([]);
    }
    setShowCourseModal(true);
    setValidated(false);
  };

  // Handle category image change
  const handleCategoryImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedCategory(prev => ({ ...prev, categoryImage: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setCategoryImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle course main image change
  const handleCourseMainImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedCourse(prev => ({ ...prev, courseMainImage: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setCourseMainImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle course images change
  const handleCourseImagesChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedCourse(prev => ({ ...prev, courseImages: files }));
      
      const previews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews.push(e.target.result);
          if (previews.length === files.length) {
            setCourseImagesPreview(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle category form submission
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("categoryTitle_en", selectedCategory.categoryTitle.en);
      formData.append("categoryTitle_ar", selectedCategory.categoryTitle.ar);
      if (selectedCategory.categoryImage) {
        formData.append("categoryImage", selectedCategory.categoryImage);
      }

      if (categoryModalMode === "add") {
        await axios.post(ADD_CATEGORY_URL, formData);
        Swal.fire({
          icon: "success",
          title: "تم",
          text: "تمت إضافة الفئة بنجاح",
        });
      } else {
        await axios.put(`${UPDATE_CATEGORY_URL}/${selectedCategory._id}`, formData);
        Swal.fire({
          icon: "success",
          title: "تم",
          text: "تم تحديث بيانات الفئة بنجاح",
        });
      }
      setShowCategoryModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء حفظ بيانات الفئة",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle course form submission
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Append multilingual fields
      formData.append("mainTitle_en", selectedCourse.mainTitle.en);
      formData.append("mainTitle_ar", selectedCourse.mainTitle.ar);
      formData.append("courseField_en", selectedCourse.courseField.en);
      formData.append("courseField_ar", selectedCourse.courseField.ar);
      formData.append("description_en", selectedCourse.description.en);
      formData.append("description_ar", selectedCourse.description.ar);
      formData.append("category", selectedCourse.category);
      formData.append("newLink", selectedCourse.newLink || "");
      formData.append("oldLink", selectedCourse.oldLink || "");
      
      // Append images
      if (selectedCourse.courseMainImage) {
        formData.append("courseMainImage", selectedCourse.courseMainImage);
      }
      
      if (selectedCourse.courseImages && selectedCourse.courseImages.length > 0) {
        selectedCourse.courseImages.forEach(image => {
          formData.append("courseImages", image);
        });
      }
      
      // Append videos and games as JSON strings
      formData.append("videos", JSON.stringify(selectedCourse.videos));
      formData.append("games", JSON.stringify(selectedCourse.games));

      if (courseModalMode === "add") {
        await axios.post(ADD_COURSE_URL, formData);
        Swal.fire({
          icon: "success",
          title: "تم",
          text: "تمت إضافة الدورة بنجاح",
        });
      } else {
        await axios.put(`${UPDATE_COURSE_URL}/${selectedCourse._id}`, formData);
        Swal.fire({
          icon: "success",
          title: "تم",
          text: "تم تحديث بيانات الدورة بنجاح",
        });
      }
      setShowCourseModal(false);
      fetchCourses();
    } catch (error) {
      console.error("Error saving course:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء حفظ بيانات الدورة",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (id) => {
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
          await axios.delete(`${DELETE_CATEGORY_URL}/${id}`);
          Swal.fire({
            icon: "success",
            title: "تم الحذف!",
            text: "تم حذف الفئة بنجاح.",
          });
          fetchCategories();
        } catch (error) {
          console.error("Error deleting category:", error);
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "حدث خطأ أثناء حذف الفئة",
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Handle course deletion
  const handleDeleteCourse = async (id) => {
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
          await axios.delete(`${DELETE_COURSE_URL}/${id}`);
          Swal.fire({
            icon: "success",
            title: "تم الحذف!",
            text: "تم حذف الدورة بنجاح.",
          });
          fetchCourses();
        } catch (error) {
          console.error("Error deleting course:", error);
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "حدث خطأ أثناء حذف الدورة",
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Handle nested input changes for courses
  const handleNestedInputChange = (e, parent, lang) => {
    const { name, value } = e.target;
    setSelectedCourse(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [lang]: value
      }
    }));
  };

  // Render categories grid
  const renderCategoriesGrid = () => (
    <Row xs={1} md={2} lg={3} className="g-4">
      {categories.map((category) => (
        <Col key={category._id}>
          <Card 
            className={`h-100 ${selectedCategoryId === category._id ? 'border-primary' : ''}`}
            onClick={() => setSelectedCategoryId(category._id)}
            style={{ cursor: 'pointer' }}
          >
            {category.categoryImage && (
              <Card.Img
                variant="top"
                src={`https://api.lineduc.com/categoryImages/${category.categoryImage}`}
                alt={category.categoryTitle_ar || category.categoryTitle_en}
                style={{ height: '200px', objectFit: 'cover' }}
              />
            )}
            <Card.Body>
              <Tabs defaultActiveKey="ar" id={`category-tabs-${category._id}`} className="mb-3">
                <Tab eventKey="ar" title="العربية">
                  <Card.Title>{category.categoryTitle_ar}</Card.Title>
                </Tab>
                <Tab eventKey="en" title="English">
                  <Card.Title>{category.categoryTitle_en}</Card.Title>
                </Tab>
              </Tabs>
              <Card.Text>
                {courses.filter(course => course.courseField.ar === category.categoryTitle_ar).length} دورة
              </Card.Text>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between">
              <Button
                variant="info"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShowCategoryModal(category, "edit");
                }}
              >
                تعديل
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(category._id);
                }}
              >
                حذف
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  );

  // Render courses grid
  const renderCoursesGrid = () => (
    <Row xs={1} md={2} lg={3} className="g-4">
      {getFilteredCourses().map((course) => (
        <Col key={course._id}>
          <Card className="h-100">
            {course.courseMainImage && (
              <Card.Img
                variant="top"
                src={`https://api.lineduc.com/courseImages/${course.courseMainImage}`}
                alt={course.mainTitle_ar || course.mainTitle_en}
                style={{ height: '200px', objectFit: 'cover' }}
              />
            )}
            <Card.Body>
              <Card.Title>{course.mainTitle_ar || course.mainTitle_en}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                {course.courseField?.ar || course.courseField?.en}
              </Card.Subtitle>
              <Card.Text>
                {course.description?.ar || course.description?.en}
              </Card.Text>
              {course.category && (
                <Badge bg="info" className="mb-2">
                  {categories.find(cat => cat._id === course.category)?.categoryTitle_ar || 
                   categories.find(cat => cat._id === course.category)?.categoryTitle_en || 
                   'فئة غير معروفة'}
                </Badge>
              )}
              {course.newLink && (
                <div className="mt-2">
                  <Badge bg="success">Link: {course.newLink}</Badge>
                </div>
              )}
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between">
              <Button
                variant="info"
                size="sm"
                onClick={() => handleShowCourseModal(course, "edit")}
              >
                تعديل
              </Button>
              <Link 
                to={course.newLink ? `/course/${course.newLink}` : `/view-course/${course._id}`} 
                className="btn btn-primary btn-sm"
                // target="_blank"
                rel="noopener noreferrer"
              >
                عرض
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteCourse(course._id)}
              >
                حذف
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <Container className="py-4">
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => {
          setActiveTab(k);
          setSelectedCategoryId(null);
        }}
        className="mb-4"
      >
        <Tab eventKey="categories" title="الفئات">
          <Row className="mb-3">
            <Col className="d-flex justify-content-end">
              <Button variant="primary" onClick={() => handleShowCategoryModal()}>
                إضافة فئة جديدة
              </Button>
            </Col>
          </Row>
          {loading ? (
            <div className="text-center my-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">جاري التحميل...</span>
              </Spinner>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center my-3">
              <p>لا توجد فئات حالياً</p>
            </div>
          ) : (
            renderCategoriesGrid()
          )}
        </Tab>
        <Tab eventKey="courses" title="الدورات">
          <Row className="mb-3">
            <Col>
              <Form.Select
                value={selectedCategoryId || ''}
                onChange={(e) => setSelectedCategoryId(e.target.value || null)}
                className="mb-3"
              >
                <option value="">كل الفئات</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.categoryTitle_ar || category.categoryTitle_en}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col className="d-flex justify-content-end">
              <Button variant="primary" onClick={() => handleShowCourseModal()}>
                إضافة دورة جديدة
              </Button>
            </Col>
          </Row>
          {loading ? (
            <div className="text-center my-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">جاري التحميل...</span>
              </Spinner>
            </div>
          ) : getFilteredCourses().length === 0 ? (
            <div className="text-center my-3">
              <p>لا توجد دورات {selectedCategoryId ? 'في هذه الفئة' : ''} حالياً</p>
            </div>
          ) : (
            renderCoursesGrid()
          )}
        </Tab>
      </Tabs>

      {/* Category Modal */}
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {categoryModalMode === "add" ? "إضافة فئة جديدة" : "تعديل بيانات الفئة"}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleCategorySubmit}>
          <Modal.Body>
            <Tabs defaultActiveKey="ar" id="category-language-tabs" className="mb-3">
              <Tab eventKey="ar" title="العربية">
                <Form.Group className="mb-3">
                  <Form.Label>عنوان الفئة (عربي)</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCategory.categoryTitle.ar}
                    onChange={(e) => setSelectedCategory(prev => ({
                      ...prev,
                      categoryTitle: { ...prev.categoryTitle, ar: e.target.value }
                    }))}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    يرجى إدخال عنوان الفئة بالعربية
                  </Form.Control.Feedback>
                </Form.Group>
              </Tab>
              <Tab eventKey="en" title="English">
                <Form.Group className="mb-3">
                  <Form.Label>Category Title (English)</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCategory.categoryTitle.en}
                    onChange={(e) => setSelectedCategory(prev => ({
                      ...prev,
                      categoryTitle: { ...prev.categoryTitle, en: e.target.value }
                    }))}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter the category title in English
                  </Form.Control.Feedback>
                </Form.Group>
              </Tab>
            </Tabs>

            <Form.Group className="mb-3">
              <Form.Label>صورة الفئة</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleCategoryImageChange}
              />
            </Form.Group>

            {categoryImagePreview && (
              <div className="text-center mt-3">
                <img
                  src={categoryImagePreview}
                  alt="معاينة صورة الفئة"
                  style={{ maxHeight: '200px' }}
                  className="img-fluid"
                />
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
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

      {/* Course Modal */}
      <Modal show={showCourseModal} onHide={() => setShowCourseModal(false)} centered dir="rtl" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {courseModalMode === "add" ? "إضافة دورة جديدة" : "تعديل بيانات الدورة"}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleCourseSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>الفئة</Form.Label>
              <Form.Select
                value={selectedCourse.category || ''}
                onChange={(e) => {
                  const categoryId = e.target.value;
                  const selectedCat = categories.find(cat => cat._id === categoryId);
                  setSelectedCourse(prev => ({
                    ...prev,
                    category: categoryId,
                    courseField: {
                      en: selectedCat?.categoryTitle_en || '',
                      ar: selectedCat?.categoryTitle_ar || ''
                    }
                  }));
                }}
                required
              >
                <option value="">اختر الفئة</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.categoryTitle_ar || category.categoryTitle_en}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                يرجى اختيار الفئة
              </Form.Control.Feedback>
            </Form.Group>

            <Tabs defaultActiveKey="ar" id="course-language-tabs" className="mb-3">
              <Tab eventKey="ar" title="العربية">
                <Form.Group className="mb-3">
                  <Form.Label>العنوان الرئيسي</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCourse.mainTitle.ar}
                    onChange={(e) => handleNestedInputChange(e, 'mainTitle', 'ar')}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>المجال</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCourse.courseField.ar}
                    readOnly
                    plaintext
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>الوصف</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedCourse.description.ar}
                    onChange={(e) => handleNestedInputChange(e, 'description', 'ar')}
                    required
                  />
                </Form.Group>
              </Tab>

              <Tab eventKey="en" title="English">
                <Form.Group className="mb-3">
                  <Form.Label>Main Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCourse.mainTitle.en}
                    onChange={(e) => handleNestedInputChange(e, 'mainTitle', 'en')}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Field</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCourse.courseField.en}
                    readOnly
                    plaintext
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedCourse.description.en}
                    onChange={(e) => handleNestedInputChange(e, 'description', 'en')}
                  />
                </Form.Group>
              </Tab>
            </Tabs>

            <Row className="mt-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>الرابط الجديد</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCourse.newLink || ''}
                    onChange={(e) => setSelectedCourse(prev => ({
                      ...prev,
                      newLink: e.target.value
                    }))}
                    placeholder="أدخل الرابط الجديد للتوجيه"
                  />
                  <Form.Text className="text-muted">
                    سيتم توجيه المستخدم إلى هذا الرابط عند عرض الدورة
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>الرابط القديم</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedCourse.oldLink || ''}
                    onChange={(e) => setSelectedCourse(prev => ({
                      ...prev,
                      oldLink: e.target.value
                    }))}
                    placeholder="أدخل الرابط القديم (اختياري)"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>الصورة الرئيسية</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleCourseMainImageChange}
                  />
                </Form.Group>
                {courseMainImagePreview && (
                  <div className="text-center">
                    <img
                      src={courseMainImagePreview}
                      alt="معاينة الصورة الرئيسية"
                      style={{ maxHeight: '200px' }}
                      className="img-fluid"
                    />
                  </div>
                )}
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>صور إضافية</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCourseImagesChange}
                  />
                </Form.Group>
                {courseImagesPreview.length > 0 && (
                  <div className="d-flex flex-wrap gap-2">
                    {courseImagesPreview.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`معاينة ${index + 1}`}
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                )}
              </Col>
            </Row>

            {/* Videos Section */}
            <div className="mt-4">
              <h5>الفيديوهات</h5>
              {selectedCourse.videos.map((video, index) => (
                <div key={index} className="border rounded p-3 mb-3">
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>رابط الفيديو</Form.Label>
                        <Form.Control
                          type="url"
                          value={video.url || ''}
                          onChange={(e) => {
                            const newVideos = [...selectedCourse.videos];
                            newVideos[index] = { ...newVideos[index], url: e.target.value };
                            setSelectedCourse(prev => ({ ...prev, videos: newVideos }));
                          }}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>عنوان الفيديو (عربي)</Form.Label>
                        <Form.Control
                          type="text"
                          value={video.title_ar || ''}
                          onChange={(e) => {
                            const newVideos = [...selectedCourse.videos];
                            newVideos[index] = { 
                              ...newVideos[index], 
                              title_ar: e.target.value
                            };
                            setSelectedCourse(prev => ({ ...prev, videos: newVideos }));
                          }}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>عنوان الفيديو (English)</Form.Label>
                        <Form.Control
                          type="text"
                          value={video.title_en || ''}
                          onChange={(e) => {
                            const newVideos = [...selectedCourse.videos];
                            newVideos[index] = { 
                              ...newVideos[index], 
                              title_en: e.target.value
                            };
                            setSelectedCourse(prev => ({ ...prev, videos: newVideos }));
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12} className="text-end">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          const newVideos = selectedCourse.videos.filter((_, i) => i !== index);
                          setSelectedCourse(prev => ({ ...prev, videos: newVideos }));
                        }}
                      >
                        حذف الفيديو
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  setSelectedCourse(prev => ({
                    ...prev,
                    videos: [
                      ...prev.videos,
                      {
                        url: '',
                        title_en: '',
                        title_ar: ''
                      }
                    ]
                  }));
                }}
              >
                إضافة فيديو جديد
              </Button>
            </div>

            {/* Games Section */}
            <div className="mt-4">
              <h5>الألعاب</h5>
              {selectedCourse.games.map((game, index) => (
                <div key={index} className="border rounded p-3 mb-3">
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>رابط اللعبة</Form.Label>
                        <Form.Control
                          type="url"
                          value={game.url || ''}
                          onChange={(e) => {
                            const newGames = [...selectedCourse.games];
                            newGames[index] = { ...newGames[index], url: e.target.value };
                            setSelectedCourse(prev => ({ ...prev, games: newGames }));
                          }}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>عنوان اللعبة (عربي)</Form.Label>
                        <Form.Control
                          type="text"
                          value={game.title_ar || ''}
                          onChange={(e) => {
                            const newGames = [...selectedCourse.games];
                            newGames[index] = { 
                              ...newGames[index], 
                              title_ar: e.target.value
                            };
                            setSelectedCourse(prev => ({ ...prev, games: newGames }));
                          }}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>عنوان اللعبة (English)</Form.Label>
                        <Form.Control
                          type="text"
                          value={game.title_en || ''}
                          onChange={(e) => {
                            const newGames = [...selectedCourse.games];
                            newGames[index] = { 
                              ...newGames[index], 
                              title_en: e.target.value
                            };
                            setSelectedCourse(prev => ({ ...prev, games: newGames }));
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12} className="text-end">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          const newGames = selectedCourse.games.filter((_, i) => i !== index);
                          setSelectedCourse(prev => ({ ...prev, games: newGames }));
                        }}
                      >
                        حذف اللعبة
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  setSelectedCourse(prev => ({
                    ...prev,
                    games: [
                      ...prev.games,
                      {
                        url: '',
                        title_en: '',
                        title_ar: ''
                      }
                    ]
                  }));
                }}
              >
                إضافة لعبة جديدة
              </Button>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCourseModal(false)}>
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
