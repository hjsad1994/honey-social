import React, { useState, useRef } from 'react'
import {
    Button,
    CloseButton,
    Flex,
    FormControl,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
    useColorModeValue,
    useDisclosure,
    Box,
    IconButton,
    useColorMode, // Thêm import useColorMode
} from "@chakra-ui/react";
import { AddIcon } from '@chakra-ui/icons';
import { BsImage } from 'react-icons/bs';
import { useSelector } from "react-redux";
import useImageUpload from '../hooks/useImageUpload';
import useShowToast from '../hooks/useShowToast';

const CreatePosts = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [postText, setPostText] = useState("");
    const imageInputRef = useRef(null);
    const MAX_CHARS = 500; // Giới hạn ký tự
    const [remainingChar, setRemainingChar] = useState(MAX_CHARS); // Thêm state để quản lý số ký tự còn lại
    const showToast = useShowToast();
    const [loading, setLoading] = useState(false);
    const { colorMode } = useColorMode(); // Lấy giá trị colorMode (light hoặc dark)

    // Add this line to get the current user from Redux store
    const currentUser = useSelector((state) => state.user.user);

    // Sử dụng hook useImageUpload
    const {
        imagePreview,
        imageBase64,
        fileInfo,
        error,
        handleImageChange,
        resetImage,
    } = useImageUpload({
        maxSize: 5 * 1024 * 1024, // 5MB
        acceptedTypes: 'image/*'
    });

    // Hiển thị lỗi upload ảnh nếu có
    React.useEffect(() => {
        if (error) {
            showToast("Lỗi", error, "error");
        }
    }, [error, showToast]);

    // Xử lý thay đổi text với giới hạn ký tự - sử dụng remainingChar state
    const handleTextChange = (e) => {
        const text = e.target.value;
        const newRemainingChar = MAX_CHARS - text.length;
        
        if (newRemainingChar >= 0) {
            setPostText(text);
            setRemainingChar(newRemainingChar);
        }
    };

    const HandleCreatePost = async () => {
        setLoading(true);
        if (!currentUser) {
            showToast("Error", "Bạn cần đăng nhập để đăng bài", "error");
            return;
        }

        if (!postText.trim() && !imageBase64) {
            showToast("Error", "Vui lòng nhập nội dung hoặc thêm ảnh", "error");
            return;
        }

        try {
            // Prepare the post data
            const postData = {
                postedBy: currentUser._id,
                text: postText,
                img: imageBase64 || ""  // Use image if available
            };

            // Set loading state if needed
            // setIsLoading(true);

            // Make the API request
            const res = await fetch("/api/posts/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(postData)
            });

            const data = await res.json();

            if (data.error && data.error !== "post created successfully") {
                showToast("Error", data.error, "error");
                return;
            }

            // Success! Show confirmation and reset form
            showToast("Success", "Bài viết đã được đăng thành công", "success");
            
            // Reset form
            setPostText("");
            setRemainingChar(MAX_CHARS); // Reset giá trị remainingChar
            resetImage();
            onClose();

            // Optional: Refresh the feed or navigate to the new post
            // window.location.reload();
            
        } catch (error) {
            console.error("Error creating post:", error);
            showToast("Error", "Không thể đăng bài, vui lòng thử lại sau", "error");
        } finally {

            setLoading(false);
        }

    };

    const handleCloseModal = () => {
        // Reset form khi đóng modal
        setPostText("");
        setRemainingChar(MAX_CHARS); // Reset giá trị remainingChar
        resetImage();
        onClose();
    };

    // Xác định màu sắc dựa trên remainingChar
    const charsColor = remainingChar <= 20 
        ? "red.500" 
        : remainingChar <= 50 
            ? "yellow.500" 
            : "gray.500";

    return (
        <>
            <Button
                position={"fixed"}
                bottom={10}
                right={10}

                bg={useColorModeValue("gray.300", "gray.dark")}
                size="lg"
                width="80px"
                height="70px"
                borderRadius="15px"
                boxShadow="lg"
                transition="all 0.3s ease"
                display="flex"
                alignItems="center"
                justifyContent="center"
                onClick={onOpen}
                _hover={{
                    transform: "scale(1.12)",
                    boxShadow: "xl"
                }}
            >
                <AddIcon boxSize={7} />
            </Button>

            <Modal isOpen={isOpen} onClose={handleCloseModal} size="md">
                <ModalOverlay 
                    bg="blackAlpha.600"
                    backdropFilter="blur(5px)"
                />
                <ModalContent 
                    bg={useColorModeValue("white", "#1E1E1E")} 
                    borderRadius="15px"
                    width="600px" // Tăng chiều rộng modal
                    maxWidth="90%" // Đảm bảo không vượt quá màn hình
                    mx="auto" // Căn giữa theo chiều ngang
                    my="auto" // Căn giữa theo chiều dọc

                >
                    <ModalHeader display="flex" justifyContent="space-between" alignItems="center" position="relative">
                        <Button 
                            variant="ghost" 
                            onClick={handleCloseModal} 
                            fontSize="sm"
                            position="absolute"
                            left="0"
                            _hover={{}} 
                        >
                            Hủy
                        </Button>
                        <Text fontSize="lg" fontWeight="bold" textAlign="center" flex="1">
                            Tạo bài viết mới
                        </Text>
                        {/* <Button 
                            variant="ghost" 
                            fontSize="sm"
                            position="absolute"
                            right="0"
                            _hover={{}}
                            onClick={() => console.log("Xem thêm được nhấn!")}
                        >
                            Xem thêm
                        </Button> */}
                    </ModalHeader>
                    
                    <ModalBody pb={6} borderTop="1px solid" borderColor={useColorModeValue("gray.300", "gray.light")}>
                        <Flex alignItems="center" gap={3} mb={4}>
                            <Image
                                src={currentUser?.profilePic || "https://bit.ly/broken-link"} // Hiển thị avatar
                                alt={currentUser?.name || "User"}
                                borderRadius="full"
                                boxSize="40px"
                            />
                            <Text fontSize="md" fontWeight="bold">
                                {currentUser?.name || "Người dùng"} {/* Hiển thị tên */}
                            </Text>
                        </Flex>
                        <FormControl>
                            <Textarea
                                placeholder="Có gì mới?"
                                value={postText}
                                onChange={handleTextChange}
                                size="md"
                                resize="vertical"
                                minHeight="120px"
                                border="none"
                                _focus={{ border: "none", boxShadow: "none" }}
                                fontSize="lg"
                                maxLength={MAX_CHARS}
                            />
                            <Text 
                                fontSize="xs" 
                                color={charsColor} 
                                textAlign="right" 
                                mt={1}
                            >
                                {remainingChar} ký tự còn lại
                            </Text>
                        </FormControl>

                        {/* Preview khi đã chọn ảnh - Sử dụng imagePreview từ hook */}
                        {imagePreview && (
                            <Box position="relative" mt={4}>
                                <Image
                                    src={imagePreview}
                                    alt="Selected image"
                                    borderRadius="md"
                                    maxHeight="300px"
                                />
                                <CloseButton
                                    position="absolute"
                                    top={2}
                                    right={2}
                                    bg="blackAlpha.600"
                                    color="white"
                                    onClick={resetImage}
                                    _hover={{ bg: "blackAlpha.800" }}
                                />
                            </Box>
                        )}

                        <Input
                            type="file"
                            accept="image/*"
                            hidden
                            ref={imageInputRef}
                            onChange={handleImageChange}
                        />
                    </ModalBody>

                    <ModalFooter borderTop="1px solid" borderColor={useColorModeValue("gray.300", "gray.light")}>
                        <Flex width="100%" justifyContent="space-between" alignItems="center">
                            <IconButton
                                // bg={colorMode === "dark" ? "rgba(80, 80, 80, 0.3)" : "rgba(180, 180, 180, 0.3)"} // Màu nền thay đổi theo chế độ
                                color={useColorModeValue("black", "white")} // Màu chữ thay đổi theo chế độ
                                aria-label="Upload image"
                                icon={<BsImage size="20px" />}
                                variant="ghost"
                                onClick={() => imageInputRef.current.click()}
                                _hover={{
                                    bg: colorMode === "dark" ? "rgba(80, 80, 80, 0.3)" : "rgba(180, 180, 180, 0.3)",
                                    borderRadius: "10px",
                                    transition:"all 0.2s ease",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                    zIndex: 1
                                }}
                            />
                            <Button 
                                colorScheme="blue" 
                                px={6}
                                borderRadius="full"
                                onClick={HandleCreatePost}
                                isDisabled={!postText.trim() && !imagePreview} // Ẩn mờ nút nếu không có nội dung hoặc ảnh
                                isLoading={loading}
                                opacity={!postText.trim() && !imagePreview ? 0.5 : 1} // Thêm hiệu ứng mờ
                                bg="white" // Màu nền trắng
                                color="black" // Chữ màu đen
                                border="1px solid" // Thêm viền
                                borderColor="gray.300" // Màu viền
                                _hover={{
                                    bg: "gray.100", // Màu nền khi hover
                                }}
                            >
                                Đăng
                            </Button>
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

export default CreatePosts;