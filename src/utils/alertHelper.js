import Swal from 'sweetalert2';

const swalCustom = Swal.mixin({
  customClass: {
    confirmButton: 'btn-confirm-swal',
    cancelButton: 'btn-cancel-swal',  
    popup: 'font-inter-popup'    
  },
  buttonsStyling: false 
});


export const confirmDelete = async (message = "Bạn có chắc chắn muốn xóa?") => {
  const result = await swalCustom.fire({
    title: 'Xác nhận xóa?',
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xóa ngay',
    cancelButtonText: 'Hủy bỏ',
    reverseButtons: true
  });
  return result.isConfirmed;
};

export const notifySuccess = (message) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  Toast.fire({
    icon: 'success',
    title: message
  });
};

export const notifyError = (message) => {
  Swal.fire({
    icon: 'error',
    title: 'Đã xảy ra lỗi!',
    text: message,
    confirmButtonColor: '#6d4c41'
  });
};