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
    Spinner
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
    
    // Sử dụng hook useImageUpload
    const { 
        imagePreview, 
        handleImageChange, 
        error: imageError 
    } = useImageUpload({
        maxSize: 5 * 1024 * 1024, // 5MB
        onImageChange: (base64Data) => {
            setInputs(prev => ({ ...prev, profilePic: base64Data }));
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
            setInputs({
                name: user.name || "",
                username: user.username || "",
                email: user.email || "",
                bio: user.bio || "",
                password: "",
                profilePic: user.profilePic || ""
            });
        }
    }, [user]);
    
    // Thông báo lỗi khi upload ảnh
    useEffect(() => {
        if (imageError) {
            showToast("Error", imageError, "error");
        }
    }, [imageError, showToast]);
    
    const fileRef = useRef(null);

    const validateInputs = () => {
        if (!inputs.name.trim()) {
            showToast("Error", "Tên không được để trống", "error");
            return false;
        }
        if (!inputs.username.trim()) {
            showToast("Error", "Tên người dùng không được để trống", "error");
            return false;
        }
        if (!inputs.email.trim()) {
            showToast("Error", "Email không được để trống", "error");
            return false;
        }
        return true;
    };

    const handleUpdateProfile = async () => {
        if (!validateInputs()) return;
        
        setLoading(true);
        try {
            const res = await fetch(`/api/users/update/${user._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inputs)
            });

            const data = await res.json();
            
            if (data.error) {
                showToast('Error', data.error, 'error');
                return;
            }
            
            // Cập nhật Redux store với thông tin người dùng mới
            dispatch(setUser(data.user));
            showToast('Success', 'Cập nhật hồ sơ thành công', 'success');
            navigate(`/${data.user.username}`);
        } catch (error) {
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
    
    return (
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
                            <Avatar 
                                size="xl" 
                                boxShadow={"md"} 
                                src={imagePreview || user.profilePic}
                            />
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
                </FormControl>
                
                <FormControl isRequired>
                    <FormLabel>Họ và tên</FormLabel>
                    <Input
                        placeholder="Trần Tài"
                        value={inputs.name}
                        onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                        _placeholder={{ color: 'gray.500' }}
                        type="text"
                    />
                </FormControl>
                
                <FormControl isRequired>
                    <FormLabel>Tên người dùng</FormLabel>
                    <Input
                        placeholder="trantai"
                        value={inputs.username}
                        onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                        _placeholder={{ color: 'gray.500' }}
                        type="text"
                    />
                </FormControl>
                
                <FormControl isRequired>
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
                        onClick={handleUpdateProfile}
                        isLoading={loading}
                        loadingText="Đang cập nhật"
                    >
                        Lưu thay đổi
                    </Button>
                </Stack>
            </Stack>
        </Flex>
    );
}