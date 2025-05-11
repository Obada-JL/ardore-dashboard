import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, ListGroup, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { showErrorToast, showSuccessToast, showConfirmDialog } from '../utils/toast';
import { API_ENDPOINTS } from '../config/api';

export default function AboutListPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [about, setAbout] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchAboutData();
    }, []);

    const fetchAboutData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.GET_ABOUT);
            setAbout(response.data);
        } catch (error) {
            if (error.response?.status === 404) {
                // No about data exists yet
                setAbout(null);
            } else {
                showErrorToast('خطأ في تحميل بيانات صفحة حول');
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = () => {
        showConfirmDialog({
            title: "هل أنت متأكد؟",
            text: "سيتم حذف بيانات صفحة حول نهائياً",
            icon: "warning",
            confirmButtonText: "نعم، حذف",
            cancelButtonText: "إلغاء",
        }).then((result) => {
            if (result.isConfirmed) {
                handleDelete();
            }
        });
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(API_ENDPOINTS.DELETE_ABOUT);
            showSuccessToast('تم حذف بيانات صفحة حول بنجاح');
            setAbout(null);
        } catch (error) {
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Status code:', error.response.status);
                showErrorToast(`حدث خطأ: ${error.response.data.message || 'خطأ غير معروف'}`);
            } else {
                showErrorToast('حدث خطأ أثناء حذف البيانات');
                console.error(error);
            }
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    if (!about) {
        return (
            <Container className="py-4" dir="rtl">
                <Card className="text-center p-5 shadow-sm">
                    <Card.Body>
                        <h3 className="mb-3">لم يتم إضافة معلومات صفحة حول بعد</h3>
                        <p className="text-muted mb-4">قم بإضافة معلومات جديدة عن الشركة</p>
                        <Button as={Link} to="/about/edit" variant="primary">
                            إضافة معلومات
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // Extract base URL for images
    const baseUrl = API_ENDPOINTS.GET_ABOUT.split('/api')[0];

    return (
        <Container className="py-4" dir="rtl">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>معلومات صفحة حول</h2>
                <div>
                    <Button as={Link} to="/about/edit" variant="primary" className="ms-2">
                        تعديل المعلومات
                    </Button>
                    {/* <Button variant="danger" onClick={handleDeleteConfirm} className="ms-2">
                        حذف
                    </Button> */}
                </div>
            </div>

            <Row>
                <Col md={8}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Header as="h5">القسم الرئيسي</Card.Header>
                        <Card.Body>
                            {about.mainSection?.image && (
                                <div className="text-center mb-4">
                                    <img
                                        src={`${baseUrl}${about.mainSection.image}`}
                                        alt="صورة القسم الرئيسي"
                                        className="img-fluid rounded"
                                        style={{ maxHeight: '300px' }}
                                    />
                                </div>
                            )}
                            <h3 className="mb-3">{about.mainSection?.title?.ar}</h3>
                            <p className="text-muted">{about.mainSection?.title?.en}</p>
                            <div className="mt-4">
                                <h5>الوصف:</h5>
                                <p>{about.mainSection?.description?.ar}</p>
                                <p className="text-muted">{about.mainSection?.description?.en}</p>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4 shadow-sm">
                        <Card.Header as="h5">الوصف العام</Card.Header>
                        <Card.Body>
                            <h5>عربي:</h5>
                            <p>{about.description?.ar}</p>
                            <h5 className="mt-3">إنجليزي:</h5>
                            <p className="text-muted">{about.description?.en}</p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="mb-4 shadow-sm">
                        <Card.Header as="h5">معلومات الاتصال</Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <strong>الموقع:</strong>
                                <div>{about.contactInfo?.location?.ar}</div>
                                <div className="text-muted small">{about.contactInfo?.location?.en}</div>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>البريد الإلكتروني:</strong>
                                <div><a href={`mailto:${about.contactInfo?.email}`}>{about.contactInfo?.email}</a></div>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>رقم الهاتف:</strong>
                                <div><a href={`tel:${about.contactInfo?.phone}`}>{about.contactInfo?.phone}</a></div>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>

                    <Card className="shadow-sm">
                        <Card.Header as="h5">وسائل التواصل الاجتماعي</Card.Header>
                        <ListGroup variant="flush">
                            {about.socialMediaLinks?.instagram && (
                                <ListGroup.Item>
                                    <strong>انستغرام:</strong>
                                    <div>
                                        <a href={about.socialMediaLinks.instagram} target="_blank" rel="noreferrer">
                                            {about.socialMediaLinks.instagram}
                                        </a>
                                    </div>
                                </ListGroup.Item>
                            )}
                            {about.socialMediaLinks?.facebook && (
                                <ListGroup.Item>
                                    <strong>فيسبوك:</strong>
                                    <div>
                                        <a href={about.socialMediaLinks.facebook} target="_blank" rel="noreferrer">
                                            {about.socialMediaLinks.facebook}
                                        </a>
                                    </div>
                                </ListGroup.Item>
                            )}
                            {about.socialMediaLinks?.snapchat && (
                                <ListGroup.Item>
                                    <strong>سناب شات:</strong>
                                    <div>
                                        <a href={about.socialMediaLinks.snapchat} target="_blank" rel="noreferrer">
                                            {about.socialMediaLinks.snapchat}
                                        </a>
                                    </div>
                                </ListGroup.Item>
                            )}
                            {about.socialMediaLinks?.tiktok && (
                                <ListGroup.Item>
                                    <strong>تيك توك:</strong>
                                    <div>
                                        <a href={about.socialMediaLinks.tiktok} target="_blank" rel="noreferrer">
                                            {about.socialMediaLinks.tiktok}
                                        </a>
                                    </div>
                                </ListGroup.Item>
                            )}
                            {!about.socialMediaLinks?.instagram &&
                                !about.socialMediaLinks?.facebook &&
                                !about.socialMediaLinks?.snapchat &&
                                !about.socialMediaLinks?.tiktok && (
                                    <ListGroup.Item className="text-center text-muted py-3">
                                        لا توجد روابط تواصل اجتماعي
                                    </ListGroup.Item>
                                )}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
} 