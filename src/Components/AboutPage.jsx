import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { showErrorToast, showSuccessToast } from '../utils/toast';
import { API_ENDPOINTS } from '../config/api';

export default function AboutPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isNewRecord, setIsNewRecord] = useState(false);
    const [about, setAbout] = useState({
        mainSection: {
            image: '',
            title: { en: '', ar: '' },
            description: { en: '', ar: '' }
        },
        socialMediaLinks: {
            instagram: '',
            facebook: '',
            snapchat: '',
            tiktok: ''
        },
        contactInfo: {
            location: { en: '', ar: '' },
            email: '',
            phone: ''
        },
        description: { en: '', ar: '' }
    });
    const [imagePreview, setImagePreview] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchAboutData();
    }, []);

    const fetchAboutData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.GET_ABOUT);
            if (response.data && response.data.mainSection) {
                setAbout(response.data);
                setIsNewRecord(false);
                if (response.data.mainSection.image) {
                    // Extract base URL for images
                    const baseUrl = API_ENDPOINTS.GET_ABOUT.split('/api')[0];
                    setImagePreview(`${baseUrl}${response.data.mainSection.image}`);
                }
            }
        } catch (error) {
            if (error.response?.status === 404) {
                // No about data exists yet, keep the default state
                setIsNewRecord(true);
                console.log("No about data found. Creating new record.");
            } else {
                showErrorToast('خطأ في تحميل بيانات صفحة حول');
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e, section, field, language) => {
        if (language) {
            setAbout({
                ...about,
                [section]: {
                    ...about[section],
                    [field]: {
                        ...about[section]?.[field],
                        [language]: e.target.value
                    }
                }
            });
        } else {
            setAbout({
                ...about,
                [section]: {
                    ...about[section],
                    [field]: e.target.value
                }
            });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formData = new FormData();

            // Add image file if selected
            if (selectedFile) {
                formData.append('aboutImage', selectedFile);
            }

            // Add main section data
            formData.append('mainSection[title][en]', about.mainSection?.title?.en || '');
            formData.append('mainSection[title][ar]', about.mainSection?.title?.ar || '');
            formData.append('mainSection[description][en]', about.mainSection?.description?.en || '');
            formData.append('mainSection[description][ar]', about.mainSection?.description?.ar || '');

            // Add social media links
            formData.append('socialMediaLinks[instagram]', about.socialMediaLinks?.instagram || '');
            formData.append('socialMediaLinks[facebook]', about.socialMediaLinks?.facebook || '');
            formData.append('socialMediaLinks[snapchat]', about.socialMediaLinks?.snapchat || '');
            formData.append('socialMediaLinks[tiktok]', about.socialMediaLinks?.tiktok || '');

            // Add contact info
            formData.append('contactInfo[location][en]', about.contactInfo?.location?.en || '');
            formData.append('contactInfo[location][ar]', about.contactInfo?.location?.ar || '');
            formData.append('contactInfo[email]', about.contactInfo?.email || '');
            formData.append('contactInfo[phone]', about.contactInfo?.phone || '');

            // Add description
            formData.append('description[en]', about.description?.en || '');
            formData.append('description[ar]', about.description?.ar || '');

            // When using axiosInstance, we don't need to manually add the token header
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            // Use ADD_ABOUT for new records, UPDATE_ABOUT for existing ones
            const endpoint = isNewRecord ? API_ENDPOINTS.ADD_ABOUT : API_ENDPOINTS.UPDATE_ABOUT;
            const response = await axiosInstance.post(endpoint, formData, config);
            console.log('Server response:', response.data);

            const successMessage = isNewRecord
                ? 'تم إضافة بيانات صفحة حول بنجاح'
                : 'تم تحديث بيانات صفحة حول بنجاح';
            showSuccessToast(successMessage);

            // Redirect to the list page after successful submission
            navigate('/about');
        } catch (error) {
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Status code:', error.response.status);

                showErrorToast(`حدث خطأ: ${error.response.data.message || 'خطأ غير معروف'}`);
            } else {
                showErrorToast('حدث خطأ أثناء حفظ البيانات');
                console.error(error);
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    // Make sure we have default values for all fields to avoid undefined errors
    const safeAbout = {
        mainSection: {
            image: about.mainSection?.image || '',
            title: {
                en: about.mainSection?.title?.en || '',
                ar: about.mainSection?.title?.ar || ''
            },
            description: {
                en: about.mainSection?.description?.en || '',
                ar: about.mainSection?.description?.ar || ''
            }
        },
        socialMediaLinks: {
            instagram: about.socialMediaLinks?.instagram || '',
            facebook: about.socialMediaLinks?.facebook || '',
            snapchat: about.socialMediaLinks?.snapchat || '',
            tiktok: about.socialMediaLinks?.tiktok || ''
        },
        contactInfo: {
            location: {
                en: about.contactInfo?.location?.en || '',
                ar: about.contactInfo?.location?.ar || ''
            },
            email: about.contactInfo?.email || '',
            phone: about.contactInfo?.phone || ''
        },
        description: {
            en: about.description?.en || '',
            ar: about.description?.ar || ''
        }
    };

    return (
        <Container className="py-4" dir="rtl">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">{isNewRecord ? 'إضافة معلومات جديدة' : 'تعديل معلومات صفحة حول'}</h2>
                {!isNewRecord && (
                    <Button variant="secondary" onClick={() => navigate('/about')}>
                        العودة للعرض
                    </Button>
                )}
            </div>

            <Form onSubmit={handleSubmit}>
                <Card className="mb-4 shadow-sm">
                    <Card.Header as="h5">القسم الرئيسي</Card.Header>
                    <Card.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>الصورة الرئيسية</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                required={isNewRecord}
                            />
                            {imagePreview && (
                                <div className="mt-2">
                                    <img
                                        src={imagePreview}
                                        alt="معاينة"
                                        className="img-thumbnail"
                                        style={{ maxHeight: '200px' }}
                                    />
                                </div>
                            )}
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>العنوان (عربي)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={safeAbout.mainSection.title.ar}
                                        onChange={(e) => handleInputChange(e, 'mainSection', 'title', 'ar')}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>العنوان (إنجليزي)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={safeAbout.mainSection.title.en}
                                        onChange={(e) => handleInputChange(e, 'mainSection', 'title', 'en')}
                                        required
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
                                        value={safeAbout.mainSection.description.ar}
                                        onChange={(e) => handleInputChange(e, 'mainSection', 'description', 'ar')}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>الوصف (إنجليزي)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={safeAbout.mainSection.description.en}
                                        onChange={(e) => handleInputChange(e, 'mainSection', 'description', 'en')}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="mb-4 shadow-sm">
                    <Card.Header as="h5">وسائل التواصل الاجتماعي</Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>انستغرام</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={safeAbout.socialMediaLinks.instagram}
                                        onChange={(e) => handleInputChange(e, 'socialMediaLinks', 'instagram')}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>فيسبوك</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={safeAbout.socialMediaLinks.facebook}
                                        onChange={(e) => handleInputChange(e, 'socialMediaLinks', 'facebook')}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>سناب شات</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={safeAbout.socialMediaLinks.snapchat}
                                        onChange={(e) => handleInputChange(e, 'socialMediaLinks', 'snapchat')}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>تيك توك</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={safeAbout.socialMediaLinks.tiktok}
                                        onChange={(e) => handleInputChange(e, 'socialMediaLinks', 'tiktok')}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="mb-4 shadow-sm">
                    <Card.Header as="h5">معلومات الاتصال</Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>الموقع (عربي)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={safeAbout.contactInfo.location.ar}
                                        onChange={(e) => handleInputChange(e, 'contactInfo', 'location', 'ar')}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>الموقع (إنجليزي)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={safeAbout.contactInfo.location.en}
                                        onChange={(e) => handleInputChange(e, 'contactInfo', 'location', 'en')}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>البريد الإلكتروني</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={safeAbout.contactInfo.email}
                                        onChange={(e) => handleInputChange(e, 'contactInfo', 'email')}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>رقم الهاتف</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={safeAbout.contactInfo.phone}
                                        onChange={(e) => handleInputChange(e, 'contactInfo', 'phone')}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="mb-4 shadow-sm">
                    <Card.Header as="h5">الوصف العام</Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>الوصف (عربي)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={safeAbout.description.ar}
                                        onChange={(e) => handleInputChange(e, 'description', 'ar')}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>الوصف (إنجليزي)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={safeAbout.description.en}
                                        onChange={(e) => handleInputChange(e, 'description', 'en')}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <div className="d-grid">
                    <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                        disabled={submitting}
                        className="py-2"
                    >
                        {submitting ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                جاري الحفظ...
                            </>
                        ) : isNewRecord ? 'إضافة معلومات' : 'حفظ التغييرات'}
                    </Button>
                </div>
            </Form>
        </Container>
    );
} 