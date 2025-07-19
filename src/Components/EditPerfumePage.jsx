import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { API_ENDPOINTS, BASE_URL } from '../config/api';
import axiosInstance from '../utils/axiosConfig';
import { showSuccessToast, showErrorToast, showLoading, closeLoading } from '../utils/toast';
import '../styles/AddPerfumePage.css';

const EditPerfumePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: { ar: '', tr: '' },
        description: { ar: '', tr: '' },
        sizesPricing: [{ size: 30, price: 0 }],
        urlName: '',
        about: { ar: '', tr: '' },
        productInfo: { ar: '', tr: '' },
        features: [{ feature: { ar: '', tr: '' }, value: { ar: '', tr: '' } }],
        ingredients: [{ key: { ar: '', tr: '' }, value: { ar: '', tr: '' } }],
        is_favorite: false
    });

    const [mainImage, setMainImage] = useState(null);
    const [sliderImages, setSliderImages] = useState([]);
    const [currentImages, setCurrentImages] = useState({
        main: '',
        slider: []
    });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ar'); // Default to Arabic

    useEffect(() => {
        fetchPerfume();
    }, [id]);

    const fetchPerfume = async () => {
        try {
            showLoading('جاري تحميل بيانات العطر...');
            const response = await axiosInstance.get(API_ENDPOINTS.GET_PERFUME(id));
            const perfume = response.data;

            // Handle backward compatibility: convert old structure to new
            let sizesPricing = [];
            if (perfume.sizesPricing && perfume.sizesPricing.length > 0) {
                // Already has new structure
                sizesPricing = perfume.sizesPricing;
            } else if (perfume.sizes && perfume.sizes.length > 0 && perfume.price) {
                // Convert from old structure
                sizesPricing = perfume.sizes.map(size => ({
                    size: size,
                    price: perfume.price
                }));
            } else {
                // Default
                sizesPricing = [{ size: 30, price: 0 }];
            }

            setFormData({
                title: perfume.title || { ar: '', tr: '' },
                description: perfume.description || { ar: '', tr: '' },
                sizesPricing: sizesPricing,
                urlName: perfume.urlName || '',
                about: perfume.about || { ar: '', tr: '' },
                productInfo: perfume.productInfo || { ar: '', tr: '' },
                features: perfume.features?.length
                    ? perfume.features
                    : [{ feature: { ar: '', tr: '' }, value: { ar: '', tr: '' } }],
                ingredients: perfume.ingredients?.length
                    ? perfume.ingredients
                    : [{ key: { ar: '', tr: '' }, value: { ar: '', tr: '' } }],
                is_favorite: perfume.is_favorite || false
            });

            setCurrentImages({
                main: perfume.image || '',
                slider: perfume.sliderImages || []
            });

            setFetchLoading(false);
            closeLoading();
        } catch (err) {
            closeLoading();
            console.error('Error fetching perfume:', err);
            showErrorToast('فشل في تحميل بيانات العطر');
            navigate('/products');
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
            features: [...formData.features, { feature: { ar: '', tr: '' }, value: { ar: '', tr: '' } }]
        });
    };

    const removeFeature = (index) => {
        const newFeatures = [...formData.features];
        newFeatures.splice(index, 1);
        setFormData({ ...formData, features: newFeatures });
    };

    // Updated size-price handling
    const handleSizePriceChange = (index, field, value) => {
        const newSizesPricing = [...formData.sizesPricing];
        newSizesPricing[index][field] = field === 'size' ? parseInt(value) || 0 : parseFloat(value) || 0;
        setFormData({ ...formData, sizesPricing: newSizesPricing });
    };

    const addSizePrice = () => {
        setFormData({
            ...formData,
            sizesPricing: [...formData.sizesPricing, { size: 30, price: 0 }]
        });
    };

    const removeSizePrice = (index) => {
        const newSizesPricing = [...formData.sizesPricing];
        newSizesPricing.splice(index, 1);
        setFormData({ ...formData, sizesPricing: newSizesPricing });
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
            ingredients: [...formData.ingredients, { key: { ar: '', tr: '' }, value: { ar: '', tr: '' } }]
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
        if (!formData.title.ar && !formData.title.tr) {
            showErrorToast('يرجى إدخال عنوان العطر باللغة العربية أو التركية');
            return;
        }

        if (!formData.description.ar && !formData.description.tr) {
            showErrorToast('يرجى إدخال وصف العطر باللغة العربية أو التركية');
            return;
        }

        if (!formData.sizesPricing || formData.sizesPricing.length === 0) {
            showErrorToast('At least one size with price is required');
            return;
        }

        // Validate each size-price pair
        for (const sp of formData.sizesPricing) {
            if (!sp.size || !sp.price || sp.size <= 0 || sp.price <= 0) {
                showErrorToast('Each size must have a valid size (ml) and price');
                return;
            }
        }

        setLoading(true);
        showLoading('جاري تحديث العطر...');

        try {
            const perfumeFormData = new FormData();

            // Add JSON data
            perfumeFormData.append('data', JSON.stringify(formData));

            // Add main image only if new one is selected
            if (mainImage) {
                perfumeFormData.append('image', mainImage);
            }

            // Add slider images only if new ones are selected
            if (sliderImages.length > 0) {
                sliderImages.forEach(image => {
                    perfumeFormData.append('sliderImages', image);
                });
            }

            await axiosInstance.put(API_ENDPOINTS.UPDATE_PERFUME(id), perfumeFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            closeLoading();
            showSuccessToast('تم تحديث العطر بنجاح');

            setTimeout(() => {
                navigate('/products');
            }, 1000);

        } catch (err) {
            closeLoading();
            console.error('Error updating perfume:', err);
            showErrorToast(err.response?.data?.message || 'حدث خطأ أثناء تحديث العطر');
        } finally {
            setLoading(false);
        }
    };

    const renderLanguageTab = (lang) => {
        const isArabic = lang === 'ar';
        const isTurkish = lang === 'tr';

        let langLabel = '';
        if (isArabic) langLabel = 'العربية';
        else if (isTurkish) langLabel = 'التركية';

        return (
            <div className={activeTab === lang ? 'tab-content active' : 'tab-content'}>
                <div className="form-group">
                    <label htmlFor={`title-${lang}`}>العنوان ({langLabel})</label>
                    <input
                        type="text"
                        id={`title-${lang}`}
                        value={formData.title[lang]}
                        onChange={(e) => handleBilingualInputChange(e, 'title', lang)}
                        required={isArabic}
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

    if (fetchLoading) {
        return <div className="loading">جاري التحميل...</div>;
    }

    return (
        <div className="add-perfume-container">
            <div className="page-header">
                <h2>تعديل العطر</h2>
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
                        className={activeTab === 'tr' ? 'tab-btn active' : 'tab-btn'}
                        onClick={() => setActiveTab('tr')}
                    >
                        التركية
                    </button>
                </div>

                {renderLanguageTab('ar')}
                {renderLanguageTab('tr')}

                <div className="form-group">
                    <label htmlFor="urlName">اسم الرابط</label>
                    <input
                        type="text"
                        id="urlName"
                        name="urlName"
                        value={formData.urlName}
                        onChange={handleInputChange}
                        placeholder="e.g., elegant-rose-perfume"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>الأحجام والأسعار</label>
                    {formData.sizesPricing.map((sizePrice, index) => (
                        <div key={`size-price-${index}`} className="size-price-item">
                            <input
                                type="number"
                                placeholder="الحجم بالملليلتر"
                                value={sizePrice.size}
                                onChange={(e) => handleSizePriceChange(index, 'size', e.target.value)}
                                min="1"
                                required
                                className="size-input"
                            />
                            <span className="size-unit">ml</span>
                            <input
                                type="number"
                                placeholder="السعر"
                                value={sizePrice.price}
                                onChange={(e) => handleSizePriceChange(index, 'price', e.target.value)}
                                min="0"
                                step="0.01"
                                required
                                className="price-input"
                            />
                            <span className="price-unit">$</span>
                            {index === 0 && formData.sizesPricing.length === 1 ? null : (
                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => removeSizePrice(index)}
                                >
                                    حذف
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="add-btn" onClick={addSizePrice}>
                        إضافة حجم وسعر
                    </button>
                </div>

                <div className="form-group">
                    <label htmlFor="mainImage">الصورة الرئيسية (اترك فارغًا لعدم التغيير)</label>
                    {currentImages.main && (
                        <div className="current-image">
                            <img src={`${BASE_URL}/${currentImages.main}`} alt="الصورة الحالية" style={{ maxWidth: '200px', height: 'auto' }} />
                        </div>
                    )}
                    <input
                        type="file"
                        id="mainImage"
                        accept="image/*"
                        onChange={handleMainImageChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="sliderImages">صور العرض (اترك فارغًا لعدم التغيير)</label>
                    {currentImages.slider && currentImages.slider.length > 0 && (
                        <div className="current-images">
                            {currentImages.slider.map((img, index) => (
                                <img key={index} src={`${BASE_URL}/${img}`} alt={`صورة ${index + 1}`} style={{ maxWidth: '150px', height: 'auto', margin: '5px' }} />
                            ))}
                        </div>
                    )}
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
                    {loading ? 'جاري التحديث...' : 'تحديث العطر'}
                </button>
            </form>
        </div>
    );
};

export default EditPerfumePage; 