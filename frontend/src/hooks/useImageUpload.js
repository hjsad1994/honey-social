import { useState } from 'react';

/**
 * Hook xử lý upload và xem trước hình ảnh
 * @param {object} options - Các tùy chọn cho hook
 * @param {function} options.onImageChange - Hàm callback khi hình ảnh thay đổi
 * @param {number} options.maxSize - Kích thước tối đa của file (bytes)
 * @param {string} options.acceptedTypes - Các định dạng file được chấp nhận
 * @returns {object} Các giá trị và hàm xử lý hình ảnh
 */
const useImageUpload = (options = {}) => {
  const {
    onImageChange,
    maxSize = 5 * 1024 * 1024, // 5MB mặc định
    acceptedTypes = 'image/*' 
  } = options;

  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    setError(null);
    const file = e.target.files[0];
    
    if (!file) return;

    // Kiểm tra kích thước file
    if (maxSize && file.size > maxSize) {
      setError(`File quá lớn. Kích thước tối đa là ${maxSize / 1024 / 1024}MB`);
      return;
    }

    // Kiểm tra loại file
    if (acceptedTypes !== 'image/*') {
      const fileType = file.type;
      const acceptedTypesList = acceptedTypes.split(',');
      if (!acceptedTypesList.some(type => fileType.match(type))) {
        setError(`Chỉ chấp nhận các định dạng: ${acceptedTypes}`);
        return;
      }
    }

    // Tạo URL xem trước
    const previewURL = URL.createObjectURL(file);
    setImagePreview(previewURL);
    
    // Lưu thông tin file
    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Chuyển file thành base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      setImageBase64(base64Data);
      
      // Gọi callback nếu được cung cấp
      if (onImageChange) {
        onImageChange(base64Data, file);
      }
    };
    reader.readAsDataURL(file);
  };

  // Hàm để reset tất cả state
  const resetImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview); // Giải phóng bộ nhớ
    }
    setImagePreview(null);
    setImageBase64(null);
    setFileInfo(null);
    setError(null);
  };

  return {
    imagePreview,
    imageBase64,
    fileInfo,
    error,
    handleImageChange,
    resetImage,
    acceptedTypes
  };
};

export default useImageUpload;