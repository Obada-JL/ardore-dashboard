import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { useLanguage } from '../context/LanguageContext';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosConfig';
import { showConfirmDialog, showSuccessToast, showErrorToast } from '../utils/toast';

const OrdersPage = () => {
    const { t, getBilingualText, isRTL } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [stats, setStats] = useState({});

    const [newOrder, setNewOrder] = useState({
        customer: {
            name: '',
            email: '',
            phone: '',
            address: {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
            }
        },
        items: [{ product: '', quantity: 1, size: 30, quality: '' }],
        paymentMethod: 'cash',
        notes: ''
    });

    useEffect(() => {
        fetchOrders();
        fetchProducts();
        fetchStats();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.GET_ORDERS);
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            showErrorToast(t('error'));
        }
    };

    const fetchProducts = async () => {
        try {
            // Try perfumes first, then products as fallback
            let response;
            try {
                response = await axiosInstance.get(API_ENDPOINTS.GET_PERFUMES);
            } catch (perfumeError) {
                response = await axiosInstance.get(API_ENDPOINTS.GET_PRODUCTS);
            }
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        }
        setLoading(false);
    };

    const fetchStats = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.GET_ORDER_STATS);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            confirmed: 'info',
            processing: 'primary',
            shipped: 'secondary',
            delivered: 'success',
            cancelled: 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{t(status) || status}</Badge>;
    };

    const getPaymentStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            paid: 'success',
            failed: 'danger',
            refunded: 'secondary'
        };
        return <Badge bg={variants[status] || 'secondary'}>{t(status) || status}</Badge>;
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        try {
            // Prepare order data with proper data types
            const orderData = {
                ...newOrder,
                items: newOrder.items.map(item => ({
                    ...item,
                    quantity: parseInt(item.quantity),
                    size: parseInt(item.size) || 30, // Ensure size is a number
                    quality: item.quality || 'Standard'
                }))
            };

            await axiosInstance.post(API_ENDPOINTS.CREATE_ORDER, orderData);
            setShowCreateModal(false);
            fetchOrders();
            fetchStats(); // Refresh stats after creating order
            showSuccessToast(t('createSuccess'));
            resetNewOrder();
        } catch (error) {
            console.error('Error creating order:', error);
            showErrorToast(error.response?.data?.message || t('error'));
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await axiosInstance.patch(API_ENDPOINTS.UPDATE_ORDER_STATUS(orderId), { status });
            fetchOrders();
            fetchStats(); // Refresh stats after status update
            showSuccessToast(t('updateSuccess'));
        } catch (error) {
            console.error('Error updating order status:', error);
            showErrorToast(t('error'));
        }
    };

    const deleteOrder = async (orderId) => {
        showConfirmDialog({
            title: t('deleteConfirm'),
            text: t('deleteConfirmText'),
            icon: 'warning',
            confirmButtonText: t('yes'),
            cancelButtonText: t('no'),
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(API_ENDPOINTS.DELETE_ORDER(orderId));
                    fetchOrders();
                    fetchStats(); // Refresh stats after deletion
                    showSuccessToast(t('deleteSuccess'));
                } catch (error) {
                    console.error('Error deleting order:', error);
                    showErrorToast(t('error'));
                }
            }
        });
    };

    const resetNewOrder = () => {
        setNewOrder({
            customer: {
                name: '',
                email: '',
                phone: '',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: ''
                }
            },
            items: [{ product: '', quantity: 1, size: 30, quality: '' }],
            paymentMethod: 'cash',
            notes: ''
        });
    };

    const addOrderItem = () => {
        setNewOrder({
            ...newOrder,
            items: [...newOrder.items, { product: '', quantity: 1, size: 30, quality: '' }]
        });
    };

    const removeOrderItem = (index) => {
        const newItems = newOrder.items.filter((_, i) => i !== index);
        setNewOrder({ ...newOrder, items: newItems });
    };

    const updateOrderItem = (index, field, value) => {
        const newItems = [...newOrder.items];
        if (field === 'quantity' || field === 'size') {
            newItems[index][field] = parseInt(value) || (field === 'size' ? 30 : 1);
        } else {
            newItems[index][field] = value;
        }
        setNewOrder({ ...newOrder, items: newItems });
    };

    if (loading) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">{t('loading')}</span>
                    </Spinner>
                    <p className="mt-3">{t('loading')}</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2>{t('orders')}</h2>
                        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                            {t('add')} {t('orders')}
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h5>{t('totalOrders')}</h5>
                            <h3 className="text-primary">{stats.totalOrders || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h5>{t('revenue')}</h5>
                            <h3 className="text-success">${stats.totalRevenue || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h5>{t('pending')}</h5>
                            <h3 className="text-warning">{stats.pendingOrders || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center">
                        <Card.Body>
                            <h5>{t('delivered')}</h5>
                            <h3 className="text-success">{stats.completedOrders || 0}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Orders Table */}
            <Card>
                <Card.Header>
                    <h5 className="mb-0">{t('orders')}</h5>
                </Card.Header>
                <Card.Body>
                    {orders.length === 0 ? (
                        <Alert variant="info" className="text-center">
                            <h4>{t('noOrders')}</h4>
                            <p>{t('noOrdersFound')}</p>
                        </Alert>
                    ) : (
                        <Table responsive striped hover>
                            <thead>
                                <tr>
                                    <th>{t('orderNumber')}</th>
                                    <th>{t('customerName')}</th>
                                    <th>{t('orderDate')}</th>
                                    <th>{t('orderTotal')}</th>
                                    <th>{t('orderStatus')}</th>
                                    <th>{t('paymentStatus')}</th>
                                    <th>{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id}>
                                        <td>{order.orderNumber}</td>
                                        <td>{order.customer?.name}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>${order.totalAmount?.toFixed(2)}</td>
                                        <td>{getStatusBadge(order.status)}</td>
                                        <td>{getPaymentStatusBadge(order.paymentStatus)}</td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowDetailsModal(true);
                                                    }}
                                                >
                                                    {t('view')}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    onClick={() => deleteOrder(order._id)}
                                                >
                                                    {t('delete')}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Create Order Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('add')} {t('orders')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreateOrder}>
                        {/* Customer Information */}
                        <h5>{t('customerInfo')}</h5>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('customerName')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newOrder.customer.name}
                                        onChange={(e) => setNewOrder({
                                            ...newOrder,
                                            customer: { ...newOrder.customer, name: e.target.value }
                                        })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('customerEmail')}</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={newOrder.customer.email}
                                        onChange={(e) => setNewOrder({
                                            ...newOrder,
                                            customer: { ...newOrder.customer, email: e.target.value }
                                        })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('customerPhone')}</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        value={newOrder.customer.phone}
                                        onChange={(e) => setNewOrder({
                                            ...newOrder,
                                            customer: { ...newOrder.customer, phone: e.target.value }
                                        })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('paymentMethod')}</Form.Label>
                                    <Form.Select
                                        value={newOrder.paymentMethod}
                                        onChange={(e) => setNewOrder({ ...newOrder, paymentMethod: e.target.value })}
                                    >
                                        <option value="cash">{t('cash')}</option>
                                        <option value="card">{t('card')}</option>
                                        <option value="bank_transfer">{t('bankTransfer')}</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Customer Address */}
                        <h6>{t('customerAddress')}</h6>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('location')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newOrder.customer.address.street}
                                        onChange={(e) => setNewOrder({
                                            ...newOrder,
                                            customer: {
                                                ...newOrder.customer,
                                                address: { ...newOrder.customer.address, street: e.target.value }
                                            }
                                        })}
                                        placeholder="Street address"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>City</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newOrder.customer.address.city}
                                        onChange={(e) => setNewOrder({
                                            ...newOrder,
                                            customer: {
                                                ...newOrder.customer,
                                                address: { ...newOrder.customer.address, city: e.target.value }
                                            }
                                        })}
                                        placeholder="City"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Order Items */}
                        <h5>{t('orderItems')}</h5>
                        {newOrder.items.map((item, index) => (
                            <Card key={index} className="mb-3">
                                <Card.Body>
                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>{t('productTitle')}</Form.Label>
                                                <Form.Select
                                                    value={item.product}
                                                    onChange={(e) => updateOrderItem(index, 'product', e.target.value)}
                                                    required
                                                >
                                                    <option value="">{t('selectProduct')}</option>
                                                    {products.map((product) => (
                                                        <option key={product._id} value={product._id}>
                                                            {getBilingualText(product.title)}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>{t('quantity')}</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>{t('size')} (ml)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min="1"
                                                    value={item.size}
                                                    onChange={(e) => updateOrderItem(index, 'size', e.target.value)}
                                                    placeholder="30"
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>{t('quality')}</Form.Label>
                                                <Form.Select
                                                    value={item.quality}
                                                    onChange={(e) => updateOrderItem(index, 'quality', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select Quality</option>
                                                    <option value="Standard">Standard</option>
                                                    <option value="Premium">Premium</option>
                                                    <option value="Luxury">Luxury</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={2} className="d-flex align-items-end">
                                            {newOrder.items.length > 1 && (
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => removeOrderItem(index)}
                                                    className="mb-3"
                                                >
                                                    {t('delete')}
                                                </Button>
                                            )}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}

                        <Button variant="outline-primary" onClick={addOrderItem} className="mb-3">
                            {t('add')} {t('productTitle')}
                        </Button>

                        {/* Notes */}
                        <Form.Group className="mb-3">
                            <Form.Label>{t('notes')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={newOrder.notes}
                                onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                                placeholder={t('notes')}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        {t('cancel')}
                    </Button>
                    <Button variant="primary" onClick={handleCreateOrder}>
                        {t('save')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Order Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('orderDetails')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('orderNumber')}:</strong> {selectedOrder.orderNumber}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('orderDate')}:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('orderStatus')}:</strong> {getStatusBadge(selectedOrder.status)}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('paymentStatus')}:</strong> {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                                </Col>
                            </Row>

                            <h5>{t('customerInfo')}</h5>
                            <Row className="mb-3">
                                <Col md={4}>
                                    <strong>{t('customerName')}:</strong> {selectedOrder.customer?.name}
                                </Col>
                                <Col md={4}>
                                    <strong>{t('customerEmail')}:</strong> {selectedOrder.customer?.email}
                                </Col>
                                <Col md={4}>
                                    <strong>{t('customerPhone')}:</strong> {selectedOrder.customer?.phone}
                                </Col>
                            </Row>

                            {selectedOrder.customer?.address && (
                                <Row className="mb-3">
                                    <Col md={12}>
                                        <strong>{t('customerAddress')}:</strong><br />
                                        {selectedOrder.customer.address.street && `${selectedOrder.customer.address.street}, `}
                                        {selectedOrder.customer.address.city && `${selectedOrder.customer.address.city}, `}
                                        {selectedOrder.customer.address.state && `${selectedOrder.customer.address.state}, `}
                                        {selectedOrder.customer.address.country}
                                    </Col>
                                </Row>
                            )}

                            <h5>{t('orderItems')}</h5>
                            <Table striped bordered>
                                <thead>
                                    <tr>
                                        <th>{t('productTitle')}</th>
                                        <th>{t('quantity')}</th>
                                        <th>{t('size')}</th>
                                        <th>{t('quality')}</th>
                                        <th>{t('productPrice')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items?.map((item, index) => (
                                        <tr key={index}>
                                            <td>{getBilingualText(item.product?.title) || item.product}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.size}ml</td>
                                            <td>{item.quality}</td>
                                            <td>${item.price?.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            <Row className="mt-3">
                                <Col md={4}>
                                    <strong>Subtotal:</strong> ${selectedOrder.subtotalAmount?.toFixed(2)}
                                </Col>
                                <Col md={4}>
                                    <strong>Discount:</strong> ${selectedOrder.discountAmount?.toFixed(2) || '0.00'}
                                </Col>
                                <Col md={4}>
                                    <strong>{t('orderTotal')}:</strong> ${selectedOrder.totalAmount?.toFixed(2)}
                                </Col>
                            </Row>

                            <Row className="mt-3">
                                <Col md={6}>
                                    <strong>{t('paymentMethod')}:</strong> {t(selectedOrder.paymentMethod)}
                                </Col>
                                {selectedOrder.appliedDiscount && (
                                    <Col md={6}>
                                        <strong>Discount Code:</strong> {selectedOrder.appliedDiscount.code}
                                    </Col>
                                )}
                            </Row>

                            {selectedOrder.notes && (
                                <div className="mt-3">
                                    <strong>{t('notes')}:</strong>
                                    <p>{selectedOrder.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        {t('close')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default OrdersPage; 