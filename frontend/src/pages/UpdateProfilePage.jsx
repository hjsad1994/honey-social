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
    FormErrorMessage,
    Box,
    Spinner,
    Text,
    Image,
    Skeleton
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '../reducers/userReducer'
import useShowToast from '../hooks/useShowToast'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import useImageUpload from '../hooks/useImageUpload';

export default function UpdateProfilePage() {
    const dispatch = useDispatch();
    const showToast = useShowToast();
    const navigate = useNavigate();

    const user = useSelector((state) => state.user.user);
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [timestamp, setTimestamp] = useState(Date.now());
    const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
    const [imageLoading, setImageLoading] = useState(true); // Thêm state mới để theo dõi quá trình tải ảnh

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

    useEffect(() => {
        if (user) {
            console.log("Loading user data:", user);
            console.log("Profile picture URL:", user.profilePic);
            
            setInputs({
                name: user.name || "",
                username: user.username || "",
                email: user.email || "",
                bio: user.bio || "",
                password: "",
                profilePic: user.profilePic || ""
            });
            
            setImageError(false);
            setImageLoading(true); // Đặt trạng thái loading khi user thay đổi
            
            // Tải trước ảnh người dùng
            if (user.profilePic) {
                // Sử dụng window.Image thay vì Image để tránh xung đột với Chakra UI Image
                const img = new window.Image();
                img.src = user.profilePic;
                img.onload = () => {
                    setImageLoading(false);
                    setImageError(false);
                };
                img.onerror = () => {
                    setImageLoading(false);
                    setImageError(true);
                };
            } else {
                setImageLoading(false);
            }
        }
    }, [user]);

    useEffect(() => {
        if (uploadError) {
            showToast("Error", uploadError, "error");
        }
    }, [uploadError, showToast]);

    useEffect(() => {
        // Gọi forceReload khi component mount để buộc cập nhật URL ảnh
        forceReload();
        
        // Thiết lập interval để kiểm tra và cập nhật ảnh mỗi 2 giây trong trường hợp ảnh không tải được
        const intervalId = setInterval(() => {
            if (imageError) {
                console.log("Attempting to reload image due to error...");
                setImageError(false);
                setTimestamp(Date.now());
            }
        }, 2000);
        
        return () => clearInterval(intervalId);
    }, []);

    // Reset imageError khi có cloudinaryUrl mới
    useEffect(() => {
        if (cloudinaryUrl) {
            setImageError(false);
        }
    }, [cloudinaryUrl]);

    // Thêm useEffect này để theo dõi thay đổi của imagePreview
    useEffect(() => {
        if (imagePreview) {
            console.log("Image preview updated:", imagePreview);
            // Đặt lại imageError khi có ảnh xem trước mới
            setImageError(false);
        }
    }, [imagePreview]);

    const fileRef = useRef(null);

    const handleImageError = () => {
        console.log("Avatar image failed to load");
        setImageError(true);
    };

    const getValidAvatarUrl = () => {
        // Ưu tiên hiển thị ảnh mới tải lên
        if (imagePreview) {
            return imagePreview;
        }
        
        // Tiếp theo là URL Cloudinary mới
        if (cloudinaryUrl) {
            console.log("Using cloudinaryUrl:", cloudinaryUrl);
            return cloudinaryUrl;
        }
        
        // Cuối cùng là URL của người dùng hiện tại
        if (user && user.profilePic) {
            console.log("Using user profilePic:", user.profilePic);
            if (user.profilePic.includes('?')) {
                return user.profilePic;
            } else {
                return `${user.profilePic}?t=${timestamp}`;
            }
        }
        
        // Nếu không có URL nào, trả về ảnh mặc định
        return "https://bit.ly/sage-adebayo";
    };

    const clearImageCache = async () => {
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => {
                        return caches.delete(cacheName);
                    })
                );
                console.log("Image caches cleared");
            } catch (err) {
                console.error("Error clearing cache:", err);
            }
        }
    };

    const forceReload = () => {
        if (!user) return;
        
        try {
            const cachedUser = JSON.parse(localStorage.getItem("user-honeys"));
            
            if (cachedUser && cachedUser.profilePic) {
                // Loại bỏ tham số query cũ nếu có
                let profilePicUrl = cachedUser.profilePic.split('?')[0];
                
                // Thêm timestamp mới
                const updatedProfilePic = `${profilePicUrl}?t=${Date.now()}`;
                
                // Tạo user mới với URL đã cập nhật
                const updatedUser = {
                    ...cachedUser,
                    profilePic: updatedProfilePic
                };
                
                // Cập nhật cả Redux và localStorage
                dispatch(setUser(updatedUser));
                localStorage.setItem("user-honeys", JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error("Error in forceReload:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Xóa cache trước khi gửi request
            await clearImageCache();
            
            const res = await fetch(`/api/users/update/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inputs)
            });

            const data = await res.json();
            console.log("Server response:", data);

            if (data.error && data.error !== "profile updated successfully") {
                showToast('Error', data.error, 'error');
                return;
            }

            if (data.cloudinaryInfo) {
                console.log("New Cloudinary URL:", data.cloudinaryInfo.url);
                
                // Đặt lại imageError thành false để đảm bảo hiển thị ảnh mới
                setImageError(false);
                
                // Lưu URL Cloudinary mới (đã có timestamp) vào state
                setCloudinaryUrl(data.cloudinaryInfo.url);
                
                // Cập nhật localStorage và Redux với URL mới
                const updatedUser = {
                    ...data.user,
                    profilePic: data.cloudinaryInfo.url
                };
                
                dispatch(setUser(updatedUser));
                localStorage.setItem("user-honeys", JSON.stringify(updatedUser));
                
                // Xóa cache lần nữa
                await clearImageCache();
                
                showToast('Success', 'Ảnh đại diện đã được cập nhật', 'success');
                
                // Đợi một chút trước khi reload để đảm bảo state được cập nhật
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                // Cập nhật thông tin người dùng khác nếu không có ảnh mới
                dispatch(setUser(data.user));
                localStorage.setItem("user-honeys", JSON.stringify(data.user));
                showToast('Success', 'Cập nhật hồ sơ thành công', 'success');
                navigate(`/${data.user.username}`);
            }
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
                                    // Hiển thị skeleton thay vì ảnh mặc định khi đang tải
                                    <Skeleton>
                                        <Avatar
                                            size="xl"
                                            boxShadow={"md"}
                                        />
                                    </Skeleton>
                                ) : imagePreview ? (
                                    <Avatar
                                        size="xl"
                                        boxShadow={"md"}
                                        src={imagePreview}
                                    />
                                ) : imageError ? (
                                    <Avatar
                                        size="xl"
                                        boxShadow={"md"}
                                        src="https://bit.ly/sage-adebayo"
                                    />
                                ) : (
                                    <Avatar
                                        size="xl"
                                        boxShadow={"md"}
                                        src={`${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}noCache=${Date.now()}`}
                                        onLoad={() => setImageLoading(false)}
                                        onError={(e) => {
                                            console.log("Avatar image failed to load:", e.target.src);
                                            setImageError(true);
                                            setImageLoading(false);
                                        }}
                                        loading="eager"
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