import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner, Nav } from "react-bootstrap";
import Swal from "sweetalert2";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      if (activeTab === "all") {
        // Fetch both regular and finished students
        const [readingResponse, finishedResponse] = await Promise.all([
          axios.get("https://api.lineduc.com/api/getStudents"),
          axios.get("https://api.lineduc.com/api/getFinishedStudents")
        ]);
        
        const allStudents = [
          ...readingResponse.data.map(student => ({ ...student, type: 'reading' })),
          ...finishedResponse.data.map(student => ({ ...student, type: 'finished' }))
        ];
        setStudents(allStudents);
      } else {
        let endpoint = activeTab === "reading" ? "getStudents" : "getFinishedStudents";
        const response = await axios.get(`https://api.lineduc.com/api/${endpoint}`);
        setStudents(response.data.map(student => ({ ...student, type: activeTab })));
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء جلب بيانات الطلاب",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [activeTab]);

  const getInitials = (name) => {
    if (!name) return "؟";
    return name.split(" ")[0].charAt(0).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
      "#FFEEAD", "#D4A5A5", "#9B59B6", "#3498DB"
    ];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  };

  const renderAvatar = (student) => {
    if (student.studentImage || student.finishedStudentImage) {
      return (
        <img
          src={`https://api.lineduc.com/studentsImages/${student.studentImage || student.finishedStudentImage}`}
          alt={student.name}
          className="student-avatar"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    return (
      <div 
        className="student-avatar-placeholder"
        style={{ backgroundColor: getAvatarColor(student.name) }}
      >
        {getInitials(student.name)}
      </div>
    );
  };

  const handleShowModal = (student = {}, mode = "add") => {
    if (mode === "add" && activeTab === "all") {
      Swal.fire({
        icon: "warning",
        title: "تنبيه",
        text: "الرجاء اختيار نوع الطالب (قراءة/منتهي) قبل الإضافة",
      });
      return;
    }
    setSelectedStudent(student);
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStudent({});
  };

  const handleSaveStudent = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("name", selectedStudent.name);
    formData.append("city", selectedStudent.city);
    formData.append("riwayah", selectedStudent.riwayah);
    formData.append("startDate", selectedStudent.startDate || new Date().toISOString());
    formData.append("note", selectedStudent.note);

    // Handle different image field names
    if (activeTab === "finished") {
      formData.append("finishedStudentImage", selectedStudent.studentImage);
      formData.append("endDate", selectedStudent.endDate || "");
    } else {
      formData.append("studentImage", selectedStudent.studentImage);
      formData.append("currentPage", selectedStudent.currentPage || "");
      formData.append("lastQuiz", selectedStudent.lastQuiz || "");
    }

    try {
      let endpoint = activeTab === "finished" ? "addFinishedStudent" : "addStudent";
      if (modalMode === "add") {
        await axios.post(
          `https://api.lineduc.com/api/${endpoint}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else if (modalMode === "edit") {
        endpoint = activeTab === "finished" ? "updateFinishedStudent" : "updateStudent";
        await axios.put(
          `https://api.lineduc.com/api/${endpoint}/${selectedStudent._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }
      fetchStudents();
      handleCloseModal();
      Swal.fire({
        icon: "success",
        title: "تم",
        text: modalMode === "add" ? "تمت إضافة الطالب بنجاح" : "تم تحديث بيانات الطالب بنجاح",
      });
    } catch (error) {
      console.error("Error saving student:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء حفظ بيانات الطالب",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    setLoading(true);
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
        try {
          const endpoint = activeTab === "finished" ? "deleteFinishedStudent" : "deleteStudent";
          await axios.delete(
            `https://api.lineduc.com/api/${endpoint}/${id}`
          );
          fetchStudents();
          Swal.fire({
            icon: "success",
            title: "تم الحذف!",
            text: "تم حذف الطالب بنجاح.",
          });
        } catch (error) {
          console.error("Error deleting student:", error);
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "حدث خطأ أثناء حذف الطالب",
          });
        }
      }
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="students-page">
      <div className="page-header">
        <h1 className="d-flex justify-content-center ">إدارة الطلاب</h1>
        <div className="header-actions">
          {activeTab !== "all" && (
            <Button
              variant="primary"
              className="add-button"
              onClick={() => handleShowModal({}, "add")}
            >
              <i className="fas fa-user-plus"></i>
              {activeTab === "reading" ? "إضافة طالب قراءة" : "إضافة طالب منتهي"}
            </Button>
          )}
          <div className="student-count">
            <i className="fas fa-users"></i>
            <span>{students.length} طالب</span>
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        <Nav variant="tabs" className="student-tabs" activeKey={activeTab} onSelect={setActiveTab}>
          <Nav.Item>
            <Nav.Link eventKey="all">جميع الطلاب</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="reading">طلاب القراءة</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="finished">الطلاب المنتهين</Nav.Link>
          </Nav.Item>
        </Nav>

        {loading ? (
          <div className="loading-state">
            <Spinner animation="border" variant="primary" />
            <p>جاري التحميل...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-user-graduate"></i>
            <p>لا يوجد طلاب حالياً</p>
            {activeTab !== "all" && (
              <Button
                variant="primary"
                onClick={() => handleShowModal({}, "add")}
              >
                إضافة طالب جديد
              </Button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <Table hover>
              <thead>
                <tr>
                  <th>
                    <i className="fas fa-user"></i>
                    الاسم
                  </th>
                  {activeTab === "all" && (
                    <th>
                      <i className="fas fa-layer-group"></i>
                      الفئة
                    </th>
                  )}
                  <th>
                    <i className="fas fa-city"></i>
                    المدينة
                  </th>
                  <th>
                    <i className="fas fa-book"></i>
                    الرواية
                  </th>
                  {(activeTab === "reading" || activeTab === "all") && (
                    <>
                      <th>
                        <i className="fas fa-bookmark"></i>
                        الصفحة الحالية
                      </th>
                      <th>
                        <i className="fas fa-tasks"></i>
                        آخر اختبار
                      </th>
                    </>
                  )}
                  <th>
                    <i className="fas fa-calendar"></i>
                    تاريخ البدء
                  </th>
                  {(activeTab === "finished" || activeTab === "all") && (
                    <th>
                      <i className="fas fa-flag-checkered"></i>
                      تاريخ الإنتهاء
                    </th>
                  )}
                  <th>
                    <i className="fas fa-cog"></i>
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <div className="student-info">
                        {renderAvatar(student)}
                        <span>{student.name}</span>
                      </div>
                    </td>
                    {activeTab === "all" && (
                      <td>
                        <span className={`status-badge ${student.type === 'reading' ? 'reading' : 'finished'}`}>
                          {student.type === 'reading' ? 'طالب قراءة' : 'طالب منتهي'}
                        </span>
                      </td>
                    )}
                    <td>{student.city}</td>
                    <td>{student.riwayah}</td>
                    {(activeTab === "reading" || activeTab === "all") && (
                      <>
                        <td>{student.currentPage || "غير محدد"}</td>
                        <td>{student.lastQuiz || "غير محدد"}</td>
                      </>
                    )}
                    <td>{new Date(student.startDate).toLocaleDateString("ar-EG")}</td>
                    {(activeTab === "finished" || activeTab === "all") && (
                      <td>{student.endDate ? new Date(student.endDate).toLocaleDateString("ar-EG") : "غير محدد"}</td>
                    )}
                    <td>
                      <div className="action-buttons">
                        <div className="btn-group">
                          <Button
                            variant="light"
                            className="action-btn view"
                            title="عرض"
                            onClick={() => handleShowModal(student, "view")}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
</svg>
                          </Button>
                          <Button
                            variant="light"
                            className="action-btn edit"
                            title="تعديل"
                            onClick={() => handleShowModal(student, "edit")}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
</svg>
                          </Button>
                          <Button
                            variant="light"
                            className="action-btn delete"
                            title="حذف"
                            onClick={() => handleDeleteStudent(student._id)}
                          >
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
</svg>
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i
              className={`fas ${
                modalMode === "add"
                  ? "fa-user-plus"
                  : modalMode === "edit"
                  ? "fa-user-edit"
                  : "fa-user"
              }`}
            ></i>
            {modalMode === "add"
              ? activeTab === "reading" 
                ? "إضافة طالب قراءة جديد"
                : "إضافة طالب منتهي جديد"
              : modalMode === "edit"
              ? "تعديل بيانات الطالب"
              : "عرض بيانات الطالب"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="modal-image-container">
            {selectedStudent.studentImage || selectedStudent.finishedStudentImage ? (
              <img
                src={`https://api.lineduc.com/studentsImages/${selectedStudent.studentImage || selectedStudent.finishedStudentImage}`}
                alt="Student"
                className="modal-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div 
                className="modal-avatar-placeholder"
                style={{ backgroundColor: getAvatarColor(selectedStudent.name) }}
              >
                {getInitials(selectedStudent.name)}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>الاسم</label>
            <input
              type="text"
              className="form-control"
              value={selectedStudent.name || ""}
              onChange={(e) =>
                setSelectedStudent({ ...selectedStudent, name: e.target.value })
              }
              disabled={modalMode === "view"}
            />
          </div>

          <div className="form-group">
            <label>المدينة</label>
            <input
              type="text"
              className="form-control"
              value={selectedStudent.city || ""}
              onChange={(e) =>
                setSelectedStudent({ ...selectedStudent, city: e.target.value })
              }
              disabled={modalMode === "view"}
            />
          </div>

          <div className="form-group">
            <label>الرواية</label>
            <input
              type="text"
              className="form-control"
              value={selectedStudent.riwayah || ""}
              onChange={(e) =>
                setSelectedStudent({ ...selectedStudent, riwayah: e.target.value })
              }
              disabled={modalMode === "view"}
            />
          </div>

          {(activeTab === "reading" || (activeTab === "all" && !selectedStudent.endDate)) && (
            <>
              <div className="form-group">
                <label>الصفحة الحالية</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedStudent.currentPage || ""}
                  onChange={(e) =>
                    setSelectedStudent({ ...selectedStudent, currentPage: e.target.value })
                  }
                  disabled={modalMode === "view"}
                />
              </div>

              <div className="form-group">
                <label>آخر اختبار</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedStudent.lastQuiz || ""}
                  onChange={(e) =>
                    setSelectedStudent({ ...selectedStudent, lastQuiz: e.target.value })
                  }
                  disabled={modalMode === "view"}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>تاريخ البدء</label>
            <input
              type="date"
              className="form-control"
              value={selectedStudent.startDate ? new Date(selectedStudent.startDate).toISOString().split('T')[0] : ""}
              onChange={(e) =>
                setSelectedStudent({ ...selectedStudent, startDate: e.target.value })
              }
              disabled={modalMode === "view"}
            />
          </div>

          {(activeTab === "finished" || (activeTab === "all" && selectedStudent.endDate)) && (
            <div className="form-group">
              <label>تاريخ الإنتهاء</label>
              <input
                type="date"
                className="form-control"
                value={selectedStudent.endDate ? new Date(selectedStudent.endDate).toISOString().split('T')[0] : ""}
                onChange={(e) =>
                  setSelectedStudent({ ...selectedStudent, endDate: e.target.value })
                }
                disabled={modalMode === "view"}
              />
            </div>
          )}

          <div className="form-group">
            <label>ملاحظات</label>
            <textarea
              className="form-control"
              rows="3"
              value={selectedStudent.note || ""}
              onChange={(e) =>
                setSelectedStudent({ ...selectedStudent, note: e.target.value })
              }
              disabled={modalMode === "view"}
            />
          </div>

          {modalMode !== "view" && (
            <div className="form-group">
              <label>صورة الطالب</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setSelectedStudent({
                      ...selectedStudent,
                      studentImage: file,
                    });
                  }
                }}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            إغلاق
          </Button>
          {modalMode !== "view" && (
            <Button variant="primary" onClick={handleSaveStudent} disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                modalMode === "add" ? "إضافة" : "حفظ التغييرات"
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .students-page {
          padding: 2rem;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .add-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-weight: 500;
        }

        .student-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .content-wrapper {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          padding: 1.5rem;
        }

        .student-tabs {
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #e9ecef;
        }

        .nav-link {
          color: #6c757d;
          font-weight: 500;
          padding: 0.75rem 1rem;
          border: none;
          background: none;
          transition: all 0.2s;
        }

        .nav-link:hover {
          color: #0d6efd;
        }

        .nav-link.active {
          color: #0d6efd;
          border-bottom: 2px solid #0d6efd;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6c757d;
        }

        .empty-state i {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #dee2e6;
        }

        .table-container {
          overflow-x: auto;
        }

        .student-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .student-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .student-avatar-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #6c757d;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
        }

        .btn-group {
          display: flex;
          background: #f8f9fa;
          border-radius: 8px;
          padding: 4px;
          gap: 4px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
          border: none;
          background: white;
          color: #6c757d;
        }

        .action-btn:hover {
          transform: translateY(-1px);
        }

        .action-btn.view:hover {
          background: #e3f2fd;
          color: #2196f3;
        }

        .action-btn.edit:hover {
          background: #fff3e0;
          color: #ff9800;
        }

        .action-btn.delete:hover {
          background: #ffebee;
          color: #f44336;
        }

        .action-btn i {
          font-size: 1rem;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-badge.reading {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        .status-badge.finished {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .modal-image-container {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .modal-image {
          max-width: 200px;
          border-radius: 8px;
        }

        .modal-avatar-placeholder {
          width: 200px;
          height: 200px;
          margin: 0 auto;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          font-weight: 600;
          color: white;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #495057;
        }

        .form-control {
          border-radius: 6px;
          border: 1px solid #ced4da;
          padding: 0.5rem 0.75rem;
          transition: border-color 0.2s;
        }

        .form-control:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
        }

        th {
          font-weight: 600;
          color: #495057;
          padding: 1rem !important;
        }

        th i {
          margin-right: 0.5rem;
          color: #6c757d;
        }

        td {
          vertical-align: middle;
          padding: 1rem !important;
        }

        tr:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
} 