import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Form, Spinner, Container, Row, Col, Card, Tabs, Tab, Image } from "react-bootstrap";
import Swal from "sweetalert2";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import { useNavigate } from "react-router-dom";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

// Custom styles for the product carousel
const productCarouselStyles = `
  .product-modal-swiper {
    margin-bottom: 20px;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .product-modal-swiper .swiper-slide {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
  }
  
  .product-modal-swiper img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
  }
  
  .product-modal-thumbs {
    height: 70px;
    margin-bottom: 20px;
  }
  
  .product-modal-thumbs .swiper-slide {
    height: 100%;
    opacity: 0.6;
    cursor: pointer;
    border-radius: 5px;
    overflow: hidden;
    border: 2px solid transparent;
    transition: all 0.3s ease;
  }
  
  .product-modal-thumbs .swiper-slide-thumb-active {
    opacity: 1;
    border-color: #3498db;
  }
  
  .product-modal-thumbs img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .swiper-button-next, .swiper-button-prev {
    color: #3498db;
  }
  
  .swiper-pagination-bullet-active {
    background: #3498db;
  }

  .product-main-swiper {
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 15px;
  }
  
  .product-main-swiper .swiper-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    height: 400px;
  }
  
  .product-thumbs-swiper {
    height: 80px;
    margin-bottom: 20px;
  }
  
  .product-thumbs-swiper .swiper-slide {
    opacity: 0.6;
    transition: opacity 0.3s;
  }
  
  .product-thumbs-swiper .swiper-slide:hover {
    opacity: 1;
  }
  
  .product-thumbs-swiper .swiper-slide-active {
    opacity: 1;
    border: 2px solid #3498db;
    border-radius: 5px;
  }
`;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({
    title: { en: "", ar: "" },
    name: { en: "", ar: "" },
    description: { en: "", ar: "" },
    features: {  
      dimensions: { en: "", ar: "" },
      pageCount: { en: "", ar: "" },
      publishingPlace: { en: "", ar: "" },
      edition: { en: "", ar: "" },
      publishDate: { en: "", ar: "" },
      language: { en: "", ar: "" }
    },
    mainImage: null,
    sliderImages: [],
    buyLink: "",
    price: 0,
    discountedPrice: null,
    mainFeatures: [
      { icon: "", title: { en: "", ar: "" }, description: { en: "", ar: "" } },
      { icon: "", title: { en: "", ar: "" }, description: { en: "", ar: "" } },
      { icon: "", title: { en: "", ar: "" }, description: { en: "", ar: "" } }
    ],
    learnsSection: [
      { en: "", ar: "" }
    ]
  });
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // "table" or "grid"
  const [mainImageFile, setMainImageFile] = useState(null);
  const [sliderImageFiles, setSliderImageFiles] = useState([]);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [sliderImagePreviews, setSliderImagePreviews] = useState([]);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  // Backend API URLs
  const API_BASE_URL = "https://api.lineduc.com/api";
  const GET_PRODUCTS_URL = `${API_BASE_URL}/getProducts`;
  const ADD_PRODUCT_URL = `${API_BASE_URL}/addProduct`;
  const UPDATE_PRODUCT_URL = `${API_BASE_URL}/updateProduct`;
  const DELETE_PRODUCT_URL = `${API_BASE_URL}/deleteProduct`;

  // Add navigate hook
  const navigate = useNavigate();

  // Fetch products from the backend
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(GET_PRODUCTS_URL);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء جلب بيانات المنتجات",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle showing the modal for add/edit
  const handleShowModal = (product = null, mode = "add") => {
    setModalMode(mode);
    
    if (mode === "edit" && product) {
      // Create a deep copy of the product to avoid reference issues
      const productCopy = JSON.parse(JSON.stringify(product));
      
      // Ensure all nested objects exist with the correct structure
      const ensureNestedObjects = (obj) => {
        // Make sure all multilingual fields have both en and ar properties
        ['title', 'name', 'description'].forEach(field => {
          if (!obj[field]) obj[field] = {};
          if (!obj[field].en) obj[field].en = '';
          if (!obj[field].ar) obj[field].ar = '';
        });
        
        // Ensure features has the correct structure
        if (!obj.features) {
          obj.features = {
            dimensions: { en: '', ar: '' },
            pageCount: { en: '', ar: '' },
            publishingPlace: { en: '', ar: '' },
            edition: { en: '', ar: '' },
            publishDate: { en: '', ar: '' },
            language: { en: '', ar: '' }
          };
        } else {
          // Ensure each feature field has the correct structure
          ['dimensions', 'pageCount', 'publishingPlace', 'edition', 'publishDate', 'language'].forEach(field => {
            if (!obj.features[field]) obj.features[field] = {};
            if (!obj.features[field].en) obj.features[field].en = '';
            if (!obj.features[field].ar) obj.features[field].ar = '';
          });
        }
        
        // Ensure mainFeatures array exists and has the correct structure
        if (!obj.mainFeatures || !Array.isArray(obj.mainFeatures)) {
          obj.mainFeatures = [
            { icon: '', title: { en: '', ar: '' }, description: { en: '', ar: '' } },
            { icon: '', title: { en: '', ar: '' }, description: { en: '', ar: '' } },
            { icon: '', title: { en: '', ar: '' }, description: { en: '', ar: '' } }
          ];
        } else {
          // Ensure each mainFeature has the correct structure
          obj.mainFeatures = obj.mainFeatures.map(feature => {
            if (!feature) feature = {};
            if (!feature.title) feature.title = { en: '', ar: '' };
            if (!feature.description) feature.description = { en: '', ar: '' };
            return {
              icon: feature.icon || '',
              title: {
                en: feature.title.en || '',
                ar: feature.title.ar || ''
              },
              description: {
                en: feature.description.en || '',
                ar: feature.description.ar || ''
              }
            };
          });
        }
        
        // Ensure learnsSection array exists and has the correct structure
        if (!obj.learnsSection || !Array.isArray(obj.learnsSection)) {
          obj.learnsSection = [{ en: '', ar: '' }];
        } else {
          // Ensure each learnsSection item has the correct structure
          obj.learnsSection = obj.learnsSection.map(section => {
            if (!section) section = { en: '', ar: '' };
            return {
              en: section.en || '',
              ar: section.ar || ''
            };
          });
        }
        
        return obj;
      };
      
      const processedProduct = ensureNestedObjects(productCopy);
      console.log('Processed product for edit:', processedProduct);
      setSelectedProduct(processedProduct);
      
      // Set image previews for edit mode
      if (product.mainImage) {
        // Use the getImagePath helper to get the correct image URL
        setMainImagePreview(getImagePath(product.mainImage));
      } else {
        setMainImagePreview("");
      }
      
      if (product.sliderImages && product.sliderImages.length > 0) {
        // Use the getImagePath helper for each slider image
        const previews = product.sliderImages.map(img => getImagePath(img));
        setSliderImagePreviews(previews);
      } else {
        setSliderImagePreviews([]);
      }
    } else {
      // Reset form for add mode
      setSelectedProduct({
        title: { en: "", ar: "" },
        name: { en: "", ar: "" },
        description: { en: "", ar: "" },
        features: { 
          dimensions: { en: "", ar: "" },
          pageCount: { en: "", ar: "" },
          publishingPlace: { en: "", ar: "" },
          edition: { en: "", ar: "" },
          publishDate: { en: "", ar: "" },
          language: { en: "", ar: "" }
        },
        mainImage: null,
        sliderImages: [],
        buyLink: "",
        price: 0,
        discountedPrice: null,
        mainFeatures: [
          { icon: "", title: { en: "", ar: "" }, description: { en: "", ar: "" } },
          { icon: "", title: { en: "", ar: "" }, description: { en: "", ar: "" } },
          { icon: "", title: { en: "", ar: "" }, description: { en: "", ar: "" } }
        ],
        learnsSection: [
          { en: "", ar: "" }
        ]
      });
      setMainImagePreview("");
      setSliderImagePreviews([]);
    }
    
    // Reset file input state when opening the modal
    setMainImageFile(null);
    setSliderImageFiles([]);
    setShowModal(true);
    setValidated(false);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setValidated(false);
  };

  // Handle showing product details modal
  const handleShowDetailsModal = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  // Handle closing product details modal
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
  };

  // Handle form input changes for nested objects (multilingual fields)
  const handleNestedInputChange = (e, parent, lang) => {
    const { value } = e.target;
    
    // Special handling for features sub-fields
    if (['dimensions', 'pageCount', 'publishingPlace', 'edition', 'publishDate', 'language'].includes(parent)) {
      setSelectedProduct({
        ...selectedProduct,
        features: {
          ...selectedProduct.features,
          [parent]: {
            ...selectedProduct.features[parent],
            [lang]: value
          }
        }
      });
    } else {
      // Regular handling for top-level fields
      setSelectedProduct({
        ...selectedProduct,
        [parent]: {
          ...selectedProduct[parent],
          [lang]: value
        }
      });
    }
  };

  // Handle main image file selection
  const handleMainImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setMainImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle slider images file selection
  const handleSliderImagesChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSliderImageFiles(files);
      
      // Create previews
      const previews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews.push(e.target.result);
          if (previews.length === files.length) {
            setSliderImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Get a safe filename using English name/title
  const getSafeFilename = () => {
    // Use English name or title if available, otherwise use a timestamp
    const englishName = selectedProduct.name?.en || selectedProduct.title?.en;
    if (englishName && englishName.trim() !== '') {
      // Replace spaces and special characters with underscores
      return englishName.trim().replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    }
    // Use "product" prefix with timestamp instead of undefined
    return `product_${Date.now()}`;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Additional validation for required fields
    if (!selectedProduct.title?.ar && !selectedProduct.title?.en) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "يرجى إدخال العنوان باللغة العربية أو الإنجليزية",
      });
      setValidated(true);
      return;
    }

    if (!selectedProduct.name?.ar && !selectedProduct.name?.en) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "يرجى إدخال الاسم باللغة العربية أو الإنجليزية",
      });
      setValidated(true);
      return;
    }

    setLoading(true);
    try {
      // Create FormData object to handle file uploads
      const formData = new FormData();
      
      // Ensure all multilingual fields are properly initialized
      const ensureField = (field, lang) => {
        return selectedProduct[field]?.[lang] || '';
      };
      
      // Extract the English and Arabic content separately to avoid JSON objects in form data
      const productData = {
        titleEn: ensureField('title', 'en'),
        titleAr: ensureField('title', 'ar'),
        nameEn: ensureField('name', 'en'),
        nameAr: ensureField('name', 'ar'),
        descriptionEn: ensureField('description', 'en'),
        descriptionAr: ensureField('description', 'ar'),
        
        // Features fields - ensure they're properly extracted from the nested structure
        dimensionsEn: selectedProduct.features?.dimensions?.en || '',
        dimensionsAr: selectedProduct.features?.dimensions?.ar || '',
        pageCountEn: selectedProduct.features?.pageCount?.en || '',
        pageCountAr: selectedProduct.features?.pageCount?.ar || '',
        publishingPlaceEn: selectedProduct.features?.publishingPlace?.en || '',
        publishingPlaceAr: selectedProduct.features?.publishingPlace?.ar || '',
        editionEn: selectedProduct.features?.edition?.en || '',
        editionAr: selectedProduct.features?.edition?.ar || '',
        publishDateEn: selectedProduct.features?.publishDate?.en || '',
        publishDateAr: selectedProduct.features?.publishDate?.ar || '',
        languageEn: selectedProduct.features?.language?.en || '',
        languageAr: selectedProduct.features?.language?.ar || '',
        
        buyLink: selectedProduct.buyLink || '',
        price: selectedProduct.price || 0,
        discountedPrice: selectedProduct.discountedPrice || '',
        mainFeatures: JSON.stringify(selectedProduct.mainFeatures),
        learnsSection: JSON.stringify(selectedProduct.learnsSection)
      };
      
      // Log the product data for debugging
      console.log('Product data being sent:', productData);
      
      // Add all text fields as individual fields
      Object.keys(productData).forEach(key => {
        formData.append(key, productData[key]);
      });
      
      // Add the product ID if in edit mode
      if (modalMode === "edit" && selectedProduct._id) {
        formData.append('_id', selectedProduct._id);
        
        // If we're in edit mode and no new main image was selected,
        // pass the existing image path to preserve it
        if (!mainImageFile && selectedProduct.mainImage) {
          // Improved handling for main image formats
          let mainImagePath = '';
          if (typeof selectedProduct.mainImage === 'string') {
            mainImagePath = selectedProduct.mainImage;
          } else if (selectedProduct.mainImage.en || selectedProduct.mainImage.ar) {
            mainImagePath = selectedProduct.mainImage.en || selectedProduct.mainImage.ar;
          }
          
          // Only add the path if it exists
          if (mainImagePath) {
            // If the path already includes the base URL, remove it
            if (mainImagePath.includes('https://api.lineduc.com/productsImages/')) {
              mainImagePath = mainImagePath.replace('https://api.lineduc.com/productsImages/', '');
            }
            formData.append('existingMainImage', mainImagePath);
            console.log('Preserving existing main image:', mainImagePath);
          }
        }
        
        // If we're in edit mode and have existing slider images that aren't being replaced
        if (selectedProduct.sliderImages && selectedProduct.sliderImages.length > 0 && (!sliderImageFiles.length)) {
          // Improved handling for slider images
          const existingSliderImages = selectedProduct.sliderImages
            .map(img => {
              if (typeof img === 'string') {
                // If the path already includes the base URL, remove it
                if (img.includes('https://api.lineduc.com/productsImages/')) {
                  return img.replace('https://api.lineduc.com/productsImages/', '');
                }
                return img;
              } else if (img.en || img.ar) {
                const path = img.en || img.ar;
                if (path.includes('https://api.lineduc.com/productsImages/')) {
                  return path.replace('https://api.lineduc.com/productsImages/', '');
                }
                return path;
              }
              return '';
            })
            .filter(img => img); // Filter out empty strings
          
          if (existingSliderImages.length > 0) {
            // Add as a JSON string since FormData can't handle arrays directly
            formData.append('existingSliderImages', JSON.stringify(existingSliderImages));
            console.log('Preserving existing slider images:', existingSliderImages);
          } else {
            // Ensure we're not sending an empty array as JSON
            formData.append('existingSliderImages', JSON.stringify([]));
          }
        } else {
          // If there are new slider images or no slider images at all, send an empty array
          formData.append('existingSliderImages', JSON.stringify([]));
        }
      }
      
      // Add the English name/title to use for file naming
      const safeFilename = getSafeFilename();
      formData.append('filePrefix', safeFilename);
      
      // Add image files with simple names
      if (mainImageFile) {
        // Rename the file to avoid issues with special characters
        const renamedMainFile = new File(
          [mainImageFile], 
          `${safeFilename}_main${mainImageFile.name.substring(mainImageFile.name.lastIndexOf('.'))}`,
          { type: mainImageFile.type }
        );
        formData.append('mainImage', renamedMainFile);
      }
      
      if (sliderImageFiles.length > 0) {
        sliderImageFiles.forEach((file, index) => {
          // Rename each slider image file
          const renamedSliderFile = new File(
            [file], 
            `${safeFilename}_slider_${index}${file.name.substring(file.name.lastIndexOf('.'))}`,
            { type: file.type }
          );
          formData.append('sliderImages', renamedSliderFile);
        });
      }

      // For debugging - log the form data
      console.log('Form data contents:');
      for (let pair of formData.entries()) {
        // Don't log file contents, just their names
        if (pair[0] === 'mainImage' || pair[0] === 'sliderImages') {
          console.log(pair[0], pair[1].name);
        } else {
          console.log(pair[0], pair[1]);
        }
      }

      if (modalMode === "add") {
        // Create new product
        try {
          const response = await axios.post(ADD_PRODUCT_URL, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          console.log('Add product response:', response.data);
          Swal.fire({
            icon: "success",
            title: "تم",
            text: "تمت إضافة المنتج بنجاح",
          });
          handleCloseModal();
          fetchProducts();
        } catch (error) {
          console.error('Error adding product:', error);
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: error.response?.data?.message || error.message || "حدث خطأ أثناء حفظ بيانات المنتج",
          });
        }
        return; // Exit early
      } else {
        // Update existing product
        try {
          // Log the product ID being updated
          console.log('Updating product with ID:', selectedProduct._id);
          
          // Log the form data for debugging
          console.log('Form data contents before update:');
          for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
          }
          
          const response = await axios.put(`${UPDATE_PRODUCT_URL}/${selectedProduct._id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          console.log('Update product response:', response.data);
          
          // Check if the response indicates success
          if (response.data && (response.data.success || response.data.message === "Product updated successfully")) {
            Swal.fire({
              icon: "success",
              title: "تم",
              text: "تم تحديث بيانات المنتج بنجاح",
            });
            handleCloseModal();
            fetchProducts();
          } else {
            // Show error message if update failed
            Swal.fire({
              icon: "error",
              title: "خطأ",
              text: response.data?.message || "حدث خطأ أثناء تحديث بيانات المنتج",
            });
          }
        } catch (error) {
          console.error('Error updating product:', error);
          console.error('Error response:', error.response?.data);
          
          // Show detailed error message
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: error.response?.data?.message || error.message || "حدث خطأ أثناء تحديث بيانات المنتج",
          });
        }
        
        setLoading(false);
        return; // Exit early to avoid duplicate handleCloseModal and fetchProducts calls
      }
      
      // This code will only run for cases not handled above
      // (which should be none, as we have return statements in both branches)
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || error.message || "حدث خطأ أثناء حفظ بيانات المنتج",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (id) => {
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
        setLoading(true);
        try {
          await axios.delete(`${DELETE_PRODUCT_URL}/${id}`);
          Swal.fire({
            icon: "success",
            title: "تم الحذف!",
            text: "تم حذف المنتج بنجاح.",
          });
          fetchProducts();
        } catch (error) {
          console.error("Error deleting product:", error);
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "حدث خطأ أثناء حذف المنتج",
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Toggle view mode between table and grid
  const toggleViewMode = () => {
    setViewMode(viewMode === "table" ? "grid" : "table");
  };

  // Helper function to get image path safely
  const getImagePath = (image) => {
    if (!image) return '';
    
    // Handle different image formats
    if (typeof image === 'string') {
      // If the string already contains the full URL, return it as is
      if (image.startsWith('http')) {
        return image;
      }
      return `https://api.lineduc.com/productsImages/${image}`;
    } else if (image.en || image.ar) {
      const path = image.en || image.ar;
      // If the path already contains the full URL, return it as is
      if (path.startsWith('http')) {
        return path;
      }
      return `https://api.lineduc.com/productsImages/${path}`;
    } else if (image.name) {
      // Handle File objects for preview
      return URL.createObjectURL(image);
    }
    
    return '';
  };

  // Add a function to navigate to product details page
  const handleViewProductDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Render table view
  const renderTableView = () => (
    <Table responsive striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>الصورة</th>
          <th>العنوان</th>
          <th>الاسم</th>
          <th>الوصف</th>
          <th>السعر</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product, index) => (
          <tr key={product._id}>
            <td>{index + 1}</td>
            <td>
              {product.mainImage && (
                <img 
                  src={getImagePath(product.mainImage)} 
                  alt={product.name?.ar || product.name?.en} 
                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
              )}
            </td>
            <td>{product.title?.ar || product.title?.en}</td>
            <td>{product.name?.ar || product.name?.en}</td>
            <td>
              {(product.description?.ar || product.description?.en) && 
                ((product.description?.ar || product.description?.en).length > 50 
                  ? `${(product.description?.ar || product.description?.en).substring(0, 50)}...` 
                  : (product.description?.ar || product.description?.en))}
            </td>
            <td>
              {product.discountedPrice ? (
                <div>
                  <span className="text-decoration-line-through me-2">${Number(product.price).toFixed(2)}</span>
                  <span className="text-success">${Number(product.discountedPrice).toFixed(2)}</span>
                </div>
              ) : (
                <span>${Number(product.price || 0).toFixed(2)}</span>
              )}
            </td>
            <td>
              <Button
                variant="primary"
                size="sm"
                className="me-2"
                onClick={() => handleShowDetailsModal(product)}
              >
                عرض
              </Button>
              <Button
                variant="success"
                size="sm"
                className="me-2"
                onClick={() => handleViewProductDetails(product._id)}
              >
                صفحة المنتج
              </Button>
              <Button
                variant="info"
                size="sm"
                className="me-2"
                onClick={() => handleShowModal(product, "edit")}
              >
                تعديل
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteProduct(product._id)}
              >
                حذف
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  // Render grid view
  const renderGridView = () => (
    <Row xs={1} md={2} lg={3} className="g-4">
      {products.map((product) => (
        <Col key={product._id}>
          <Card className="h-100">
            {product.mainImage && (
              <Card.Img 
                variant="top" 
                src={getImagePath(product.mainImage)} 
                alt={product.name?.ar || product.name?.en}
                style={{ height: '200px', objectFit: 'cover' }}
              />
            )}
            <Card.Body>
              <Card.Title>{product.title?.ar || product.title?.en}</Card.Title>
              <Card.Text>
                {(product.description?.ar || product.description?.en) && 
                  ((product.description?.ar || product.description?.en).length > 100 
                    ? `${(product.description?.ar || product.description?.en).substring(0, 100)}...` 
                    : (product.description?.ar || product.description?.en))}
              </Card.Text>
              {/* Display price information */}
              <div className="mb-2">
                {product.discountedPrice ? (
                  <div>
                    <span className="text-decoration-line-through me-2">${Number(product.price).toFixed(2)}</span>
                    <span className="text-success fw-bold">${Number(product.discountedPrice).toFixed(2)}</span>
                    <span className="badge bg-danger ms-2">
                      {((1 - product.discountedPrice / product.price) * 100).toFixed(0)}% خصم
                    </span>
                  </div>
                ) : (
                  <span className="fw-bold">${Number(product.price || 0).toFixed(2)}</span>
                )}
              </div>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between flex-wrap">
              <Button
                variant="primary"
                size="sm"
                className="me-1 mb-1"
                onClick={() => handleShowDetailsModal(product)}
              >
                عرض
              </Button>
              <Button
                variant="success"
                size="sm"
                className="me-1 mb-1"
                onClick={() => handleViewProductDetails(product._id)}
              >
                صفحة المنتج
              </Button>
              <Button
                variant="info"
                size="sm"
                className="me-1 mb-1"
                onClick={() => handleShowModal(product, "edit")}
              >
                تعديل
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="mb-1"
                onClick={() => handleDeleteProduct(product._id)}
              >
                حذف
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  );

  // Add this new function to handle mainFeatures changes
  const handleMainFeatureChange = (index, field, lang, value) => {
    setSelectedProduct(prev => {
      const updatedFeatures = [...prev.mainFeatures];
      if (lang) {
        updatedFeatures[index] = {
          ...updatedFeatures[index],
          [field]: {
            ...updatedFeatures[index][field],
            [lang]: value
          }
        };
      } else {
        updatedFeatures[index] = {
          ...updatedFeatures[index],
          [field]: value
        };
      }
      return {
        ...prev,
        mainFeatures: updatedFeatures
      };
    });
  };

  // Add new function to handle learnsSection changes
  const handleLearnsSectionChange = (index, lang, value) => {
    setSelectedProduct(prev => {
      const updatedLearnsSection = [...prev.learnsSection];
      if (index >= updatedLearnsSection.length) {
        // Add new item if index doesn't exist
        updatedLearnsSection.push({ en: "", ar: "" });
      }
      updatedLearnsSection[index] = {
        ...updatedLearnsSection[index],
        [lang]: value
      };
      return {
        ...prev,
        learnsSection: updatedLearnsSection
      };
    });
  };

  // Add function to add new learns section item
  const addLearnsSectionItem = () => {
    setSelectedProduct(prev => ({
      ...prev,
      learnsSection: [...prev.learnsSection, { en: "", ar: "" }]
    }));
  };

  // Add function to remove learns section item
  const removeLearnsSectionItem = (index) => {
    setSelectedProduct(prev => ({
      ...prev,
      learnsSection: prev.learnsSection.filter((_, i) => i !== index)
    }));
  };

  // Add this function to render SVG icon
  const renderSvgIcon = (url) => {
    if (!url) return null;
    
    if (url.startsWith('<svg')) {
      // If it's an SVG string, render it directly
      return <div dangerouslySetInnerHTML={{ __html: url }} />;
    } else {
      // If it's a URL, render it as an image
      return (
        <img 
          src={url} 
          alt="Feature icon" 
          style={{ width: '48px', height: '48px' }} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/48?text=Icon';
          }}
        />
      );
    }
  };

  // Update the form fields rendering for mainFeatures
  const renderLanguageFields = (lang) => (
    <>
      <Form.Group className="mb-3">
        <Form.Label>العنوان ({lang === 'en' ? 'الإنجليزية' : 'العربية'})</Form.Label>
        <Form.Control
          type="text"
          value={selectedProduct.title?.[lang] || ""}
          onChange={(e) => handleNestedInputChange(e, 'title', lang)}
          required={lang === 'ar'}
        />
        <Form.Control.Feedback type="invalid">
          يرجى إدخال العنوان
        </Form.Control.Feedback>
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>الاسم ({lang === 'en' ? 'الإنجليزية' : 'العربية'})</Form.Label>
        <Form.Control
          type="text"
          value={selectedProduct.name?.[lang] || ""}
          onChange={(e) => handleNestedInputChange(e, 'name', lang)}
          required={lang === 'ar'}
        />
        <Form.Control.Feedback type="invalid">
          يرجى إدخال الاسم
        </Form.Control.Feedback>
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>الوصف ({lang === 'en' ? 'الإنجليزية' : 'العربية'})</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={selectedProduct.description?.[lang] || ""}
          onChange={(e) => handleNestedInputChange(e, 'description', lang)}
          required={lang === 'ar'}
        />
        <Form.Control.Feedback type="invalid">
          يرجى إدخال الوصف
        </Form.Control.Feedback>
      </Form.Group>
      
      <h5 className="mt-4 mb-3">تفاصيل المنتج</h5>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>الأبعاد ({lang === 'en' ? 'الإنجليزية' : 'العربية'})</Form.Label>
            <Form.Control
              type="text"
              value={selectedProduct.features?.dimensions?.[lang] || ""}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedProduct(prev => ({
                  ...prev,
                  features: {
                    ...prev.features,
                    dimensions: {
                      ...prev.features.dimensions,
                      [lang]: value
                    }
                  }
                }));
              }}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>عدد الصفحات ({lang === 'en' ? 'الإنجليزية' : 'العربية'})</Form.Label>
            <Form.Control
              type="text"
              value={selectedProduct.features?.pageCount?.[lang] || ""}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedProduct(prev => ({
                  ...prev,
                  features: {
                    ...prev.features,
                    pageCount: {
                      ...prev.features.pageCount,
                      [lang]: value
                    }
                  }
                }));
              }}
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>مكان النشر ({lang === 'en' ? 'الإنجليزية' : 'العربية'})</Form.Label>
            <Form.Control
              type="text"
              value={selectedProduct.features?.publishingPlace?.[lang] || ""}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedProduct(prev => ({
                  ...prev,
                  features: {
                    ...prev.features,
                    publishingPlace: {
                      ...prev.features.publishingPlace,
                      [lang]: value
                    }
                  }
                }));
              }}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>الطبعة ({lang === 'en' ? 'الإنجليزية' : 'العربية'})</Form.Label>
            <Form.Control
              type="text"
              value={selectedProduct.features?.edition?.[lang] || ""}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedProduct(prev => ({
                  ...prev,
                  features: {
                    ...prev.features,
                    edition: {
                      ...prev.features.edition,
                      [lang]: value
                    }
                  }
                }));
              }}
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>تاريخ النشر ({lang === 'en' ? 'الإنجليزية' : 'العربية'})</Form.Label>
            <Form.Control
              type="text"
              value={selectedProduct.features?.publishDate?.[lang] || ""}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedProduct(prev => ({
                  ...prev,
                  features: {
                    ...prev.features,
                    publishDate: {
                      ...prev.features.publishDate,
                      [lang]: value
                    }
                  }
                }));
              }}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>اللغة ({lang === 'en' ? 'الإنجليزية' : 'العربية'})</Form.Label>
            <Form.Control
              type="text"
              value={selectedProduct.features?.language?.[lang] || ""}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedProduct(prev => ({
                  ...prev,
                  features: {
                    ...prev.features,
                    language: {
                      ...prev.features.language,
                      [lang]: value
                    }
                  }
                }));
              }}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Learning Sections */}
      <div className="mt-4 mb-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>قسم التعلم</h5>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={addLearnsSectionItem}
          >
            إضافة قسم جديد
          </Button>
        </div>
        
        {selectedProduct.learnsSection.map((section, index) => (
          <div key={index} className="border p-3 mb-3 rounded">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6>القسم {index + 1}</h6>
              {index > 0 && (
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={() => removeLearnsSectionItem(index)}
                >
                  حذف
                </Button>
              )}
            </div>
            <Form.Group className="mb-3">
              <Form.Label>الوصف ({lang === 'en' ? 'الإنجليزية' : 'العربية'})</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={section[lang] || ""}
                onChange={(e) => handleLearnsSectionChange(index, lang, e.target.value)}
                placeholder={`أدخل الوصف ${lang === 'en' ? 'بالإنجليزية' : 'بالعربية'}`}
              />
            </Form.Group>
          </div>
        ))}
      </div>


      {/* Main Features Section */}
      <h5 className="mt-4 mb-3">المميزات الرئيسية</h5>
      {selectedProduct.mainFeatures.map((feature, index) => (
        <div key={index} className="border p-3 mb-3 rounded">
          <h6>الميزة {index + 1}</h6>
          <Form.Group className="mb-3">
            <Form.Label>الأيقونة (SVG رابط أو كود)</Form.Label>
            <Form.Control
              type="text"
              value={feature.icon}
              onChange={(e) => handleMainFeatureChange(index, 'icon', null, e.target.value)}
              placeholder="https://example.com/icon.svg أو <svg>...</svg>"
            />
            {feature.icon && (
              <div className="mt-2 text-center">
                <small className="text-muted mb-2 d-block">معاينة الأيقونة:</small>
                {renderSvgIcon(feature.icon)}
              </div>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>العنوان ({lang === 'en' ? 'الإنجليزية' : 'العربية'})</Form.Label>
            <Form.Control
              type="text"
              value={feature.title[lang] || ""}
              onChange={(e) => handleMainFeatureChange(index, 'title', lang, e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>الوصف ({lang === 'en' ? 'الإنجليزية' : 'العربية'})</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={feature.description[lang] || ""}
              onChange={(e) => handleMainFeatureChange(index, 'description', lang, e.target.value)}
            />
          </Form.Group>
        </div>
      ))}
    </>
  );

  // Update the details modal to display SVG icons properly
  const renderMainFeatures = (lang) => (
    <div className="mb-3">
      <h5>{lang === 'ar' ? 'المميزات الرئيسية' : 'Main Features'}</h5>
      <Row>
        {selectedProduct.mainFeatures.map((feature, index) => (
          <Col md={4} key={index} className="mb-3">
            <div className="text-center">
              <div className="mb-3">
                {renderSvgIcon(feature.icon)}
              </div>
              <h6>{feature.title[lang]}</h6>
              <p className="small">{feature.description[lang]}</p>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );

  // Update the Product Details Modal to show multiple learning sections
  const renderLearningSection = (lang) => (
    <div className="mb-3">
      <h5>{lang === 'ar' ? 'أقسام التعلم' : 'Learning Sections'}</h5>
      {selectedProduct.learnsSection.map((section, index) => (
        <div key={index} className="mb-3 p-3 border-bottom">
          <h6>{lang === 'ar' ? `القسم ${index + 1}` : `Section ${index + 1}`}</h6>
          <p>{section[lang] || (lang === 'ar' ? 'لا يوجد محتوى' : 'No content available')}</p>
        </div>
      ))}
    </div>
  );

  return (
    <Container className="py-4">
      <style>{productCarouselStyles}</style>
      <Row className="mb-4">
        <Col>
          <h2 className="text-center">إدارة المنتجات</h2>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col className="d-flex justify-content-between">
          <Button 
            variant="outline-secondary" 
            onClick={toggleViewMode}
          >
            {viewMode === "table" ? "عرض شبكي" : "عرض جدولي"}
          </Button>
          <Button variant="primary" onClick={() => handleShowModal()}>
            إضافة منتج جديد
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          {loading && (
            <div className="text-center my-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">جاري التحميل...</span>
              </Spinner>
            </div>
          )}
          
          {!loading && products.length === 0 ? (
            <div className="text-center my-3">
              <p>لا يوجد منتجات حالياً</p>
            </div>
          ) : (
            viewMode === "table" ? renderTableView() : renderGridView()
          )}
        </Col>
      </Row>

      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered dir="rtl" size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "add" ? "إضافة منتج جديد" : "تعديل بيانات المنتج"}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="alert alert-info mb-3">
              <small>ملاحظة: سيتم استخدام الاسم باللغة الإنجليزية لتسمية ملفات الصور</small>
            </div>
            
            {/* Add Buy Link field before the tabs */}
            <Form.Group className="mb-3">
              <Form.Label>رابط الشراء</Form.Label>
              <Form.Control
                type="url"
                value={selectedProduct.buyLink}
                onChange={(e) => setSelectedProduct({...selectedProduct, buyLink: e.target.value})}
                placeholder="https://example.com/buy"
              />
            </Form.Group>

            {/* Add Price and Discounted Price fields */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>السعر ($)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={selectedProduct.price || 0}
                    onChange={(e) => {console.log(e.target.value); setSelectedProduct({...selectedProduct, price: e.target.value})}}
                    placeholder="أدخل السعر"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    يرجى إدخال سعر صحيح
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>السعر بعد الخصم ($) (اختياري)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={selectedProduct.discountedPrice || ''}
                    onChange={(e) => {
                      const value = e.target.value.trim() === '' ? null : parseFloat(e.target.value);
                      setSelectedProduct({...selectedProduct, discountedPrice: value});
                    }}
                    placeholder="أدخل السعر بعد الخصم"
                  />
                  <Form.Text className="text-muted">
                    اتركه فارغًا إذا لم يكن هناك خصم
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Tabs defaultActiveKey="en" id="language-tabs" className="mb-3">
              <Tab eventKey="en" title="الإنجليزية">
                {renderLanguageFields('en')}
              </Tab>
              <Tab eventKey="ar" title="العربية">
                {renderLanguageFields('ar')}
              </Tab>
            </Tabs>
            
            <Row className="mb-4 mt-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>الصورة الرئيسية</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                  />
                </Form.Group>
                {mainImagePreview && (
                  <div className="text-center">
                    <Image 
                      src={mainImagePreview} 
                      alt="معاينة الصورة الرئيسية" 
                      fluid 
                      thumbnail 
                      style={{ maxHeight: '200px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/200?text=Error+Loading+Image';
                      }}
                    />
                  </div>
                )}
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>صور العرض (يمكن اختيار عدة صور)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSliderImagesChange}
                  />
                </Form.Group>
                {sliderImagePreviews.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    {sliderImagePreviews.map((preview, index) => (
                      <Image 
                        key={index}
                        src={preview} 
                        alt={`معاينة صورة العرض ${index + 1}`} 
                        thumbnail 
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/80?text=Error';
                        }}
                      />
                    ))}
                  </div>
                )}
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              إلغاء
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="ms-2">جاري الحفظ...</span>
                </>
              ) : (
                "حفظ"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Product Details Modal */}
      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>تفاصيل المنتج</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  {selectedProduct.mainImage && (
                    <Image 
                      src={getImagePath(selectedProduct.mainImage)} 
                      alt={selectedProduct.name?.ar || selectedProduct.name?.en}
                      fluid 
                      className="product-main-image"
                      style={{ maxHeight: '300px', objectFit: 'contain' }}
                    />
                  )}
                </Col>
                <Col md={6}>
                  <h3>{selectedProduct.title?.ar || selectedProduct.title?.en}</h3>
                  <h5>{selectedProduct.name?.ar || selectedProduct.name?.en}</h5>
                </Col>
              </Row>

              {/* Add Buy Link */}
              {selectedProduct.buyLink && (
                <div className="mb-3">
                  <h5>رابط الشراء</h5>
                  <a href={selectedProduct.buyLink} target="_blank" rel="noopener noreferrer">
                    {selectedProduct.buyLink}
                  </a>
                </div>
              )}

              {/* Add Price Information */}
              <div className="mb-3">
                <h5>معلومات السعر</h5>
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <strong>السعر الأساسي:</strong> ${selectedProduct.price ? Number(selectedProduct.price).toFixed(2) : '0.00'}
                  </div>
                  {selectedProduct.discountedPrice && (
                    <div className="ms-3">
                      <strong>السعر بعد الخصم:</strong> ${Number(selectedProduct.discountedPrice).toFixed(2)}
                      <span className="badge bg-success ms-2">
                        {((1 - selectedProduct.discountedPrice / selectedProduct.price) * 100).toFixed(0)}% خصم
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Tabs defaultActiveKey="ar" id="product-details-tabs" className="mb-3">
                <Tab eventKey="ar" title="العربية">
                  <div className="mb-3">
                    <h5>الوصف</h5>
                    <p>{selectedProduct.description?.ar || "لا يوجد وصف بالعربية"}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h5>المميزات</h5>
                    <p>{selectedProduct.features?.ar || "لا توجد مميزات بالعربية"}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h5>الأبعاد</h5>
                    <p>{selectedProduct.features.dimensions?.ar || "لا توجد أبعاد بالعربية"}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h5>عدد الصفحات</h5>
                    <p>{selectedProduct.features.pageCount?.ar || "غير محدد"}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h5>مكان النشر</h5>
                    <p>{selectedProduct.features.publishingPlace?.ar || "غير محدد"}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h5>الطبعة</h5>
                    <p>{selectedProduct.features.edition?.ar || "غير محدد"}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h5>تاريخ النشر</h5>
                    <p>{selectedProduct.features.publishDate?.ar || "غير محدد"}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h5>اللغة</h5>
                    <p>{selectedProduct.features.language?.ar || "غير محدد"}</p>
                  </div>

                  {renderMainFeatures('ar')}
                  {renderLearningSection('ar')}
                </Tab>
                
                <Tab eventKey="en" title="English">
                  <div className="mb-3">
                    <h5>Description</h5>
                    <p>{selectedProduct.description?.en || "No English description available"}</p>
                  </div>
                  
                  {/* <div className="mb-3">
                    <h5>Features</h5>
                    <p>{selectedProduct.features?.en || "No English features available"}</p>
                  </div> */}
                  
                  <div className="mb-3">
                    <h5>Dimensions</h5>
                    <p>{selectedProduct.features.dimensions?.en || "Not specified"}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h5>Page Count</h5>
                    <p>{selectedProduct.features.pageCount?.en || "Not specified"}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h5>Publishing Place</h5>
                    <p>{selectedProduct.features.publishingPlace?.en || "Not specified"}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h5>Edition</h5>
                    <p>{selectedProduct.features.edition?.en || "Not specified"}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h5>Publish Date</h5>
                    <p>{selectedProduct.features.publishDate?.en || "Not specified"}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h5>Language</h5>
                    <p>{selectedProduct.features.language?.en || "Not specified"}</p>
                  </div>

                  {renderMainFeatures('en')}
                  {renderLearningSection('en')}
                </Tab>
              </Tabs>
              
              <div className="mt-4">
                <h5>صور المنتج</h5>
                <div className="product-gallery">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={10}
                    slidesPerView={1}
                    navigation={true}
                    pagination={{ clickable: true }}
                    className="product-main-swiper mb-3"
                  >
                    <SwiperSlide>
                      <div className="main-image-container">
                        <img
                          src={getImagePath(selectedProduct.mainImage)}
                          alt={selectedProduct.name?.ar || selectedProduct.name?.en}
                          style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                        />
                      </div>
                    </SwiperSlide>
                    
                    {selectedProduct.sliderImages && selectedProduct.sliderImages.map((image, index) => (
                      <SwiperSlide key={index}>
                        <div className="slider-image-container">
                          <img
                            src={getImagePath(image)}
                            alt={`صورة ${index + 1}`}
                            style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  
                  {selectedProduct.sliderImages && selectedProduct.sliderImages.length > 0 && (
                    <Swiper
                      modules={[Navigation]}
                      spaceBetween={10}
                      slidesPerView={4}
                      navigation={true}
                      className="product-thumbs-swiper"
                      breakpoints={{
                        320: { slidesPerView: 2, spaceBetween: 10 },
                        480: { slidesPerView: 3, spaceBetween: 10 },
                        768: { slidesPerView: 4, spaceBetween: 10 },
                        992: { slidesPerView: 5, spaceBetween: 10 },
                      }}
                    >
                      <SwiperSlide>
                        <div className="thumb-image-container">
                          <img
                            src={getImagePath(selectedProduct.mainImage)}
                            alt={selectedProduct.name?.ar || selectedProduct.name?.en}
                            style={{ width: '100%', height: '80px', objectFit: 'cover', cursor: 'pointer', borderRadius: '5px' }}
                          />
                        </div>
                      </SwiperSlide>
                      
                      {selectedProduct.sliderImages.map((image, index) => (
                        <SwiperSlide key={index}>
                          <div className="thumb-image-container">
                            <img
                              src={getImagePath(image)}
                              alt={`صورة مصغرة ${index + 1}`}
                              style={{ width: '100%', height: '80px', objectFit: 'cover', cursor: 'pointer', borderRadius: '5px' }}
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailsModal}>
            إغلاق
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
} 