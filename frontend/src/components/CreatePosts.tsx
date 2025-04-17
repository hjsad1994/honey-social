import React, { useState, useRef } from 'react';
import {
    Button,
    CloseButton,
    Flex,
    FormControl,
    Image,
    Input,
    Modal,
    ModalBody,
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
    useColorMode,
} from "@chakra-ui/react";
import { AddIcon } from '@chakra-ui/icons';
import { BsImage } from 'react-icons/bs';
import { useSelector, useDispatch } from "react-redux";
import useImageUpload from '../hooks/useImageUpload';
import useShowToast from '../hooks/useShowToast';
import { addPost } from '../reducers/postReducer';
import { RootState } from '../store/store';
import { Post } from '../types/types';

interface CreatePostsProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const CreatePosts: React.FC<CreatePostsProps> = ({ isOpen: externalIsOpen, onClose: externalOnClose }) => {
    // Sử dụng internal hooks chỉ khi không có external props
    const { isOpen: internalIsOpen, onOpen: internalOnOpen, onClose: internalOnClose } = useDisclosure();
    
    const [postText, setPostText] = useState<string>("");
    const imageInputRef = useRef<HTMLInputElement>(null);
    const MAX_CHARS = 500; // Giới hạn ký tự
    const [remainingChar, setRemainingChar] = useState<number>(MAX_CHARS);
    const showToast = useShowToast();
    const [loading, setLoading] = useState<boolean>(false);
    const { colorMode } = useColorMode();
    const dispatch = useDispatch();

    // Get the current user from Redux store
    const currentUser = useSelector((state: RootState) => state.user.user);

    // Move ALL useColorModeValue calls to the top level
    const buttonBg = useColorModeValue("gray.300", "gray.dark");
    const modalBg = useColorModeValue("white", "#1E1E1E");
    const borderColor = useColorModeValue("gray.300", "gray.light");
    const iconColor = useColorModeValue("black", "white");
    const buttonHoverBg = colorMode === "dark" ? "rgba(80, 80, 80, 0.3)" : "rgba(180, 180, 180, 0.3)";

    // Sử dụng hook useImageUpload
    const {
        imagePreview,
        imageBase64,
        error,
        handleImageChange,
        resetImage,
    } = useImageUpload({
        maxSize: 5 * 1024 * 1024, // 5MB
        acceptedTypes: 'image/*'
    });

    // Handle closing the modal
    const handleCloseModal = (): void => {
        // Reset form khi đóng modal
        setPostText("");
        setRemainingChar(MAX_CHARS);
        resetImage();
        
        // Gọi callback onClose từ bên ngoài nếu có
        if (externalOnClose) {
            externalOnClose();
        } else {
            internalOnClose();
        }
    };

    // Sử dụng external props nếu được truyền vào
    const finalIsOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const finalOnClose = externalOnClose || handleCloseModal;

    // Hiển thị lỗi upload ảnh nếu có
    React.useEffect(() => {
        if (error) {
            showToast("Lỗi", error, "error");
        }
    }, [error, showToast]);

    // Xử lý thay đổi text với giới hạn ký tự
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const text = e.target.value;
        const newRemainingChar = MAX_CHARS - text.length;
        
        if (newRemainingChar >= 0) {
            setPostText(text);
            setRemainingChar(newRemainingChar);
        }
    };

    const HandleCreatePost = async (): Promise<void> => {
        setLoading(true);
        if (!currentUser) {
            showToast("Error", "Bạn cần đăng nhập để đăng bài", "error");
            setLoading(false);
            return;
        }

        if (!postText.trim() && !imageBase64) {
            showToast("Error", "Vui lòng nhập nội dung hoặc thêm ảnh", "error");
            setLoading(false);
            return;
        }

        try {
            // Prepare the post data
            const postData = {
                postedBy: currentUser._id,
                text: postText,
                img: imageBase64 || ""
            };

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

            // Success path - dispatch to Redux store
            if (data && data.post) {
                console.log("Received new post:", data.post);
                
                // Make sure the post object has all required fields
                const newPost: Post = {
                    ...data.post,
                    postedBy: currentUser._id,
                    likes: data.post.likes || [],
                    replies: data.post.replies || []
                };
                
                // Dispatch the complete post object
                dispatch(addPost(newPost));
                
                // Show success message
                showToast("Success", "Bài viết đã được đăng thành công", "success");
                
                // Reset form state
                setPostText("");
                resetImage();
                
                // Explicitly close the modal
                handleCloseModal();
            }
        } catch (error: unknown) {
            console.error("Error creating post:", error);
            showToast("Error", "Không thể đăng bài, vui lòng thử lại sau", "error");
        } finally {
            setLoading(false);
        }
    };

    // Xác định màu sắc dựa trên remainingChar
    const charsColor = remainingChar <= 20 
        ? "red.500" 
        : remainingChar <= 50 
            ? "yellow.500" 
            : "gray.500";

    return (
        <>
            {/* Chỉ hiển thị button khi KHÔNG có external isOpen prop */}
            {externalIsOpen === undefined && (
                <Button
                    position={"fixed"}
                    bottom={10}
                    right={10}
                    bg={buttonBg}
                    size="lg"
                    width="80px"
                    height="70px"
                    borderRadius="15px"
                    boxShadow="lg"
                    transition="all 0.3s ease"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    onClick={internalOnOpen}
                    _hover={{
                        transform: "scale(1.12)",
                        boxShadow: "xl"
                    }}
                >
                    <AddIcon boxSize={7} />
                </Button>
            )}

            <Modal isOpen={finalIsOpen} onClose={finalOnClose} size="md">
                <ModalOverlay 
                    bg="blackAlpha.600"
                    backdropFilter="blur(5px)"
                />
                <ModalContent 
                    bg={modalBg} 
                    borderRadius="15px"
                    width="600px"
                    maxWidth="90%"
                    mx="auto"
                    my="auto"
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
                    </ModalHeader>
                    
                    <ModalBody pb={6} borderTop="1px solid" borderColor={borderColor}>
                        <Flex alignItems="center" gap={3} mb={4}>
                            <Image
                                src={currentUser?.profilePic || "https://bit.ly/broken-link"}
                                alt={currentUser?.name || "User"}
                                borderRadius="full"
                                boxSize="40px"
                            />
                            <Text fontSize="md" fontWeight="bold">
                                {currentUser?.name || "Người dùng"}
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

                    <ModalFooter borderTop="1px solid" borderColor={borderColor}>
                        <Flex width="100%" justifyContent="space-between" alignItems="center">
                            <IconButton
                                color={iconColor}
                                aria-label="Upload image"
                                icon={<BsImage size="20px" />}
                                variant="ghost"
                                onClick={() => imageInputRef.current?.click()}
                                _hover={{
                                    bg: buttonHoverBg,
                                    borderRadius: "10px",
                                    transition: "all 0.2s ease",
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
                                isDisabled={!postText.trim() && !imagePreview}
                                isLoading={loading}
                                opacity={!postText.trim() && !imagePreview ? 0.5 : 1}
                                bg="white"
                                color="black"
                                border="1px solid"
                                borderColor="gray.300"
                                _hover={{
                                    bg: "gray.100",
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
};

export default CreatePosts;