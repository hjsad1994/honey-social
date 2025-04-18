import { useState } from 'react';


interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface UseImageUploadOptions {
  onImageChange?: (base64Data: string, file: File) => void;
  maxSize?: number;
  acceptedTypes?: string;
}

interface UseImageUploadReturn {
  imagePreview: string | null;
  imageBase64: string | null;
  fileInfo: FileInfo | null;
  error: string | null;
  cloudinaryUrl: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetImage: () => void;
  setCloudinaryData: (url: string) => string;
  acceptedTypes: string;
}

/**
 * Hook xử lý upload và xem trước hình ảnh
 * @param options - Các tùy chọn cho hook
 * @returns Các giá trị và hàm xử lý hình ảnh
 */
const useImageUpload = (options: UseImageUploadOptions = {}): UseImageUploadReturn => {
  const {
    onImageChange,
    maxSize = 5 * 1024 * 1024, // 5MB mặc định
    acceptedTypes = 'image/*' 
  } = options;

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setError(null);
    const file = e.target.files?.[0];
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

    // Tránh rò rỉ bộ nhớ bằng cách revoke URL trước đó nếu có
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    // Tạo URL xem trước - KHÔNG thêm timestamp vào URL xem trước
    const previewURL = URL.createObjectURL(file);
    console.log("Preview URL created:", previewURL); // Log để kiểm tra
    setImagePreview(previewURL);
    
    // Lưu thông tin file
    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    // Chuyển file thành base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      setImageBase64(base64Data);
      
      // Gọi callback nếu được cung cấp
      if (onImageChange) {
        onImageChange(base64Data, file);
      }
    };
    reader.readAsDataURL(file);
  };

  // Hàm để reset tất cả state
  const resetImage = (): void => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview.split('?')[0]); // Giải phóng bộ nhớ
    }
    setImagePreview(null);
    setImageBase64(null);
    setFileInfo(null);
    setCloudinaryUrl(null);
    setError(null);
  };

  // Hàm cập nhật URL Cloudinary
  const setCloudinaryData = (url: string): string => {
    // Get the clean URL without any parameters
    const cleanUrl = url.split('?')[0];
    setCloudinaryUrl(cleanUrl);
    return cleanUrl;
  };

  return {
    imagePreview,
    imageBase64,
    fileInfo,
    error,
    cloudinaryUrl,
    handleImageChange,
    resetImage,
    setCloudinaryData,
    acceptedTypes
  };
};

// Example usage in your component when displaying images
function getImageUrlWithCacheBuster(url: string | undefined): string {
  if (!url) return "";
  return `${url}?t=${Date.now()}`;
}

// Then use it like this:
// <Avatar src={getImageUrlWithCacheBuster(user.profilePic)} />

export default useImageUpload;