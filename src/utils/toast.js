import Swal from 'sweetalert2';

// Success toast notification
export const showSuccessToast = (message) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
};

// Error toast notification
export const showErrorToast = (message) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'error',
    title: message,
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
};

// Warning toast notification
export const showWarningToast = (message) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'warning',
    title: message,
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
};

// Info toast notification
export const showInfoToast = (message) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'info',
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
};

// Confirmation dialog
export const showConfirmDialog = (options) => {
  const defaultOptions = {
    title: 'هل أنت متأكد؟',
    text: 'لن تتمكن من التراجع عن هذا الإجراء',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'نعم',
    cancelButtonText: 'إلغاء',
    reverseButtons: true
  };

  return Swal.fire({
    ...defaultOptions,
    ...options
  });
};

// Loading dialog
export const showLoading = (message = 'جاري التحميل...') => {
  Swal.fire({
    title: message,
    allowEscapeKey: false,
    allowOutsideClick: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    }
  });
};

// Close loading dialog
export const closeLoading = () => {
  Swal.close();
};

// Success dialog
export const showSuccessDialog = (options) => {
  const defaultOptions = {
    icon: 'success',
    confirmButtonColor: '#3085d6',
    confirmButtonText: 'موافق'
  };

  return Swal.fire({
    ...defaultOptions,
    ...options
  });
};

// Error dialog
export const showErrorDialog = (options) => {
  const defaultOptions = {
    icon: 'error',
    confirmButtonColor: '#d33',
    confirmButtonText: 'موافق'
  };

  return Swal.fire({
    ...defaultOptions,
    ...options
  });
};

// Custom alert
export const showAlert = (options) => {
  return Swal.fire(options);
}; 