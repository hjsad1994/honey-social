import React, { useState, useEffect } from "react";
import {
    Flex,
    Text,
    Box,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    FormControl,
    Textarea,
    useDisclosure,
    useColorModeValue,
    Image, Input, IconButton, CloseButton,
} from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import useShowToast from "../hooks/useShowToast";
import { updatePost } from "../reducers/postReducer";
import useImageUpload from '../hooks/useImageUpload'; // Import hook useImageUpload
import { BsImage } from 'react-icons/bs'; // Import icon cho nút upload ảnhh

const Actions = ({ post, onReplyAdded }) => {
    if (!post) return null;

    const dispatch = useDispatch();
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post?.likes?.length || 0);
    const [isLiking, setIsLiking] = useState(false);
    const [reply, setReply] = useState("");
    const [isReplying, setIsReplying] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const showToast = useShowToast();
    const user = useSelector((state) => state.user.user);

    const {
        imagePreview,
        imageBase64,
        handleImageChange,
        resetImage,
    } = useImageUpload({
        maxSize: 5 * 1024 * 1024, // 5MB
        acceptedTypes: 'image/*',
    });

    useEffect(() => {
        if (post && user && post.likes) {
            setLiked(post.likes.includes(user._id));
            setLikesCount(post.likes.length);
        }
    }, [post, user]);

    const handleReply = async () => {
        if (!user)
            return showToast("Error", "You must be logged in to reply to a post", "error");
        if (isReplying) return;
        if (!reply.trim() && !imageBase64) return showToast("Error", "Reply cannot be empty", "error");

        setIsReplying(true);
        try {
            const res = await fetch(`/api/posts/reply/${post._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: reply, image: imageBase64 }),
            });
            const data = await res.json();

            if (data.error && data.error !== "reply added successfully") {
                showToast("Error", data.error, "error");
                return;
            }

            post.replies = [...post.replies, {
                userId: user._id,
                text: reply,
                username: user.username,
                userProfilePic: user.profilePic,
                image: imageBase64,
            }];

            showToast("Success", "Reply posted successfully", "success");
            onClose();
            setReply("");
            resetImage();

            // Call the callback function to refresh post data on PostPage
            if (onReplyAdded) {
                setTimeout(() => {
                    onReplyAdded();
                }, 300);
            }
            
            // Also update the post in Redux store for UserPage
            setTimeout(() => {
                fetch(`/api/posts/${post._id}`)
                    .then(res => res.json())
                    .then(updatedPostData => {
                        if (!updatedPostData.error) {
                            dispatch(updatePost(updatedPostData));
                        }
                    })
                    .catch(err => console.error("Failed to fetch updated post data:", err));
            }, 300);
        } catch (error) {
            showToast("Error", error.message, "error");
        } finally {
            setIsReplying(false);
        }
    };

    const handleLikeAndUnlike = async () => {
        if (!user)
            return showToast("Error", "Please login to like the post", "error");
        if (!post || !post._id) return;
        if (isLiking) return;

        setIsLiking(true);
        const wasLiked = liked;
        setLiked(!wasLiked);
        setLikesCount((prevCount) => (wasLiked ? prevCount - 1 : prevCount + 1));

        try {
            const res = await fetch(`/api/posts/like/${post._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();

            if (
                data.error &&
                data.error !== "post liked successfully" &&
                data.error !== "post unliked successfully"
            ) {
                showToast("Error", data.error, "error");
                setLiked(wasLiked);
                setLikesCount((prevCount) => (wasLiked ? prevCount + 1 : prevCount - 1));
            }
        } catch (error) {
            showToast("Error", error.message, "error");
            setLiked(wasLiked);
            setLikesCount((prevCount) => (wasLiked ? prevCount + 1 : prevCount - 1));
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <>
            <Flex flexDirection={"column"}>
                <Flex justifyContent="space-between" my={2} gap={6} onClick={(e) => e.preventDefault()}>
                    {/* SVG Like + count */}
                    <Flex alignItems="center">
                        <svg
                            aria-label="Like"
                            color={liked ? "rgb(237, 73, 86)" : ""}
                            fill={liked ? "rgb(237, 73, 86)" : "transparent"}
                            height="19"
                            role="img"
                            viewBox="0 0 24 22"
                            width="20"
                            onClick={handleLikeAndUnlike}
                            style={{
                                cursor: isLiking ? "wait" : "pointer",
                                opacity: isLiking ? 0.7 : 1,
                            }}
                        >
                            <path
                                d="M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z"
                                stroke="currentColor"
                                strokeWidth="1.25"
                            ></path>
                        </svg>
                        <Text color="gray.light" fontSize="sm" ml={1}>
                            {likesCount}
                        </Text>
                    </Flex>

                    {/* SVG Comment + count */}
                    <Flex alignItems="center">
                        <svg
                            aria-label="Comment"
                            color=""
                            fill=""
                            height="19"
                            role="img"
                            viewBox="0 0 24 24"
                            width="19"
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                                e.preventDefault();
                                if (!user) {
                                    showToast("Error", "Please login to comment", "error");
                                    return;
                                }
                                onOpen();
                            }}
                        >
                            <title>Comment</title>
                            <path
                                d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
                                fill="none"
                                stroke="currentColor"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                            />
                        </svg>
                        <Text color="gray.light" fontSize="sm" ml={1}>
                            {post?.replies?.length || 0}
                        </Text>
                    </Flex>
                    
                    <RepostSVG />
                    <ShareSVG />
                </Flex>
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
                <ModalContent
                    bg={useColorModeValue("white", "#1E1E1E")}
                    borderRadius="20px"
                    width="600px"
                    maxWidth="90%"
                    mx="auto"
                    my="auto"
                >
                    <ModalHeader
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        position="relative"
                    >
                        <Button variant="ghost" onClick={onClose} fontSize="sm" position="absolute" left="0" _hover={{}}>
                            Hủy
                        </Button>
                        <Text fontSize="lg" fontWeight="bold" textAlign="center" flex="1">
                            Trả lời bài viết
                        </Text>
                    </ModalHeader>

                    <ModalBody
                        pb={6}
                        borderTop="1px solid"
                        borderColor={useColorModeValue("gray.300", "gray.light")}
                    >
                        {/* Tiêu đề trả lời */}
                        <Text fontSize="sm" color={useColorModeValue("dark", "white")} mb={4}>
                            Trả lời cho bài viết: {post.Text?.substring(0, 50)}{post.Text?.length > 50 ? "..." : ""}
                        </Text>

                        {/* Hiển thị bài viết gốc */}
                        <Box 
                            p={4} 
                            borderRadius="md" 
                            bg={useColorModeValue("gray.100", "gray.700")} 
                            mb={4}
                        >
                            <Text fontSize="md" fontWeight="bold" mb={2}>
                                {post?.Text || "Bài viết không có nội dung"}
                            </Text>
                            {post?.Image && (
                                <Box display="flex" justifyContent="center">
                                    <Image
                                        src={post.Image}
                                        alt="Post image"
                                        borderRadius="md"
                                        maxHeight="300px"
                                        objectFit="cover"
                                        mb={2}
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* Hiển thị thông tin người dùng */}
                        <Flex alignItems="center" gap={3} mb={4}>
                            <Image
                                src={user?.profilePic || "https://bit.ly/broken-link"}
                                alt={user?.name || "User"}
                                borderRadius="full"
                                boxSize="40px"
                            />
                            <Text fontSize="md" fontWeight="bold">
                                {user?.name || "Người dùng"}
                            </Text>
                        </Flex>

                        <Box
                            p={1}
                            borderRadius="md"
                            bg={useColorModeValue("rgba(211, 211, 211, 0.3)", "rgba(180, 180, 180, 0.3)")}
                            mb={4}
                        >
                            <Text fontSize="sm" color={useColorModeValue("dark", "white")}>
                                Trả lời cho bài viết:{" "}
                                {post?.text?.substring(0, 50) || "[Không có nội dung]"}
                                {post?.text?.length > 50 ? "..." : ""}
                            </Text>
                        </Box>

                        <FormControl>
                            <Textarea
                                placeholder="Nhập bình luận của bạn..."
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                size="md"
                                resize="vertical"
                                minHeight="120px"
                                border="none"
                                _focus={{ border: "none", boxShadow: "none" }}
                                fontSize="lg"
                            />
                        </FormControl>

                        {/* Hiển thị ảnh đã chọn */}
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
                            onChange={handleImageChange}
                        />
                    </ModalBody>

                    <ModalFooter
                        borderTop="1px solid"
                        borderColor={useColorModeValue("gray.300", "gray.light")}
                    >
                        <Flex width="100%" justifyContent="space-between" alignItems="center">
                            <IconButton
                                color={useColorModeValue("black", "white")}
                                aria-label="Upload image"
                                icon={<BsImage size="20px" />}
                                variant="ghost"
                                onClick={() => document.querySelector('input[type="file"]').click()}
                                _hover={{
                                    bg: useColorModeValue("gray.100", "gray.700"),
                                }}
                            />
                            <Button
                                colorScheme="blue"
                                px={6}
                                borderRadius="full"
                                onClick={handleReply}
                                isLoading={isReplying}

                                bg="white"
                                color="black"
                                border="1px solid"
                                borderColor="gray.300"
                                _hover={{ bg: "gray.100" }}
                            >
                                Gửi
                            </Button>
                        </Flex>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

const RepostSVG = () => {
    return (
        <svg
            aria-label="Repost"
            color="currentColor"
            fill="currentColor"
            height="20"
            role="img"
            viewBox="0 0 24 24"
            width="20"
            style={{ cursor: "pointer" }}
        >
            <title>Repost</title>
            <path
                fill=""
                d="M19.998 9.497a1 1 0 0 0-1 1v4.228a3.274 3.274 0 0 1-3.27 3.27h-5.313l1.791-1.787a1 1 0 0 0-1.412-1.416L7.29 18.287a1.004 1.004 0 0 0-.294.707v.001c0 .023.012.042.013.065a.923.923 0 0 0 .281.643l3.502 3.504a1 1 0 0 0 1.414-1.414l-1.797-1.798h5.318a5.276 5.276 0 0 0 5.27-5.27v-4.228a1 1 0 0 0-1-1Z"
            />
            <path
                d="M12.588 6.001l-1.795 1.795a1 1 0 1 0 1.414 1.414l3.5-3.5a1.003 1.003 0 0 0 0-1.417l-3.5-3.5a1 1 0 0 0-1.414 1.414l1.794 1.794H8.27A5.277 5.277 0 0 0 3 9.271V13.5a1 1 0 0 0 2 0V9.271a3.275 3.275 0 0 1 3.271-3.27Z"
            />
        </svg>
    );
};

const ShareSVG = () => {
    return (
        <svg

            aria-label="Share"
            color=""
            fill="rgb(243, 245, 247)"
            height="20"
            role="img"
            viewBox="-1 -1 24 24"
            width="20"
            style={{ cursor: "pointer" }}
        >
            <title>Share</title>
            <line
                fill="none"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.25"
                x1="22"
                y1="3"
                x2="9.218"
                y2="10.083"
            />
            <polygon
                fill="none"
                points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.25"
            />
        </svg>
    );
};

export default Actions;
