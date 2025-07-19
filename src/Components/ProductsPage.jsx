import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useLanguage } from '../context/LanguageContext';
import { API_ENDPOINTS, BASE_URL } from '../config/api';
import axiosInstance from '../utils/axiosConfig';
import { showConfirmDialog, showSuccessToast, showErrorToast } from '../utils/toast';
import '../styles/ProductsPage.css';

const ProductsPage = () => {
    const { t, getBilingualText, isRTL } = useLanguage();
    const [perfumes, setPerfumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPerfumes();
    }, []);

    const fetchPerfumes = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.GET_PERFUMES);
            setPerfumes(response.data);
            setLoading(false);
        } catch (err) {
            setError(t('error'));
            setLoading(false);
            console.error('Error fetching perfumes:', err);
            showErrorToast(t('error'));
        }
    };

    const handleDelete = async (id) => {
        showConfirmDialog({
            title: t('deleteConfirm'),
            text: t('deleteConfirmText'),
            icon: 'warning',
            confirmButtonText: t('yes'),
            cancelButtonText: t('no'),
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(API_ENDPOINTS.DELETE_PERFUME(id));
                    setPerfumes(perfumes.filter(perfume => perfume._id !== id));
                    showSuccessToast(t('productDeleted'));
                } catch (err) {
                    console.error('Error deleting perfume:', err);
                    showErrorToast(t('error'));
                }
            }
        });
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
        <Container className="py-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">{t('perfumes')}</h2>
                        <Button
                            as={Link}
                            to="/perfumes/add"
                            variant="primary"
                            className="btn-rounded"
                        >
                            {t('addProduct')}
                        </Button>
                    </div>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            {perfumes.length === 0 ? (
                <Alert variant="info" className="text-center">
                    <h4>{t('noProducts')}</h4>
                    <p>{t('noProductsFound')}</p>
                    <Button as={Link} to="/perfumes/add" variant="primary">
                        {t('addProduct')}
                    </Button>
                </Alert>
            ) : (
                <Row>
                    {perfumes.map(perfume => (
                        <Col lg={3} md={4} sm={6} key={perfume._id} className="mb-4">
                            <Card className="h-100 shadow-sm product-card">
                                <div className="position-relative">
                                    <Card.Img
                                        variant="top"
                                        src={perfume.image?.startsWith('http')
                                            ? perfume.image
                                            : `${BASE_URL}/${perfume.image}`}
                                        alt={getBilingualText(perfume.title)}
                                        className="product-image"
                                        style={{ height: '200px', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.jpg'; // Fallback image
                                        }}
                                    />
                                    {perfume.is_favorite && (
                                        <div className="position-absolute top-0 end-0 m-2">
                                            <span className="badge bg-warning">
                                                ⭐ {t('favorite')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="text-truncate mb-2">
                                        {getBilingualText(perfume.title)}
                                    </Card.Title>

                                    <Card.Text className="text-muted small mb-2">
                                        {getBilingualText(perfume.description)?.substring(0, 100)}...
                                    </Card.Text>

                                    <div className="mb-2">
                                        {/* Updated price display for new structure */}
                                        {perfume.sizesPricing && perfume.sizesPricing.length > 0 ? (
                                            (() => {
                                                const prices = perfume.sizesPricing.map(sp => sp.price);
                                                const minPrice = Math.min(...prices);
                                                const maxPrice = Math.max(...prices);

                                                if (minPrice === maxPrice) {
                                                    return (
                                                        <strong className="text-primary fs-5">
                                                            ${parseFloat(minPrice).toFixed(2)}
                                                        </strong>
                                                    );
                                                } else {
                                                    return (
                                                        <strong className="text-primary fs-5">
                                                            ${parseFloat(minPrice).toFixed(2)} - ${parseFloat(maxPrice).toFixed(2)}
                                                        </strong>
                                                    );
                                                }
                                            })()
                                        ) : (
                                            // Backward compatibility for old structure
                                            <strong className="text-primary fs-5">
                                                ${parseFloat(perfume.price || 0).toFixed(2)}
                                            </strong>
                                        )}
                                        {perfume.discountedPrice && perfume.discountedPrice < perfume.price && (
                                            <>
                                                <br />
                                                <small className="text-success">
                                                    {t('sale')}: ${parseFloat(perfume.discountedPrice).toFixed(2)}
                                                </small>
                                            </>
                                        )}
                                    </div>

                                    {/* Updated sizes display */}
                                    {perfume.sizesPricing && perfume.sizesPricing.length > 0 ? (
                                        <div className="mb-3">
                                            <small className="text-muted">{t('productSizes')}: </small>
                                            {perfume.sizesPricing.map((sizePrice, index) => (
                                                <span key={index} className="badge bg-secondary me-1" title={`$${sizePrice.price}`}>
                                                    {sizePrice.size}ml
                                                </span>
                                            ))}
                                        </div>
                                    ) : perfume.sizes && perfume.sizes.length > 0 ? (
                                        // Backward compatibility
                                        <div className="mb-3">
                                            <small className="text-muted">{t('productSizes')}: </small>
                                            {perfume.sizes.map((size, index) => (
                                                <span key={index} className="badge bg-secondary me-1">
                                                    {size}ml
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}

                                    <div className="mt-auto">
                                        <div className="d-flex gap-2">
                                            <Button
                                                as={Link}
                                                to={`/perfumes/edit/${perfume._id}`}
                                                variant="outline-primary"
                                                size="sm"
                                                className="flex-fill"
                                            >
                                                {t('edit')}
                                            </Button>
                                            <Button
                                                onClick={() => handleDelete(perfume._id)}
                                                variant="outline-danger"
                                                size="sm"
                                                className="flex-fill"
                                            >
                                                {t('delete')}
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default ProductsPage; 