import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  Text,
  VStack,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Divider,
  Spinner,
  Skeleton,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState, useEffect, useRef, FormEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../reducers/userReducer';
import useShowToast from '../hooks/useShowToast';
// import { useNavigate } from 'react-router-dom';
import useImageUpload from '../hooks/useImageUpload';
import { RootState } from '../store/store';
// import { User } from '../types/types';

interface UpdateProfilePageProps {
  onUpdateSuccess?: () => void;
}

interface ProfileInputs {
  name: string;
  username: string;
  email: string;
  bio: string;
  password: string;
  profilePic: string;
}

interface ValidationErrors {
  name?: string;
  username?: string;
  email?: string;
}

const UpdateProfilePage: React.FC<UpdateProfilePageProps> = (props) => {
  const dispatch = useDispatch();
  const showToast = useShowToast();
  // Keep navigate since it might be used in future updates
  // const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.user.user);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Refs for DOM elements
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // State for inline editing
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [isEditingPassword, setIsEditingPassword] = useState<boolean>(false);

  // Form data
  const [inputs, setInputs] = useState<ProfileInputs>({
    name: '',
    username: '',
    email: '',
    bio: '',
    password: '',
    profilePic: '',
  });

  // Custom hook for image upload
  const {
    imagePreview,
    handleImageChange,
    error: uploadError,
  } = useImageUpload({
    maxSize: 5 * 1024 * 1024, // 5MB
    onImageChange: (base64Data: string) => {
      setInputs((prev) => ({ ...prev, profilePic: base64Data }));
      setCloudinaryUrl(null);
    },
  });

  // Pre-compute theme color values
  const bgColor = useColorModeValue('white', 'black');
  const textColor = useColorModeValue('black', 'white');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const dividerColor = useColorModeValue('gray.200', 'gray.600');
  const buttonBgSubmit = useColorModeValue('black', 'white');
  const buttonBgSubmitHover = useColorModeValue('gray.800', 'gray.700');
  const buttonTextColor = useColorModeValue('white', 'black');
  const avatarBg = useColorModeValue('gray.300', 'gray.600');
  const popoverBg = useColorModeValue('white', 'gray.700');
  const popoverBorder = useColorModeValue('#CBD5E0', 'gray.600');
  const popoverButtonBg = useColorModeValue('white', 'gray.700');
  const popoverButtonHoverBg = useColorModeValue('gray.100', 'gray.600');
  const errorTextColor = useColorModeValue('red.500', 'red.300');

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setInputs({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        password: '',
        profilePic: user.profilePic || '',
      });
      setImageError(false);
      if (user.profilePic) {
        setImageLoading(true);
        const img = new window.Image();
        img.onload = () => setImageLoading(false);
        img.onerror = () => {
          setImageError(true);
          setImageLoading(false);
        };
        img.src = user.profilePic;
      }
    }
  }, [user]); // Added user to dependency array

  // Show toast for image upload errors
  useEffect(() => {
    if (uploadError) {
      showToast('Lỗi', uploadError, 'error');
    }
  }, [uploadError, showToast]);

  // Reset image error when cloudinary URL is set
  useEffect(() => {
    if (cloudinaryUrl || imagePreview) {
      setImageError(false);
    }
  }, [cloudinaryUrl, imagePreview]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingName && nameRef.current) nameRef.current.focus();
    if (isEditingUsername && usernameRef.current) usernameRef.current.focus();
    if (isEditingEmail && emailRef.current) emailRef.current.focus();
    if (isEditingBio && bioRef.current) bioRef.current.focus();
    if (isEditingPassword && passwordRef.current) passwordRef.current.focus();
  }, [isEditingName, isEditingUsername, isEditingEmail, isEditingBio, isEditingPassword]);

  const getValidAvatarUrl = (): string => {
    if (imagePreview) return imagePreview;
    if (cloudinaryUrl) return cloudinaryUrl;
    if (user?.profilePic) return user.profilePic;
    return 'https://bit.ly/sage-adebayo';
  };

  // Validate form inputs before submission
  const validateInputs = (): boolean => {
    const errors: ValidationErrors = {};

    if (inputs.username && !/^[a-zA-Z0-9_]+$/.test(inputs.username)) {
      errors.username = 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới';
    }

    if (inputs.email && !/\S+@\S+\.\S+/.test(inputs.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (inputs.name && inputs.name.length < 2) {
      errors.name = 'Tên phải có ít nhất 2 ký tự';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/users/update/${user?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });

      const data = await res.json();

      if (data.error && data.error !== 'Profile updated successfully') {
        showToast('Lỗi', data.error, 'error');
        return;
      }

      dispatch(setUser(data.user));
      localStorage.setItem('user-honeys', JSON.stringify(data.user));

      showToast('Thành công', 'Cập nhật hồ sơ thành công', 'success');

      if (props.onUpdateSuccess) {
        props.onUpdateSuccess();
      }

      const usernameChanged = user?.username !== data.user.username;

      setTimeout(() => {
        if (usernameChanged) {
          window.location.href = `/${data.user.username}`;
        } else {
          window.location.reload();
        }
      }, 200);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast('Lỗi', errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload with popover close
  const handleImageChangeWithClose = (e: React.ChangeEvent<HTMLInputElement>): void => {
    handleImageChange(e);
    setIsPopoverOpen(false);
  };

  if (!user) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  const avatarUrl = getValidAvatarUrl();

  return (
    <form onSubmit={handleSubmit}>
      <Box
        color={textColor}
        p={4}
        maxW="md"
        mx="auto"
        my={30}
      >
        <VStack spacing={4} align="stretch">
          {/* Họ và Tên */}
          <Flex alignItems="center" justifyContent="space-between">
            <Box width="70%">
              <Text fontSize="sm" fontWeight="bold" mb={1}>
                Họ và Tên
              </Text>
              <FormControl isInvalid={!!validationErrors.name}>
                {isEditingName ? (
                  <Input
                    ref={nameRef}
                    variant="unstyled"
                    value={inputs.name}
                    placeholder="Nhập tên"
                    onChange={(e) =>
                      setInputs({ ...inputs, name: e.target.value })
                    }
                    onBlur={() => {
                      setIsEditingName(false);
                      validateInputs();
                    }}
                    size="sm"
                    fontSize="md"
                    color={textColor}
                    _placeholder={{ color: secondaryTextColor }}
                    aria-label="Họ và tên"
                  />
                ) : (
                  <>
                    <Text
                      fontSize="md"
                      cursor="pointer"
                      onClick={() => setIsEditingName(true)}
                      color={inputs.name ? textColor : secondaryTextColor}
                    >
                      {inputs.name || '+ Nhập tên'}
                    </Text>
                    {validationErrors.name && (
                      <Text fontSize="xs" color={errorTextColor} mt={1}>
                        {validationErrors.name}
                      </Text>
                    )}
                  </>
                )}
              </FormControl>
            </Box>

            <Popover 
              placement="bottom-end"
              isOpen={isPopoverOpen}
              onOpen={() => setIsPopoverOpen(true)}
              onClose={() => setIsPopoverOpen(false)}
            >
              <PopoverTrigger>
                <Box
                  position="relative"
                  cursor="pointer"
                  _hover={{ opacity: 0.8 }}
                  transition="all 0.2s"
                  _focus={{ outline: 'none' }}
                  onClick={() => setIsPopoverOpen(true)}
                >
                  {imageLoading ? (
                    <Skeleton>
                      <Avatar size="lg" name={inputs.name} bg={avatarBg} />
                    </Skeleton>
                  ) : (
                    <Avatar
                      ref={avatarRef}
                      size="lg"
                      src={imageError ? undefined : avatarUrl} // Don't use the URL if there's an error
                      name={inputs.name}
                      bg={avatarBg}
                      onError={() => setImageError(true)}
                      _focus={{ outline: 'none' }}
                    />
                  )}
                  <Box
                    position="absolute"
                    right="-2px"
                    bottom="-2px"
                    bg={bgColor}
                    borderRadius="full"
                    width="25px"
                    height="25px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border={`1px solid ${dividerColor}`}
                  >
                    <Text fontSize="md" fontWeight="bold" color={textColor}>
                      +
                    </Text>
                  </Box>
                </Box>
              </PopoverTrigger>

              <PopoverContent
                width="200px"
                bg={popoverBg}
                boxShadow="md"
                border={`1px solid ${popoverBorder}`}
                borderRadius="lg"
              >
                <PopoverArrow bg={popoverBg} />
                <PopoverBody p={0}>
                  <VStack spacing={0} divider={<Divider borderColor={dividerColor} />}>
                    <Button
                      bg={popoverButtonBg}
                      color={textColor}
                      variant="ghost"
                      justifyContent="flex-start"
                      fontWeight="normal"
                      py={3}
                      borderTopRadius="lg"
                      _hover={{ bg: popoverButtonHoverBg, color: textColor }}
                      _focus={{ outline: 'none' }}
                      onClick={() => fileRef.current?.click()}
                      width="100%"
                    >
                      Tải ảnh lên
                    </Button>
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            </Popover>

            <Input
              type="file"
              display="none"
              ref={fileRef}
              accept="image/*"
              onChange={handleImageChangeWithClose}
              aria-label="Tải ảnh lên"
            />
          </Flex>

          <Divider borderColor={dividerColor} mt={-3} mb={1} width="80%" alignSelf="flex-start" />

          {/* Tên người dùng */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={1}>
              Tên người dùng
            </Text>
            <FormControl isInvalid={!!validationErrors.username}>
              {isEditingUsername ? (
                <Input
                  ref={usernameRef}
                  variant="unstyled"
                  value={inputs.username}
                  placeholder="Nhập tên người dùng"
                  onChange={(e) =>
                    setInputs({ ...inputs, username: e.target.value })
                  }
                  onBlur={() => {
                    setIsEditingUsername(false);
                    validateInputs();
                  }}
                  size="sm"
                  fontSize="md"
                  color={textColor}
                  _placeholder={{ color: secondaryTextColor }}
                  aria-label="Tên người dùng"
                />
              ) : (
                <>
                  <Text
                    fontSize="md"
                    color={inputs.username ? textColor : secondaryTextColor}
                    cursor="pointer"
                    onClick={() => setIsEditingUsername(true)}
                  >
                    {inputs.username || '+ Nhập tên người dùng'}
                  </Text>
                  {validationErrors.username && (
                    <Text fontSize="xs" color={errorTextColor} mt={1}>
                      {validationErrors.username}
                    </Text>
                  )}
                </>
              )}
            </FormControl>
          </Box>

          <Divider borderColor={dividerColor} mt={-3} mb={1} />

          {/* Email */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={1}>
              Email
            </Text>
            <FormControl isInvalid={!!validationErrors.email}>
              {isEditingEmail ? (
                <Input
                  ref={emailRef}
                  variant="unstyled"
                  value={inputs.email}
                  placeholder="Nhập email"
                  onChange={(e) =>
                    setInputs({ ...inputs, email: e.target.value })
                  }
                  onBlur={() => {
                    setIsEditingEmail(false);
                    validateInputs();
                  }}
                  size="sm"
                  fontSize="md"
                  color={textColor}
                  _placeholder={{ color: secondaryTextColor }}
                  aria-label="Email"
                />
              ) : (
                <>
                  <Text
                    fontSize="md"
                    color={inputs.email ? textColor : secondaryTextColor}
                    cursor="pointer"
                    onClick={() => setIsEditingEmail(true)}
                  >
                    {inputs.email || '+ Nhập email'}
                  </Text>
                  {validationErrors.email && (
                    <Text fontSize="xs" color={errorTextColor} mt={1}>
                      {validationErrors.email}
                    </Text>
                  )}
                </>
              )}
            </FormControl>
          </Box>
          <Divider borderColor={dividerColor} mt={-3} mb={1} />

          {/* Mật khẩu */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={1}>
              Mật khẩu
            </Text>
            <FormControl>
              {isEditingPassword ? (
                <Input
                  ref={passwordRef}
                  type="password"
                  variant="unstyled"
                  value={inputs.password}
                  placeholder="Nhập mật khẩu mới"
                  onChange={(e) =>
                    setInputs({ ...inputs, password: e.target.value })
                  }
                  onBlur={() => setIsEditingPassword(false)}
                  size="sm"
                  fontSize="md"
                  color={textColor}
                  _placeholder={{ color: secondaryTextColor }}
                  aria-label="Mật khẩu"
                />
              ) : (
                <Text
                  fontSize="md"
                  color={inputs.password ? textColor : secondaryTextColor}
                  cursor="pointer"
                  onClick={() => setIsEditingPassword(true)}
                >
                  {inputs.password ? '********' : '+ Nhập mật khẩu mới'}
                </Text>
              )}
            </FormControl>
          </Box>

          <Divider borderColor={dividerColor} mt={-3} mb={1} />

          {/* Tiểu sử */}
          <Box>
            <Text fontSize="sm" fontWeight="bold" mb={1}>
              Tiểu sử
            </Text>
            <FormControl>
              {isEditingBio ? (
                <Input
                  ref={bioRef}
                  variant="unstyled"
                  value={inputs.bio}
                  placeholder="Viết tiểu sử"
                  onChange={(e) =>
                    setInputs({ ...inputs, bio: e.target.value })
                  }
                  onBlur={() => setIsEditingBio(false)}
                  size="sm"
                  fontSize="md"
                  color={textColor}
                  _placeholder={{ color: secondaryTextColor }}
                  aria-label="Tiểu sử"
                />
              ) : (
                <Text
                  fontSize="md"
                  color={inputs.bio ? textColor : secondaryTextColor}
                  cursor="pointer"
                  onClick={() => setIsEditingBio(true)}
                >
                  {inputs.bio || '+ Viết tiểu sử'}
                </Text>
              )}
            </FormControl>
          </Box>

          <Divider borderColor={dividerColor} mt={-3} mb={4} />

          {/* Buttons */}
          <Button
            w="full"
            bg={buttonBgSubmit}
            color={buttonTextColor}
            _hover={{ bg: buttonBgSubmitHover }}
            borderRadius="xl"
            fontSize="md"
            fontWeight="bold"
            py={3}
            isLoading={loading}
            loadingText="Đang cập nhật"
            type="submit"
          >
            Xong
          </Button>
        </VStack>
      </Box>
    </form>
  );
};

export default UpdateProfilePage;