import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_ENDPOINTS, BASE_URL } from '../config/api';
import axiosInstance from '../utils/axiosConfig';
import { showConfirmDialog, showSuccessToast, showErrorToast } from '../utils/toast';
import '../styles/ProductsPage.css';

const ProductsPage = () => {
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
            setError('فشل في جلب العطور');
            setLoading(false);
            console.error('Error fetching perfumes:', err);

            showErrorToast('فشل في تحميل العطور. يرجى المحاولة مرة أخرى.');
        }
    };

    const handleDelete = async (id) => {
        showConfirmDialog({
            title: 'هل أنت متأكد؟',
            text: "لن تتمكن من التراجع عن هذا!",
            icon: 'warning',
            confirmButtonText: 'نعم، احذفه!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(API_ENDPOINTS.DELETE_PERFUME(id));

                    setPerfumes(perfumes.filter(perfume => perfume._id !== id));

                    showSuccessToast('تم حذف العطر بنجاح');
                } catch (err) {
                    console.error('Error deleting perfume:', err);
                    showErrorToast('فشل في حذف العطر. يرجى المحاولة مرة أخرى.');
                }
            }
        });
    };

    // Helper function to get display title from bilingual object
    const getDisplayTitle = (title) => {
        if (!title) return '';
        if (typeof title === 'string') return title;
        return title.ar || title.en || '';
    };

    if (loading) {
        return <div className="loading">جاري التحميل...</div>;
    }

    return (
        <div className="products-container">
            <div className="products-header">
                <h2>العطور</h2>
                <Link to="/perfumes/add" className="add-button">
                    إضافة عطر جديد
                </Link>
            </div>

            {error && <div className="error-message">{error}</div>}

            {perfumes.length === 0 ? (
                <div className="no-products">
                    <p>لم يتم العثور على عطور</p>
                </div>
            ) : (
                <div className="products-grid">
                    {perfumes.map(perfume => (
                        <div key={perfume._id} className="product-card">
                            <div className="product-image">
                                <img
                                    src={perfume.image.startsWith('http')
                                        ? perfume.image
                                        : `${BASE_URL}/${perfume.image}`}
                                    alt={getDisplayTitle(perfume.title)}
                                />
                                {perfume.is_favorite && (
                                    <span className="favorite-badge">★</span>
                                )}
                            </div>
                            <div className="product-details">
                                <h3 className="product-title">{getDisplayTitle(perfume.title)}</h3>
                                <p className="product-price">${parseFloat(perfume.price).toFixed(2)}</p>
                            </div>
                            <div className="product-actions">
                                <Link to={`/perfumes/edit/${perfume._id}`} className="action-button edit">
                                    تعديل
                                </Link>
                                <button
                                    className="action-button delete"
                                    onClick={() => handleDelete(perfume._id)}
                                >
                                    حذف
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductsPage; 