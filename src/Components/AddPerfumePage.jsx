import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useLanguage } from '../context/LanguageContext';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosConfig';
import { showSuccessToast, showErrorToast, showLoading, closeLoading } from '../utils/toast';
import '../styles/AddPerfumePage.css';

const AddPerfumePage = () => {
    const navigate = useNavigate();
    const { t, isRTL } = useLanguage();
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
            showErrorToast(t('required') + ': ' + t('productTitle'));
            return;
        }

        if (!formData.description.ar && !formData.description.tr) {
            showErrorToast(t('required') + ': ' + t('productDescription'));
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

        if (!mainImage) {
            showErrorToast(t('required') + ': ' + t('productImage'));
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(mainImage.type)) {
            showErrorToast('Please select a valid image file (JPEG, PNG, WEBP)');
            return;
        }

        // Validate file size (max 5MB)
        if (mainImage.size > 5 * 1024 * 1024) {
            showErrorToast('Image size should be less than 5MB');
            return;
        }

        setLoading(true);
        showLoading(t('loading'));

        try {
            const perfumeFormData = new FormData();

            // Add JSON data
            perfumeFormData.append('data', JSON.stringify(formData));

            // Add main image with proper field name
            perfumeFormData.append('image', mainImage, mainImage.name);

            // Add slider images
            if (sliderImages.length > 0) {
                sliderImages.forEach((image, index) => {
                    perfumeFormData.append('sliderImages', image, image.name);
                });
            }

            // Debug: Log what we're sending
            console.log('Sending FormData with:');
            console.log('- Main image:', mainImage.name, mainImage.type, mainImage.size);
            console.log('- Slider images:', sliderImages.length);
            console.log('- Form data:', formData);

            // Send the form data
            const response = await axiosInstance.post(API_ENDPOINTS.CREATE_PERFUME, perfumeFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000, // 30 second timeout for file uploads
            });

            closeLoading();
            showSuccessToast(t('productAdded'));

            // Redirect after a short delay
            setTimeout(() => {
                navigate('/products');
            }, 1000);

        } catch (err) {
            closeLoading();
            console.error('Error adding perfume:', err);
            console.error('Error response:', err.response?.data);

            const errorMessage = err.response?.data?.message || err.message || t('error');
            showErrorToast(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderLanguageTab = (lang) => {
        const isArabic = lang === 'ar';
        const isTurkish = lang === 'tr';

        let langLabel = '';
        if (isArabic) langLabel = t('arabic');
        else if (isTurkish) langLabel = t('turkish');

        return (
            <div className={activeTab === lang ? 'tab-content active' : 'tab-content'}>
                <div className="form-group">
                    <label htmlFor={`title-${lang}`}>{t('productTitle')} ({langLabel})</label>
                    <input
                        type="text"
                        id={`title-${lang}`}
                        value={formData.title[lang]}
                        onChange={(e) => handleBilingualInputChange(e, 'title', lang)}
                        required={isArabic} // Arabic is required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor={`description-${lang}`}>{t('productDescription')} ({langLabel})</label>
                    <textarea
                        id={`description-${lang}`}
                        value={formData.description[lang]}
                        onChange={(e) => handleBilingualInputChange(e, 'description', lang)}
                        required={isArabic}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor={`about-${lang}`}>{t('productAbout')} ({langLabel})</label>
                    <textarea
                        id={`about-${lang}`}
                        value={formData.about[lang]}
                        onChange={(e) => handleBilingualInputChange(e, 'about', lang)}
                        required={isArabic}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor={`productInfo-${lang}`}>{t('productInfo')} ({langLabel})</label>
                    <textarea
                        id={`productInfo-${lang}`}
                        value={formData.productInfo[lang]}
                        onChange={(e) => handleBilingualInputChange(e, 'productInfo', lang)}
                        required={isArabic}
                    />
                </div>

                <div className="form-group">
                    <label>{t('productFeatures')} ({langLabel})</label>
                    {formData.features.map((feature, index) => (
                        <div key={`feature-${index}-${lang}`} className="feature-item">
                            <input
                                type="text"
                                placeholder={`${t('productFeatures')} (${langLabel})`}
                                value={feature.feature[lang]}
                                onChange={(e) => handleFeatureChange(index, 'feature', lang, e.target.value)}
                                required={isArabic}
                            />
                            <input
                                type="text"
                                placeholder={`${t('value')} (${langLabel})`}
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
                                    {t('delete')}
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="add-btn" onClick={addFeature}>
                        {t('add')} {t('productFeatures')}
                    </button>
                </div>

                <div className="form-group">
                    <label>{t('productIngredients')} ({langLabel})</label>
                    {formData.ingredients.map((ingredient, index) => (
                        <div key={`ingredient-${index}-${lang}`} className="ingredient-item">
                            <input
                                type="text"
                                placeholder={`Key (${langLabel})`}
                                value={ingredient.key[lang]}
                                onChange={(e) => handleIngredientChange(index, 'key', lang, e.target.value)}
                                required={isArabic}
                            />
                            <input
                                type="text"
                                placeholder={`Value (${langLabel})`}
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
                                    {t('delete')}
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="add-btn" onClick={addIngredient}>
                        {t('add')} {t('productIngredients')}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="add-perfume-container" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="page-header">
                <h2>{t('addProduct')}</h2>
                <Link to="/products" className="back-button">
                    {t('back')} {t('perfumes')}
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="language-tabs">
                    <button
                        type="button"
                        className={activeTab === 'ar' ? 'tab-btn active' : 'tab-btn'}
                        onClick={() => setActiveTab('ar')}
                    >
                        {t('arabic')}
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'tr' ? 'tab-btn active' : 'tab-btn'}
                        onClick={() => setActiveTab('tr')}
                    >
                        {t('turkish')}
                    </button>
                </div>

                {renderLanguageTab('ar')}
                {renderLanguageTab('tr')}

                <div className="form-group">
                    <label htmlFor="urlName">URL Name</label>
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
                    <label>{t('productSizes')} & {t('productPrice')}</label>
                    {formData.sizesPricing.map((sizePrice, index) => (
                        <div key={`size-price-${index}`} className="size-price-item">
                            <input
                                type="number"
                                placeholder={t('size')}
                                value={sizePrice.size}
                                onChange={(e) => handleSizePriceChange(index, 'size', e.target.value)}
                                min="1"
                                required
                                className="size-input"
                            />
                            <span className="size-unit">ml</span>
                            <input
                                type="number"
                                placeholder={t('productPrice')}
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
                                    {t('delete')}
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="add-btn" onClick={addSizePrice}>
                        {t('add')} {t('size')} & {t('productPrice')}
                    </button>
                </div>

                <div className="form-group">
                    <label htmlFor="mainImage">{t('productImage')}</label>
                    <input
                        type="file"
                        id="mainImage"
                        accept="image/*"
                        onChange={handleMainImageChange}
                        required
                    />
                    {mainImage && (
                        <div className="file-preview">
                            <small className="text-success">
                                ✓ Selected: {mainImage.name} ({(mainImage.size / 1024 / 1024).toFixed(2)} MB)
                            </small>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="sliderImages">{t('productImages')} ({t('optional')})</label>
                    <input
                        type="file"
                        id="sliderImages"
                        accept="image/*"
                        multiple
                        onChange={handleSliderImagesChange}
                    />
                    {sliderImages.length > 0 && (
                        <div className="file-preview">
                            <small className="text-success">
                                ✓ Selected {sliderImages.length} image(s)
                            </small>
                            <ul className="file-list">
                                {sliderImages.map((file, index) => (
                                    <li key={index}>
                                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="is_favorite">{t('favorite')}</label>
                    <input
                        type="checkbox"
                        id="is_favorite"
                        name="is_favorite"
                        checked={formData.is_favorite}
                        onChange={handleInputChange}
                    />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? t('loading') : t('addProduct')}
                </button>
            </form>
        </div>
    );
};

export default AddPerfumePage; 