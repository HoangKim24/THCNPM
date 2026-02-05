// Hiển thị ảnh preview khi chọn file
function previewImage(input, imgPreviewId) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById(imgPreviewId).src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}
