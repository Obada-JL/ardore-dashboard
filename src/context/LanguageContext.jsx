import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

// Comprehensive translations for dashboard
const translations = {
    ar: {
        // Common
        loading: 'جاري التحميل...',
        error: 'خطأ',
        success: 'نجح',
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        add: 'إضافة',
        view: 'عرض',
        search: 'البحث',
        actions: 'الإجراءات',
        status: 'الحالة',
        active: 'نشط',
        inactive: 'غير نشط',
        yes: 'نعم',
        no: 'لا',
        confirm: 'تأكيد',
        back: 'العودة',
        next: 'التالي',
        previous: 'السابق',
        total: 'المجموع',
        close: 'إغلاق',
        notes: 'ملاحظات',
        optional: 'اختياري',
        sale: 'تخفيض',

        // Navigation
        home: 'الرئيسية',
        products: 'المنتجات',
        perfumes: 'العطور',
        orders: 'الطلبات',
        discounts: 'الخصومات',
        messages: 'الرسائل',
        users: 'المستخدمين',
        about: 'حول',
        settings: 'الإعدادات',
        logout: 'تسجيل الخروج',

        // Dashboard
        dashboard: 'لوحة التحكم',
        welcomeTitle: 'أهلاً بكم في لوحة التحكم الخاصة بشركة Ardore للعطور المميزة',
        welcomeSubtitle: 'يمكنكم البدء باختيار قسم من القائمة أعلاه',

        // Products
        productTitle: 'عنوان المنتج',
        productDescription: 'وصف المنتج',
        productPrice: 'سعر المنتج',
        productImage: 'صورة المنتج',
        productImages: 'صور المنتج',
        productSizes: 'أحجام المنتج',
        productFeatures: 'مميزات المنتج',
        productIngredients: 'مكونات المنتج',
        productInfo: 'معلومات المنتج',
        productAbout: 'حول المنتج',
        productCategory: 'فئة المنتج',
        addProduct: 'إضافة منتج جديد',
        editProduct: 'تعديل المنتج',
        deleteProduct: 'حذف المنتج',
        productAdded: 'تمت إضافة المنتج بنجاح',
        productUpdated: 'تم تحديث المنتج بنجاح',
        productDeleted: 'تم حذف المنتج بنجاح',
        noProducts: 'لا توجد منتجات',
        noProductsFound: 'لم يتم العثور على منتجات',
        selectProduct: 'اختر منتج',
        favorite: 'مفضل',

        // Orders
        orderNumber: 'رقم الطلب',
        orderDate: 'تاريخ الطلب',
        orderStatus: 'حالة الطلب',
        orderTotal: 'إجمالي الطلب',
        orderCustomer: 'العميل',
        orderItems: 'عناصر الطلب',
        orderDetails: 'تفاصيل الطلب',
        customerName: 'اسم العميل',
        customerEmail: 'بريد العميل',
        customerPhone: 'هاتف العميل',
        customerAddress: 'عنوان العميل',
        customerInfo: 'معلومات العميل',
        paymentMethod: 'طريقة الدفع',
        paymentStatus: 'حالة الدفع',
        quantity: 'الكمية',
        size: 'الحجم',
        quality: 'الجودة',
        pending: 'معلق',
        confirmed: 'مؤكد',
        processing: 'قيد المعالجة',
        shipped: 'تم الشحن',
        delivered: 'تم التسليم',
        cancelled: 'ملغي',
        paid: 'مدفوع',
        failed: 'فشل',
        refunded: 'مسترد',
        cash: 'نقداً',
        card: 'بطاقة',
        bankTransfer: 'تحويل بنكي',
        noOrders: 'لا توجد طلبات',
        noOrdersFound: 'لم يتم العثور على طلبات',

        // Discounts
        discountCode: 'رمز الخصم',
        discountName: 'اسم الخصم',
        discountDescription: 'وصف الخصم',
        discountType: 'نوع الخصم',
        discountValue: 'قيمة الخصم',
        discountStartDate: 'تاريخ البداية',
        discountEndDate: 'تاريخ النهاية',
        discountUsageLimit: 'حد الاستخدام',
        discountUsageCount: 'عدد الاستخدامات',
        percentage: 'نسبة مئوية',
        fixed: 'مبلغ ثابت',

        // Messages
        senderName: 'اسم المرسل',
        senderEmail: 'بريد المرسل',
        senderPhone: 'هاتف المرسل',
        messageSubject: 'موضوع الرسالة',
        messageContent: 'محتوى الرسالة',
        messageDate: 'تاريخ الرسالة',
        messageStatus: 'حالة الرسالة',
        reply: 'رد',
        replied: 'تم الرد',
        unread: 'غير مقروء',
        read: 'مقروء',
        flagged: 'مميز',
        archived: 'مؤرشف',

        // Users
        username: 'اسم المستخدم',
        fullName: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        role: 'الدور',
        lastLogin: 'آخر تسجيل دخول',
        createdAt: 'تاريخ الإنشاء',
        admin: 'مدير',
        user: 'مستخدم',

        // About
        aboutTitle: 'عنوان الصفحة',
        aboutDescription: 'وصف الصفحة',
        aboutImage: 'صورة الصفحة',
        socialLinks: 'روابط التواصل الاجتماعي',
        contactInfo: 'معلومات الاتصال',
        location: 'الموقع',
        phone: 'الهاتف',

        // Login
        login: 'تسجيل الدخول',
        loginTitle: 'تسجيل الدخول إلى لوحة التحكم',
        password: 'كلمة المرور',
        rememberMe: 'تذكرني',
        forgotPassword: 'نسيت كلمة المرور؟',
        invalidCredentials: 'بيانات الاعتماد غير صحيحة',
        logoutConfirm: 'سيتم تسجيل خروجك!',

        // Validation
        required: 'هذا الحقل مطلوب',
        invalidEmail: 'البريد الإلكتروني غير صحيح',
        invalidPhone: 'رقم الهاتف غير صحيح',
        passwordMinLength: 'كلمة المرور يجب أن تكون على الأقل 6 أحرف',

        // Notifications
        deleteConfirm: 'هل أنت متأكد من الحذف؟',
        deleteConfirmText: 'لن تتمكن من التراجع عن هذا الإجراء',
        loginSuccess: 'تم تسجيل الدخول بنجاح',
        logoutSuccess: 'تم تسجيل الخروج بنجاح',
        updateSuccess: 'تم التحديث بنجاح',
        deleteSuccess: 'تم الحذف بنجاح',
        createSuccess: 'تم الإنشاء بنجاح',

        // Language
        language: 'اللغة',
        arabic: 'العربية',
        turkish: 'التركية',

        // Forms
        uploadImage: 'رفع صورة',
        selectFile: 'اختر ملف',
        dragDropImage: 'اسحب وأسقط الصورة هنا أو انقر للاختيار',
        maxFileSize: 'الحد الأقصى لحجم الملف',
        allowedFormats: 'الصيغ المسموحة',

        // Statistics
        statistics: 'الإحصائيات',
        totalOrders: 'إجمالي الطلبات',
        totalProducts: 'إجمالي المنتجات',
        totalUsers: 'إجمالي المستخدمين',
        totalMessages: 'إجمالي الرسائل',
        revenue: 'الإيرادات',

        // Filters
        filter: 'تصفية',
        filterBy: 'تصفية بواسطة',
        sortBy: 'ترتيب بواسطة',
        dateRange: 'النطاق الزمني',
        from: 'من',
        to: 'إلى',

        // Pagination
        itemsPerPage: 'عناصر في الصفحة',
        page: 'الصفحة',
        of: 'من',
        showing: 'عرض',
        results: 'النتائج'
    },

    tr: {
        // Common
        loading: 'Yükleniyor...',
        error: 'Hata',
        success: 'Başarılı',
        save: 'Kaydet',
        cancel: 'İptal',
        delete: 'Sil',
        edit: 'Düzenle',
        add: 'Ekle',
        view: 'Görüntüle',
        search: 'Ara',
        actions: 'İşlemler',
        status: 'Durum',
        active: 'Aktif',
        inactive: 'Pasif',
        yes: 'Evet',
        no: 'Hayır',
        confirm: 'Onayla',
        back: 'Geri',
        next: 'İleri',
        previous: 'Önceki',
        total: 'Toplam',
        close: 'Kapat',
        notes: 'Notlar',
        optional: 'Opsiyonel',
        sale: 'İndirim',

        // Navigation
        home: 'Ana Sayfa',
        products: 'Ürünler',
        perfumes: 'Parfümler',
        orders: 'Siparişler',
        discounts: 'İndirimler',
        messages: 'Mesajlar',
        users: 'Kullanıcılar',
        about: 'Hakkında',
        settings: 'Ayarlar',
        logout: 'Çıkış Yap',

        // Dashboard
        dashboard: 'Kontrol Paneli',
        welcomeTitle: 'Ardore Parfüm Şirketi Kontrol Paneline Hoş Geldiniz',
        welcomeSubtitle: 'Yukarıdaki menüden bir bölüm seçerek başlayabilirsiniz',

        // Products
        productTitle: 'Ürün Başlığı',
        productDescription: 'Ürün Açıklaması',
        productPrice: 'Ürün Fiyatı',
        productImage: 'Ürün Resmi',
        productImages: 'Ürün Resimleri',
        productSizes: 'Ürün Boyutları',
        productFeatures: 'Ürün Özellikleri',
        productIngredients: 'Ürün İçeriği',
        productInfo: 'Ürün Bilgisi',
        productAbout: 'Ürün Hakkında',
        productCategory: 'Ürün Kategorisi',
        addProduct: 'Yeni Ürün Ekle',
        editProduct: 'Ürün Düzenle',
        deleteProduct: 'Ürün Sil',
        productAdded: 'Ürün başarıyla eklendi',
        productUpdated: 'Ürün başarıyla güncellendi',
        productDeleted: 'Ürün başarıyla silindi',
        noProducts: 'Ürün bulunamadı',
        noProductsFound: 'Ürün bulunamadı',
        selectProduct: 'Ürün seç',
        favorite: 'Favori',

        // Orders
        orderNumber: 'Sipariş Numarası',
        orderDate: 'Sipariş Tarihi',
        orderStatus: 'Sipariş Durumu',
        orderTotal: 'Sipariş Toplamı',
        orderCustomer: 'Müşteri',
        orderItems: 'Sipariş Öğeleri',
        orderDetails: 'Sipariş Detayları',
        customerName: 'Müşteri Adı',
        customerEmail: 'Müşteri E-postası',
        customerPhone: 'Müşteri Telefonu',
        customerAddress: 'Müşteri Adresi',
        customerInfo: 'Müşteri Bilgileri',
        paymentMethod: 'Ödeme Yöntemi',
        paymentStatus: 'Ödeme Durumu',
        quantity: 'Miktar',
        size: 'Boyut',
        quality: 'Kalite',
        pending: 'Beklemede',
        confirmed: 'Onaylandı',
        processing: 'İşleniyor',
        shipped: 'Gönderildi',
        delivered: 'Teslim Edildi',
        cancelled: 'İptal Edildi',
        paid: 'Ödendi',
        failed: 'Başarısız',
        refunded: 'İade Edildi',
        cash: 'Nakit',
        card: 'Kart',
        bankTransfer: 'Banka Transferi',
        noOrders: 'Sipariş bulunamadı',
        noOrdersFound: 'Sipariş bulunamadı',

        // Discounts
        discountCode: 'İndirim Kodu',
        discountName: 'İndirim Adı',
        discountDescription: 'İndirim Açıklaması',
        discountType: 'İndirim Türü',
        discountValue: 'İndirim Değeri',
        discountStartDate: 'Başlangıç Tarihi',
        discountEndDate: 'Bitiş Tarihi',
        discountUsageLimit: 'Kullanım Sınırı',
        discountUsageCount: 'Kullanım Sayısı',
        percentage: 'Yüzde',
        fixed: 'Sabit Miktar',

        // Messages
        senderName: 'Gönderen Adı',
        senderEmail: 'Gönderen E-postası',
        senderPhone: 'Gönderen Telefonu',
        messageSubject: 'Mesaj Konusu',
        messageContent: 'Mesaj İçeriği',
        messageDate: 'Mesaj Tarihi',
        messageStatus: 'Mesaj Durumu',
        reply: 'Yanıtla',
        replied: 'Yanıtlandı',
        unread: 'Okunmamış',
        read: 'Okundu',
        flagged: 'İşaretlendi',
        archived: 'Arşivlendi',

        // Users
        username: 'Kullanıcı Adı',
        fullName: 'Tam Adı',
        email: 'E-posta',
        role: 'Rol',
        lastLogin: 'Son Giriş',
        createdAt: 'Oluşturulma Tarihi',
        admin: 'Yönetici',
        user: 'Kullanıcı',

        // About
        aboutTitle: 'Sayfa Başlığı',
        aboutDescription: 'Sayfa Açıklaması',
        aboutImage: 'Sayfa Resmi',
        socialLinks: 'Sosyal Medya Bağlantıları',
        contactInfo: 'İletişim Bilgileri',
        location: 'Konum',
        phone: 'Telefon',

        // Login
        login: 'Giriş Yap',
        loginTitle: 'Kontrol Paneline Giriş',
        password: 'Şifre',
        rememberMe: 'Beni Hatırla',
        forgotPassword: 'Şifrenizi mi unuttunuz?',
        invalidCredentials: 'Geçersiz kimlik bilgileri',
        logoutConfirm: 'Çıkış yapılacak!',

        // Validation
        required: 'Bu alan zorunludur',
        invalidEmail: 'Geçersiz e-posta adresi',
        invalidPhone: 'Geçersiz telefon numarası',
        passwordMinLength: 'Şifre en az 6 karakter olmalıdır',

        // Notifications
        deleteConfirm: 'Silmek istediğinizden emin misiniz?',
        deleteConfirmText: 'Bu işlemi geri alamazsınız',
        loginSuccess: 'Başarıyla giriş yapıldı',
        logoutSuccess: 'Başarıyla çıkış yapıldı',
        updateSuccess: 'Başarıyla güncellendi',
        deleteSuccess: 'Başarıyla silindi',
        createSuccess: 'Başarıyla oluşturuldu',

        // Language
        language: 'Dil',
        arabic: 'Arapça',
        turkish: 'Türkçe',

        // Forms
        uploadImage: 'Resim Yükle',
        selectFile: 'Dosya Seç',
        dragDropImage: 'Resmi buraya sürükleyin veya tıklayın',
        maxFileSize: 'Maksimum dosya boyutu',
        allowedFormats: 'İzin verilen formatlar',

        // Statistics
        statistics: 'İstatistikler',
        totalOrders: 'Toplam Siparişler',
        totalProducts: 'Toplam Ürünler',
        totalUsers: 'Toplam Kullanıcılar',
        totalMessages: 'Toplam Mesajlar',
        revenue: 'Gelir',

        // Filters
        filter: 'Filtrele',
        filterBy: 'Filtrele',
        sortBy: 'Sırala',
        dateRange: 'Tarih Aralığı',
        from: 'Başlangıç',
        to: 'Bitiş',

        // Pagination
        itemsPerPage: 'Sayfa başına öğe',
        page: 'Sayfa',
        of: 'toplam',
        showing: 'Gösteriliyor',
        results: 'sonuç'
    }
};

export const LanguageProvider = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState(() => {
        return localStorage.getItem('dashboardLanguage') || 'ar';
    });

    useEffect(() => {
        localStorage.setItem('dashboardLanguage', currentLanguage);
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = currentLanguage;
    }, [currentLanguage]);

    const changeLanguage = (lang) => {
        if (lang === 'ar' || lang === 'tr') {
            setCurrentLanguage(lang);
        }
    };

    const t = (key, params = {}) => {
        const translation = translations[currentLanguage][key] || key;

        // Simple parameter replacement
        return Object.keys(params).reduce((str, param) => {
            return str.replace(`{${param}}`, params[param]);
        }, translation);
    };

    const getBilingualText = (textObj, fallbackLang = 'ar') => {
        if (!textObj) return '';
        if (typeof textObj === 'string') return textObj;

        return textObj[currentLanguage] || textObj[fallbackLang] || textObj.ar || textObj.tr || '';
    };

    const value = {
        currentLanguage,
        changeLanguage,
        t,
        getBilingualText,
        isRTL: currentLanguage === 'ar',
        availableLanguages: [
            { code: 'ar', name: 'العربية', flag: '🇸🇦' },
            { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
        ]
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}; 