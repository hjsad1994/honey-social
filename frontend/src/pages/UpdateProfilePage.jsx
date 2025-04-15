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
  import { useState, useEffect, useRef } from 'react';
  import { useSelector, useDispatch } from 'react-redux';
  import { setUser } from '../reducers/userReducer';
  import useShowToast from '../hooks/useShowToast';
  import { useNavigate } from 'react-router-dom';
  import useImageUpload from '../hooks/useImageUpload';
  
  export default function UpdateProfilePage(props) {
    const dispatch = useDispatch();
    const showToast = useShowToast();
    const navigate = useNavigate();
  
    const user = useSelector((state) => state.user.user);
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
    const fileRef = useRef(null);
    const avatarRef = useRef(null);
  
    // State for inline editing
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const nameRef = useRef(null);
    const usernameRef = useRef(null);
    const emailRef = useRef(null);
    const bioRef = useRef(null);
    const passwordRef = useRef(null);
  
    const {
      imagePreview,
      handleImageChange,
      error: uploadError,
    } = useImageUpload({
      maxSize: 5 * 1024 * 1024, // 5MB
      onImageChange: (base64Data) => {
        setInputs((prev) => ({ ...prev, profilePic: base64Data }));
        setCloudinaryUrl(null);
      },
    });
  
    const [inputs, setInputs] = useState({
      name: '',
      username: '',
      email: '',
      bio: '',
      password: '',
      profilePic: '',
    });
  
    // Define dynamic colors for light and dark modes
    const bgColor = useColorModeValue('white', 'black'); // Changed to pure black in dark mode
    const textColor = useColorModeValue('black', 'white');
    const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
    const dividerColor = useColorModeValue('gray.200', 'gray.600');
    const buttonBgCancel = useColorModeValue('gray.200', 'gray.600');
    const buttonBgCancelHover = useColorModeValue('gray.300', 'gray.500');
    const buttonBgSubmit = useColorModeValue('black', 'white');
    const buttonBgSubmitHover = useColorModeValue('gray.800', 'gray.700');
    const buttonTextColor = useColorModeValue('white', 'black');
    const avatarBg = useColorModeValue('gray.300', 'gray.600');
    const popoverBg = useColorModeValue('white', 'gray.700');
    const popoverBorder = useColorModeValue('#CBD5E0', 'gray.600');
    const popoverButtonBg = useColorModeValue('white', 'gray.700');
    const popoverButtonHoverBg = useColorModeValue('gray.100', 'gray.600');
  
    // Load user data when component mounts
    useEffect(() => {
      if (user) {
        console.log('Loading user data:', user);
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
          const img = new window.Image();
          img.onload = () => setImageLoading(false);
          img.onerror = () => {
            setImageError(true);
            setImageLoading(false);
          };
          img.src = user.profilePic;
        }
      }
    }, [user?._id]);
  
    useEffect(() => {
      if (uploadError) {
        showToast('Error', uploadError, 'error');
      }
    }, [uploadError, showToast]);
  
    useEffect(() => {
      if (cloudinaryUrl) {
        setImageError(false);
      }
    }, [cloudinaryUrl]);
  
    useEffect(() => {
      if (imagePreview) {
        setImageError(false);
      }
    }, [imagePreview]);
  
    const getValidAvatarUrl = () => {
      if (imagePreview) return imagePreview;
      if (cloudinaryUrl) return cloudinaryUrl;
      if (user?.profilePic) return user.profilePic;
      return 'https://bit.ly/sage-adebayo';
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        const res = await fetch(`/api/users/update/${user._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(inputs),
        });
  
        const data = await res.json();
  
        if (data.error && data.error !== 'Profile updated successfully') {
          showToast('Error', data.error, 'error');
          return;
        }
  
        dispatch(setUser(data.user));
        localStorage.setItem('user-honeys', JSON.stringify(data.user));
  
        showToast('Success', 'Cập nhật hồ sơ thành công', 'success');
  
        if (props.onUpdateSuccess) {
          props.onUpdateSuccess();
        }
  
        const usernameChanged = user.username !== data.user.username;
  
        setTimeout(() => {
          if (usernameChanged) {
            window.location.href = `/${data.user.username}`;
          } else {
            window.location.reload();
          }
        }, 200);
      } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Error', error.message, 'error');
      } finally {
        setLoading(false);
      }
    };
  
    const handleInstagramImport = () => {
      console.log('Nhập ảnh từ Instagram');
    };

    // 1. Añade un nuevo estado para controlar el Popover
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    
    // 2. Modifica el handleImageChange para cerrar el Popover
    const handleImageChangeWithClose = (e) => {
      handleImageChange(e);
      setIsPopoverOpen(false); // Cierra el Popover después de seleccionar el archivo
    };
    
    // 3. Modifica el handleInstagramImport también
    const handleInstagramImportWithClose = () => {
      handleInstagramImport();
      setIsPopoverOpen(false); // Cierra el Popover después de importar
    };
  
    if (!user) {
      return (
        <Flex justifyContent="center" alignItems="center" height="100vh">
          <Spinner size="xl" />
        </Flex>
      );
    }
  
    const avatarUrl = getValidAvatarUrl();
  
    return (
        
      <form onSubmit={handleSubmit}>
        <Box
       
          color={textColor}
          p={3}
          maxW="md"
          mx="auto"
          
          my={30}
        
        >
          <VStack spacing={4} align="stretch">
            {/* Họ và Tên */}
            <Flex alignItems="center" justifyContent="space-between">
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  Họ và Tên
                </Text>
                <FormControl>
                  {isEditingName ? (
                    <Input
                      ref={nameRef}
                      variant="unstyled"
                      value={inputs.name}
                      placeholder="Nhập tên"
                      onChange={(e) =>
                        setInputs({ ...inputs, name: e.target.value })
                      }
                      onBlur={() => setIsEditingName(false)}
                      size="sm"
                      fontSize="md"
                      color={textColor}
                      _placeholder={{ color: secondaryTextColor }}
                    />
                  ) : (
                    <Text
                      fontSize="md"
                      cursor="pointer"
                      onClick={() => setIsEditingName(true)}
                    >
                      {inputs.name || '+ Nhập tên'}
                    </Text>
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
                        src={avatarUrl}
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
              />
            </Flex>
  
            <Divider borderColor={dividerColor} mt={-3} mb={1} width="80%" 
  alignSelf="flex-start" />
  
            {/* Tên người dùng */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={1}>
                Tên người dùng
              </Text>
              <FormControl>
                {isEditingUsername ? (
                  <Input
                    ref={usernameRef}
                    variant="unstyled"
                    value={inputs.username}
                    placeholder="Nhập tên người dùng"
                    onChange={(e) =>
                      setInputs({ ...inputs, username: e.target.value })
                    }
                    onBlur={() => setIsEditingUsername(false)}
                    size="sm"
                    fontSize="md"
                    color={textColor}
                    _placeholder={{ color: secondaryTextColor }}
                  />
                ) : (
                  <Text
                    fontSize="md"
                    color={inputs.username ? textColor : secondaryTextColor}
                    cursor="pointer"
                    onClick={() => setIsEditingUsername(true)}
                  >
                    {inputs.username || '+ Nhập tên người dùng'}
                  </Text>
                )}
              </FormControl>
            </Box>
  
            <Divider borderColor={dividerColor} mt={-3} mb={1} />
  
            {/* Email */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" mb={1}>
                Email
              </Text>
              <FormControl>
                {isEditingEmail ? (
                  <Input
                    ref={emailRef}
                    variant="unstyled"
                    value={inputs.email}
                    placeholder="Nhập email"
                    onChange={(e) =>
                      setInputs({ ...inputs, email: e.target.value })
                    }
                    onBlur={() => setIsEditingEmail(false)}
                    size="sm"
                    fontSize="md"
                    color={textColor}
                    _placeholder={{ color: secondaryTextColor }}
                  />
                ) : (
                  <Text
                    fontSize="md"
                    color={inputs.email ? textColor : secondaryTextColor}
                    cursor="pointer"
                    onClick={() => setIsEditingEmail(true)}
                  >
                    {inputs.email || '+ Nhập email'}
                  </Text>
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
                    placeholder="Nhập mật khẩu"
                    onChange={(e) =>
                      setInputs({ ...inputs, password: e.target.value })
                    }
                    onBlur={() => setIsEditingPassword(false)}
                    size="sm"
                    fontSize="md"
                    color={textColor}
                    _placeholder={{ color: secondaryTextColor }}
                  />
                ) : (
                  <Text
                    fontSize="md"
                    color={inputs.password ? textColor : secondaryTextColor}
                    cursor="pointer"
                    onClick={() => setIsEditingPassword(true)}
                  >
                    {inputs.password ? '********' : '+ Nhập mật khẩu'}
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
  
            <Divider borderColor={dividerColor} mt={-3} mb={2} />
  
            {/* Buttons */}
            <Flex justifyContent="space-between">
            
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
            </Flex>
          </VStack>
        </Box>
      </form>
    );
  }