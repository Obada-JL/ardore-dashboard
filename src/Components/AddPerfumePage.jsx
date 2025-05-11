import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosConfig';
import { showSuccessToast, showErrorToast, showLoading, closeLoading } from '../utils/toast';
import '../styles/AddPerfumePage.css';

const AddPerfumePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: { en: '', ar: '' },
        description: { en: '', ar: '' },
        price: '',
        about: { en: '', ar: '' },
        productInfo: { en: '', ar: '' },
        features: [{ feature: { en: '', ar: '' }, value: { en: '', ar: '' } }],
        sizes: [{ en: '', ar: '' }],
        ingredients: [{ key: { en: '', ar: '' }, value: { en: '', ar: '' } }],
        is_favorite: false
    });

    const [mainImage, setMainImage] = useState(null);
    const [sliderImages, setSliderImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('ar'); // Default to Arabic

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

    const handleFeatureChange = (index, field, lang, value) => {
        const newFeatures = [...formData.features];
        if (lang) {
            newFeatures[index][field] = {
                ...newFeatures[index][field],
                [lang]: value
            };
        } else {
            newFeatures[index][field] = value;
        }
        setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => {
        setFormData({
            ...formData,
            features: [...formData.features, { feature: { en: '', ar: '' }, value: { en: '', ar: '' } }]
        });
    };

    const removeFeature = (index) => {
        const newFeatures = [...formData.features];
        newFeatures.splice(index, 1);
        setFormData({ ...formData, features: newFeatures });
    };

    const handleSizeChange = (index, lang, value) => {
        const newSizes = [...formData.sizes];
        newSizes[index] = {
            ...newSizes[index],
            [lang]: value
        };
        setFormData({ ...formData, sizes: newSizes });
    };

    const addSize = () => {
        setFormData({
            ...formData,
            sizes: [...formData.sizes, { en: '', ar: '' }]
        });
    };

    const removeSize = (index) => {
        const newSizes = [...formData.sizes];
        newSizes.splice(index, 1);
        setFormData({ ...formData, sizes: newSizes });
    };

    const handleIngredientChange = (index, field, lang, value) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index][field] = {
            ...newIngredients[index][field],
            [lang]: value
        };
        setFormData({ ...formData, ingredients: newIngredients });
    };

    const addIngredient = () => {
        setFormData({
            ...formData,
            ingredients: [...formData.ingredients, { key: { en: '', ar: '' }, value: { en: '', ar: '' } }]
        });
    };

    const removeIngredient = (index) => {
        const newIngredients = [...formData.ingredients];
        newIngredients.splice(index, 1);
        setFormData({ ...formData, ingredients: newIngredients });
    };

    const handleMainImageChange = (e) => {
        setMainImage(e.target.files[0]);
    };

    const handleSliderImagesChange = (e) => {
        setSliderImages(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.title.ar && !formData.title.en) {
            showErrorToast('يرجى إدخال عنوان العطر باللغة العربية أو الإنجليزية');
            return;
        }

        if (!formData.description.ar && !formData.description.en) {
            showErrorToast('يرجى إدخال وصف العطر باللغة العربية أو الإنجليزية');
            return;
        }

        if (!mainImage) {
            showErrorToast('يرجى اختيار صورة رئيسية للعطر');
            return;
        }

        setLoading(true);
        showLoading('جاري إضافة العطر...');

        try {
            const perfumeFormData = new FormData();

            // Add JSON data
            perfumeFormData.append('data', JSON.stringify(formData));

            // Add main image
            if (mainImage) {
                perfumeFormData.append('image', mainImage);
            }

            // Add slider images
            if (sliderImages.length > 0) {
                sliderImages.forEach(image => {
                    perfumeFormData.append('sliderImages', image);
                });
            }

            // Need to override the default content-type for multipart/form-data
            await axiosInstance.post(API_ENDPOINTS.ADD_PERFUME, perfumeFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            closeLoading();
            showSuccessToast('تمت إضافة العطر بنجاح');

            // Redirect after a short delay
            setTimeout(() => {
                navigate('/products');
            }, 1000);

        } catch (err) {
            closeLoading();
            console.error('Error adding perfume:', err);

            showErrorToast(err.response?.data?.message || 'حدث خطأ أثناء إضافة العطر');
        } finally {
            setLoading(false);
        }
    };

    const renderLanguageTab = (lang) => {
        const isArabic = lang === 'ar';
        const langLabel = isArabic ? 'العربية' : 'الإنجليزية';

        return (
            <div className={activeTab === lang ? 'tab-content active' : 'tab-content'}>
                <div className="form-group">
                    <label htmlFor={`title-${lang}`}>العنوان ({langLabel})</label>
                    <input
                        type="text"
                        id={`title-${lang}`}
                        value={formData.title[lang]}
                        onChange={(e) => handleBilingualInputChange(e, 'title', lang)}
                        required={isArabic} // Arabic is required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor={`description-${lang}`}>الوصف ({langLabel})</label>
                    <textarea
                        id={`description-${lang}`}
                        value={formData.description[lang]}
                        onChange={(e) => handleBilingualInputChange(e, 'description', lang)}
                        required={isArabic}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor={`about-${lang}`}>حول المنتج ({langLabel})</label>
                    <textarea
                        id={`about-${lang}`}
                        value={formData.about[lang]}
                        onChange={(e) => handleBilingualInputChange(e, 'about', lang)}
                        required={isArabic}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor={`productInfo-${lang}`}>معلومات المنتج ({langLabel})</label>
                    <textarea
                        id={`productInfo-${lang}`}
                        value={formData.productInfo[lang]}
                        onChange={(e) => handleBilingualInputChange(e, 'productInfo', lang)}
                        required={isArabic}
                    />
                </div>

                <div className="form-group">
                    <label>المميزات ({langLabel})</label>
                    {formData.features.map((feature, index) => (
                        <div key={`feature-${index}-${lang}`} className="feature-item">
                            <input
                                type="text"
                                placeholder={`الميزة (${langLabel})`}
                                value={feature.feature[lang]}
                                onChange={(e) => handleFeatureChange(index, 'feature', lang, e.target.value)}
                                required={isArabic}
                            />
                            <input
                                type="text"
                                placeholder={`القيمة (${langLabel})`}
                                value={feature.value[lang]}
                                onChange={(e) => handleFeatureChange(index, 'value', lang, e.target.value)}
                                required={isArabic}
                            />
                            {index === 0 && formData.features.length === 1 ? null : (
                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => removeFeature(index)}
                                >
                                    حذف
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="add-btn" onClick={addFeature}>
                        إضافة ميزة
                    </button>
                </div>

                <div className="form-group">
                    <label>الأحجام ({langLabel})</label>
                    {formData.sizes.map((size, index) => (
                        <div key={`size-${index}-${lang}`} className="size-item">
                            <input
                                type="text"
                                placeholder={`الحجم (${langLabel})`}
                                value={size[lang]}
                                onChange={(e) => handleSizeChange(index, lang, e.target.value)}
                                required={isArabic}
                            />
                            {index === 0 && formData.sizes.length === 1 ? null : (
                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => removeSize(index)}
                                >
                                    حذف
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="add-btn" onClick={addSize}>
                        إضافة حجم
                    </button>
                </div>

                <div className="form-group">
                    <label>المكونات ({langLabel})</label>
                    {formData.ingredients.map((ingredient, index) => (
                        <div key={`ingredient-${index}-${lang}`} className="ingredient-item">
                            <input
                                type="text"
                                placeholder={`المفتاح (${langLabel})`}
                                value={ingredient.key[lang]}
                                onChange={(e) => handleIngredientChange(index, 'key', lang, e.target.value)}
                                required={isArabic}
                            />
                            <input
                                type="text"
                                placeholder={`القيمة (${langLabel})`}
                                value={ingredient.value[lang]}
                                onChange={(e) => handleIngredientChange(index, 'value', lang, e.target.value)}
                                required={isArabic}
                            />
                            {index === 0 && formData.ingredients.length === 1 ? null : (
                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => removeIngredient(index)}
                                >
                                    حذف
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="add-btn" onClick={addIngredient}>
                        إضافة مكون
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="add-perfume-container">
            <div className="page-header">
                <h2>إضافة عطر جديد</h2>
                <Link to="/products" className="back-button">
                    العودة إلى العطور
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="language-tabs">
                    <button
                        type="button"
                        className={activeTab === 'ar' ? 'tab-btn active' : 'tab-btn'}
                        onClick={() => setActiveTab('ar')}
                    >
                        العربية
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'en' ? 'tab-btn active' : 'tab-btn'}
                        onClick={() => setActiveTab('en')}
                    >
                        الإنجليزية
                    </button>
                </div>

                {renderLanguageTab('ar')}
                {renderLanguageTab('en')}

                <div className="form-group">
                    <label htmlFor="price">السعر</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="mainImage">الصورة الرئيسية</label>
                    <input
                        type="file"
                        id="mainImage"
                        accept="image/*"
                        onChange={handleMainImageChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="sliderImages">صور العرض (اختياري، يمكن اختيار عدة صور)</label>
                    <input
                        type="file"
                        id="sliderImages"
                        accept="image/*"
                        multiple
                        onChange={handleSliderImagesChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="is_favorite">مميز</label>
                    <input
                        type="checkbox"
                        id="is_favorite"
                        name="is_favorite"
                        checked={formData.is_favorite}
                        onChange={handleInputChange}
                    />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'جاري الإضافة...' : 'إضافة العطر'}
                </button>
            </form>
        </div>
    );
};

export default AddPerfumePage; 