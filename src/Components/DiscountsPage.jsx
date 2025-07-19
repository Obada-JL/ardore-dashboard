import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosConfig';
import { showSuccessToast, showErrorToast, showLoading, closeLoading, showConfirmDialog } from '../utils/toast';
import { Modal, Form, Button, Table, Alert, Card, Row, Col, Badge, Pagination } from 'react-bootstrap';

const DiscountsPage = () => {
    const [discounts, setDiscounts] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchFilters, setSearchFilters] = useState({
        status: '',
        type: ''
    });

    const [formData, setFormData] = useState({
        code: '',
        name: { ar: '', tr: '' },
        description: { ar: '', tr: '' },
        discountType: 'percentage',
        discountValue: '',
        maxDiscountAmount: '',
        minOrderAmount: '',
        applicableTo: 'all',
        usageLimit: '',
        perUserLimit: '1',
        startDate: '',
        endDate: '',
        isActive: true
    });

    useEffect(() => {
        fetchDiscounts();
        fetchStats();
    }, [currentPage, searchFilters]);

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 10,
                ...searchFilters
            });

            const response = await axiosInstance.get(`${API_ENDPOINTS.GET_DISCOUNTS}?${params}`);
            const data = response.data;

            setDiscounts(data.discounts || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching discounts:', error);
            showErrorToast('فشل في تحميل الخصومات');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.GET_DISCOUNT_STATS);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleBilingualInputChange = (e, field, lang) => {
        const { value } = e.target;
        setFormData({
            ...formData,
            [field]: {
                ...formData[field],
                [lang]: value
            }
        });
    };

    const resetForm = () => {
        setFormData({
            code: '',
            name: { ar: '', tr: '' },
            description: { ar: '', tr: '' },
            discountType: 'percentage',
            discountValue: '',
            maxDiscountAmount: '',
            minOrderAmount: '',
            applicableTo: 'all',
            usageLimit: '',
            perUserLimit: '1',
            startDate: '',
            endDate: '',
            isActive: true
        });
        setEditingDiscount(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.code) {
            showErrorToast('يرجى إدخال رمز الخصم');
            return;
        }

        if (!formData.name.ar && !formData.name.tr) {
            showErrorToast('يرجى إدخال اسم الخصم بلغة واحدة على الأقل');
            return;
        }

        if (!formData.discountValue) {
            showErrorToast('يرجى إدخال قيمة الخصم');
            return;
        }

        if (!formData.startDate || !formData.endDate) {
            showErrorToast('يرجى إدخال تواريخ بداية ونهاية الخصم');
            return;
        }

        try {
            showLoading(editingDiscount ? 'جاري تحديث الخصم...' : 'جاري إضافة الخصم...');

            // Prepare data
            const discountData = { ...formData };

            // Convert empty strings to null for optional fields
            if (!discountData.maxDiscountAmount) discountData.maxDiscountAmount = null;
            if (!discountData.usageLimit) discountData.usageLimit = null;

            if (editingDiscount) {
                await axiosInstance.put(API_ENDPOINTS.UPDATE_DISCOUNT(editingDiscount._id), discountData);
                showSuccessToast('تم تحديث الخصم بنجاح');
            } else {
                await axiosInstance.post(API_ENDPOINTS.CREATE_DISCOUNT, discountData);
                showSuccessToast('تم إضافة الخصم بنجاح');
            }

            setShowModal(false);
            resetForm();
            fetchDiscounts();
            fetchStats();
        } catch (error) {
            console.error('Error saving discount:', error);
            showErrorToast(error.response?.data?.message || 'حدث خطأ أثناء حفظ الخصم');
        } finally {
            closeLoading();
        }
    };

    const handleEdit = (discount) => {
        setEditingDiscount(discount);
        setFormData({
            code: discount.code,
            name: discount.name || { ar: '', tr: '' },
            description: discount.description || { ar: '', tr: '' },
            discountType: discount.discountType,
            discountValue: discount.discountValue,
            maxDiscountAmount: discount.maxDiscountAmount || '',
            minOrderAmount: discount.minOrderAmount || '',
            applicableTo: discount.applicableTo,
            usageLimit: discount.usageLimit || '',
            perUserLimit: discount.perUserLimit,
            startDate: new Date(discount.startDate).toISOString().slice(0, 16),
            endDate: new Date(discount.endDate).toISOString().slice(0, 16),
            isActive: discount.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (discount) => {
        const result = await showConfirmDialog({
            title: 'حذف الخصم',
            text: `هل أنت متأكد من حذف الخصم "${discount.code}"؟`,
            icon: 'warning',
            confirmButtonText: 'نعم، احذف!',
            cancelButtonText: 'إلغاء'
        });

        if (result.isConfirmed) {
            try {
                showLoading('جاري حذف الخصم...');
                await axiosInstance.delete(API_ENDPOINTS.DELETE_DISCOUNT(discount._id));
                showSuccessToast('تم حذف الخصم بنجاح');
                fetchDiscounts();
                fetchStats();
            } catch (error) {
                console.error('Error deleting discount:', error);
                showErrorToast('فشل في حذف الخصم');
            } finally {
                closeLoading();
            }
        }
    };

    const formatDiscountValue = (discount) => {
        if (discount.discountType === 'percentage') {
            return `${discount.discountValue}%`;
        } else {
            return `$${discount.discountValue}`;
        }
    };

    const getDiscountStatus = (discount) => {
        const now = new Date();
        const startDate = new Date(discount.startDate);
        const endDate = new Date(discount.endDate);

        if (!discount.isActive) {
            return <Badge bg="secondary">غير نشط</Badge>;
        } else if (now < startDate) {
            return <Badge bg="info">لم يبدأ</Badge>;
        } else if (now > endDate) {
            return <Badge bg="danger">منتهي</Badge>;
        } else if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
            return <Badge bg="warning">مستنفد</Badge>;
        } else {
            return <Badge bg="success">نشط</Badge>;
        }
    };

    const renderLanguageTabs = () => {
        const [activeTab, setActiveTab] = useState('ar');

        return (
            <div>
                <div className="mb-3">
                    <Button
                        variant={activeTab === 'ar' ? 'primary' : 'outline-primary'}
                        size="sm"
                        className="me-2"
                        onClick={() => setActiveTab('ar')}
                    >
                        العربية
                    </Button>
                    <Button
                        variant={activeTab === 'tr' ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => setActiveTab('tr')}
                    >
                        Türkçe
                    </Button>
                </div>

                {['ar', 'tr'].map(lang => (
                    <div key={lang} style={{ display: activeTab === lang ? 'block' : 'none' }}>
                        <Form.Group className="mb-3">
                            <Form.Label>اسم الخصم ({lang === 'ar' ? 'العربية' : lang === 'tr' ? 'Türkçe' : ''})</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.name[lang]}
                                onChange={(e) => handleBilingualInputChange(e, 'name', lang)}
                                placeholder={`اسم الخصم باللغة ${lang === 'ar' ? 'العربية' : lang === 'tr' ? 'التركية' : ''}`}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>وصف الخصم ({lang === 'ar' ? 'العربية' : lang === 'tr' ? 'Türkçe' : ''})</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.description[lang]}
                                onChange={(e) => handleBilingualInputChange(e, 'description', lang)}
                                placeholder={`وصف الخصم باللغة ${lang === 'ar' ? 'العربية' : lang === 'tr' ? 'التركية' : ''}`}
                            />
                        </Form.Group>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>إدارة الخصومات</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    إضافة خصم جديد
                </Button>
            </div>

            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card>
                        <Card.Body>
                            <Card.Title>إجمالي الخصومات</Card.Title>
                            <h3 className="text-primary">{stats.total || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card>
                        <Card.Body>
                            <Card.Title>الخصومات النشطة</Card.Title>
                            <h3 className="text-success">{stats.active || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card>
                        <Card.Body>
                            <Card.Title>الخصومات المنتهية</Card.Title>
                            <h3 className="text-danger">{stats.expired || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card>
                        <Card.Body>
                            <Card.Title>نسبة الاستخدام</Card.Title>
                            <h3 className="text-info">
                                {stats.byType && stats.byType.length > 0
                                    ? Math.round((stats.byType.reduce((acc, curr) => acc + curr.totalUsage, 0) / stats.total) * 100) || 0
                                    : 0}%
                            </h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>حالة الخصم</Form.Label>
                                <Form.Select
                                    value={searchFilters.status}
                                    onChange={(e) => setSearchFilters(prev => ({ ...prev, status: e.target.value }))}
                                >
                                    <option value="">جميع الحالات</option>
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>نوع الخصم</Form.Label>
                                <Form.Select
                                    value={searchFilters.type}
                                    onChange={(e) => setSearchFilters(prev => ({ ...prev, type: e.target.value }))}
                                >
                                    <option value="">جميع الأنواع</option>
                                    <option value="percentage">نسبة مئوية</option>
                                    <option value="fixed">مبلغ ثابت</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Discounts Table */}
            <Card>
                <Card.Body>
                    {loading ? (
                        <div className="text-center">جاري التحميل...</div>
                    ) : discounts.length === 0 ? (
                        <Alert variant="info">لا توجد خصومات</Alert>
                    ) : (
                        <>
                            <Table responsive striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>الرمز</th>
                                        <th>الاسم</th>
                                        <th>النوع</th>
                                        <th>القيمة</th>
                                        <th>الاستخدام</th>
                                        <th>الحالة</th>
                                        <th>تاريخ الانتهاء</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {discounts.map((discount) => (
                                        <tr key={discount._id}>
                                            <td>
                                                <strong>{discount.code}</strong>
                                            </td>
                                            <td>
                                                {discount.name?.ar || discount.name?.tr || '-'}
                                            </td>
                                            <td>
                                                <Badge bg={discount.discountType === 'percentage' ? 'info' : 'warning'}>
                                                    {discount.discountType === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                                                </Badge>
                                            </td>
                                            <td>{formatDiscountValue(discount)}</td>
                                            <td>
                                                {discount.usageCount} / {discount.usageLimit || '∞'}
                                            </td>
                                            <td>{getDiscountStatus(discount)}</td>
                                            <td>
                                                {new Date(discount.endDate).toLocaleDateString('ar-SA')}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleEdit(discount)}
                                                >
                                                    تعديل
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(discount)}
                                                >
                                                    حذف
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center">
                                    <Pagination>
                                        <Pagination.Prev
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        />
                                        {[...Array(totalPages)].map((_, index) => (
                                            <Pagination.Item
                                                key={index + 1}
                                                active={currentPage === index + 1}
                                                onClick={() => setCurrentPage(index + 1)}
                                            >
                                                {index + 1}
                                            </Pagination.Item>
                                        ))}
                                        <Pagination.Next
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={() => { setShowModal(false); resetForm(); }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingDiscount ? 'تعديل الخصم' : 'إضافة خصم جديد'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>رمز الخصم *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="مثال: SAVE20"
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>نوع الخصم *</Form.Label>
                                    <Form.Select
                                        name="discountType"
                                        value={formData.discountType}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="percentage">نسبة مئوية</option>
                                        <option value="fixed">مبلغ ثابت</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        {renderLanguageTabs()}

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>قيمة الخصم *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>الحد الأقصى للخصم</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="maxDiscountAmount"
                                        value={formData.maxDiscountAmount}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="اتركه فارغاً لعدم التحديد"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>الحد الأدنى للطلب</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="minOrderAmount"
                                        value={formData.minOrderAmount}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>عدد مرات الاستخدام المسموح</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="usageLimit"
                                        value={formData.usageLimit}
                                        onChange={handleInputChange}
                                        min="1"
                                        placeholder="اتركه فارغاً للاستخدام غير المحدود"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>عدد مرات الاستخدام لكل مستخدم</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="perUserLimit"
                                        value={formData.perUserLimit}
                                        onChange={handleInputChange}
                                        min="1"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>التطبيق على</Form.Label>
                                    <Form.Select
                                        name="applicableTo"
                                        value={formData.applicableTo}
                                        onChange={handleInputChange}
                                    >
                                        <option value="all">جميع المنتجات</option>
                                        <option value="products">منتجات محددة</option>
                                        <option value="categories">فئات محددة</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>تاريخ البداية *</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>تاريخ النهاية *</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                label="نشط"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                            إلغاء
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingDiscount ? 'تحديث' : 'إضافة'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default DiscountsPage; 