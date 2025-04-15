import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    useColorModeValue,
    Avatar,
    Center,
    Box,
    Spinner,
    Text,
    Skeleton
} from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '../reducers/userReducer'
import useShowToast from '../hooks/useShowToast'
import { useNavigate } from 'react-router-dom'
import useImageUpload from '../hooks/useImageUpload';

export default function UpdateProfilePage(props) {
    const dispatch = useDispatch();
    const showToast = useShowToast();
    const navigate = useNavigate();

    const user = useSelector((state) => state.user.user);
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(false); // Changed to false by default
    const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
    const fileRef = useRef(null);
    
    // Prevent unnecessary re-renders of the avatar
    const avatarRef = useRef(null);

    const {
        imagePreview,
        handleImageChange,
        error: uploadError
    } = useImageUpload({
        maxSize: 5 * 1024 * 1024, // 5MB
        onImageChange: (base64Data) => {
            setInputs(prev => ({ ...prev, profilePic: base64Data }));
            setCloudinaryUrl(null);
        }
    });

    const [inputs, setInputs] = useState({
        name: "",
        username: "",
        email: "",
        bio: "",
        password: "",
        profilePic: ""
    });

    // Load user data only once when component mounts
    useEffect(() => {
        if (user) {
            console.log("Loading user data:", user);
            
            setInputs({
                name: user.name || "",
                username: user.username || "",
                email: user.email || "",
                bio: user.bio || "",
                password: "",
                profilePic: user.profilePic || ""
            });
            
            setImageError(false);
            
            // Only trigger loading if there's a profile pic
            if (user.profilePic) {
                // Preload the image to check if it exists
                const img = new window.Image();
                img.onload = () => setImageLoading(false);
                img.onerror = () => {
                    setImageError(true);
                    setImageLoading(false);
                };
                img.src = user.profilePic;
            }
        }
    }, [user?._id]); // Only depend on user ID to prevent unnecessary re-renders

    useEffect(() => {
        if (uploadError) {
            showToast("Error", uploadError, "error");
        }
    }, [uploadError, showToast]);

    // Reset imageError when cloudinaryUrl changes
    useEffect(() => {
        if (cloudinaryUrl) {
            setImageError(false);
        }
    }, [cloudinaryUrl]);

    // Handle image preview changes
    useEffect(() => {
        if (imagePreview) {
            setImageError(false);
        }
    }, [imagePreview]);

    const getValidAvatarUrl = () => {
        if (imagePreview) {
            return imagePreview;
        }
        
        if (cloudinaryUrl) {
            return cloudinaryUrl;
        }
        
        if (user?.profilePic) {
            return user.profilePic;
        }
        
        return "https://bit.ly/sage-adebayo";
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
                body: JSON.stringify(inputs)
            });

            const data = await res.json();

            if (data.error && data.error !== "Profile updated successfully") {
                showToast('Error', data.error, 'error');
                return;
            }

            // Update Redux and localStorage with new user data
            dispatch(setUser(data.user));
            localStorage.setItem("user-honeys", JSON.stringify(data.user));

            showToast('Success', 'Cập nhật hồ sơ thành công', 'success');
            
            // Call the callback if provided to close the modal
            if (props.onUpdateSuccess) {
                props.onUpdateSuccess();
            }
            
            // Check if username was changed
            const usernameChanged = user.username !== data.user.username;
            
            setTimeout(() => {
                if (usernameChanged) {
                    // If username changed, navigate to the new username URL
                    window.location.href = `/${data.user.username}`;
                } else {
                    // Just reload the current page if no username change
                    window.location.reload();
                }
            }, 200); // Small delay to ensure toast is visible and modal closes
        } catch (error) {
            console.error("Error updating profile:", error);
            showToast('Error', error.message, 'error');
        } finally {
            setLoading(false);
        }
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
            <Flex
                align={'center'}
                justify={'center'}
                my={15}
            >
                <Stack
                    spacing={4}
                    w={'full'}
                    maxW={'md'}
                    bg={useColorModeValue('white', 'gray.dark')}
                    rounded={'xl'}
                    boxShadow={'lg'}
                    p={6}
                    my={12}>
                    <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
                        Chỉnh sửa hồ sơ người dùng
                    </Heading>
                    <FormControl id="userName">
                        <Stack direction={['column', 'row']} spacing={6}>
                            <Center>
                                {imageLoading ? (
                                    <Skeleton>
                                        <Avatar
                                            size="xl"
                                            boxShadow={"md"}
                                        />
                                    </Skeleton>
                                ) : (
                                    <Avatar
                                        ref={avatarRef}
                                        size="xl"
                                        boxShadow={"md"}
                                        src={avatarUrl}
                                        name={user.name}
                                        onError={() => setImageError(true)}
                                    />
                                )}
                            </Center>
                            <Center w="full">
                                <Button
                                    w="full"
                                    onClick={() => fileRef.current.click()}
                                    colorScheme="blue"
                                >
                                    Thay đổi ảnh đại diện
                                </Button>
                                <Input
                                    type='file'
                                    hidden
                                    ref={fileRef}
                                    onChange={handleImageChange}
                                    accept='image/*'
                                />
                            </Center>
                        </Stack>
                        
                        {cloudinaryUrl && (
                            <Box mt={2} p={2} bg="green.50" borderRadius="md" color="green.600" fontSize="xs">
                                <Text fontWeight="bold">URL Cloudinary mới:</Text>
                                <Text isTruncated>{cloudinaryUrl}</Text>
                            </Box>
                        )}
                        
                        {!cloudinaryUrl && user.profilePic && (
                            <Box mt={2} p={2} bg="gray.50" borderRadius="md" color="gray.600" fontSize="xs">
                                <Text fontWeight="bold">URL ảnh hiện tại:</Text>
                                <Text isTruncated>{user.profilePic}</Text>
                            </Box>
                        )}
                    </FormControl>

                    <FormControl>
                        <FormLabel>Họ và tên</FormLabel>
                        <Input
                            placeholder="Trần Tài"
                            value={inputs.name}
                            onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                            _placeholder={{ color: 'gray.500' }}
                            type="text"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Tên người dùng</FormLabel>
                        <Input
                            placeholder="trantai"
                            value={inputs.username}
                            onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                            _placeholder={{ color: 'gray.500' }}
                            type="text"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                            placeholder="your-email@example.com"
                            value={inputs.email}
                            onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                            _placeholder={{ color: 'gray.500' }}
                            type="email"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Tiểu sử</FormLabel>
                        <Input
                            placeholder="Giới thiệu về bạn"
                            value={inputs.bio}
                            onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
                            _placeholder={{ color: 'gray.500' }}
                            type="text"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Mật khẩu</FormLabel>
                        <Input
                            placeholder="Để trống nếu không muốn thay đổi mật khẩu"
                            value={inputs.password}
                            onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                            _placeholder={{ color: 'gray.500' }}
                            type="password"
                        />
                    </FormControl>

                    <Stack spacing={6} direction={['column', 'row']} pt={4}>
                        <Button
                            bg={'red.400'}
                            color={'white'}
                            w="full"
                            _hover={{
                                bg: 'red.500',
                            }}
                            onClick={() => navigate(`/${user.username}`)}
                            type="button"
                        >
                            Hủy
                        </Button>
                        <Button
                            bg={'green.400'}
                            color={'white'}
                            w="full"
                            _hover={{
                                bg: 'green.500',
                            }}
                            isLoading={loading}
                            loadingText="Đang cập nhật"
                            type="submit"
                        >
                            Lưu thay đổi
                        </Button>
                    </Stack>
                </Stack>
            </Flex>
        </form>
    );
}