import { Flex, Spinner, Text, Box, useColorModeValue, Button } from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiRefreshCw } from "react-icons/fi";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { RootState } from "../store/store";
import { setPosts } from "../reducers/postReducer"; // Change this line
import { Post as IPost } from "../types/types"; // Updated to use correct types

const HomePage: React.FC = () => {
    const showToast = useShowToast();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Get posts from Redux store
    const posts = useSelector((state: RootState) => state.posts.posts); // Update this selector
    // const currentUser = useSelector((state: RootState) => state.user.user);

    // Pre-compute all theme values
    const cardBg = useColorModeValue("white", "#161617");
    const shadowColor = useColorModeValue("lg", "dark-lg");
    const borderColor = useColorModeValue("blackAlpha.300", "whiteAlpha.200");
    const noPostsTextColor = useColorModeValue("gray.600", "gray.400");
    const refreshButtonBg = useColorModeValue("blackAlpha.300", "gray.700");
    const refreshButtonHoverBg = useColorModeValue("gray.200", "gray.600");

    // Move fetch posts functionality to a reusable function
    const fetchPosts = useCallback(async (showLoadingState: boolean = true): Promise<void> => {
        if (showLoadingState) setLoading(true);
        try {
            const res = await fetch("/api/posts/feed");
            const data = await res.json();

            if (data.error) {
                showToast("Lỗi", data.error, "error");
                return;
            }

            // Store posts in Redux - Use setPosts instead of setFeedPosts
            dispatch(setPosts(data));
        } catch (error: unknown) { // Use unknown instead of any
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            showToast("Lỗi", errorMessage, "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [dispatch, showToast]);

    // Initial data fetch
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Handle refresh
    const handleRefresh = (): void => {
        setRefreshing(true);
        fetchPosts(false);
    };

    if (loading) {
        return (
            <Flex justifyContent="center" alignItems="center" height="100vh">
                <Spinner size="xl" color="blue.500" thickness="4px" />
            </Flex>
        );
    }

    if (posts.length === 0) {
        return (
            <Flex justifyContent="center" alignItems="center" height="70vh" flexDirection="column" gap={4}>
                <Text fontSize="xl" fontWeight="bold">Chưa có bài viết nào</Text>
                <Text color={noPostsTextColor} textAlign="center" px={4}>
                    Theo dõi những người dùng khác để xem bài viết của họ tại đây
                </Text>
                <Button
                    leftIcon={<FiRefreshCw />}
                    onClick={handleRefresh}
                    mt={4}
                    bg={refreshButtonBg}
                    _hover={{ bg: refreshButtonHoverBg }}
                    isLoading={refreshing}
                    loadingText="Đang làm mới"
                >
                    Làm mới
                </Button>
            </Flex>
        );
    }

    return (
        <>
            {/* <Flex justifyContent="flex-end" mb={4}>
                <Button
                    size="sm"
                    leftIcon={<FiRefreshCw />}
                    onClick={handleRefresh}
                    isLoading={refreshing}
                    loadingText="Đang làm mới"
                    bg={refreshButtonBg}
                    _hover={{ bg: refreshButtonHoverBg }}
                >
                    Làm mới
                </Button>
            </Flex> */}

            <Box
                p={{ base: 4, md: 6 }}
                borderRadius="30px"
                borderWidth="0.5px"
                borderStyle="solid"
                borderColor={borderColor}
                bg={cardBg}
                boxShadow={shadowColor}
                transition="all 0.3s ease"
            >
                {posts.map((post: IPost) => (
                    <Post
                        key={post._id}
                        post={{
                            _id: post._id,
                            text: post.text,
                            img: post.img,
                            likes: post.likes || [],
                            replies: post.replies || [],
                            createdAt: post.createdAt,
                            updatedAt: post.updatedAt || "", // Include updatedAt field
                            postedBy: typeof post.postedBy === 'string' ? post.postedBy : post.postedBy._id // Include postedBy here
                            
                        }}
                    />
                ))}

                {posts.length > 0 && (
                    <Flex justifyContent="center" py={4}>
                        <Text fontSize="sm" color={noPostsTextColor}>
                            Bạn đã xem tất cả bài viết
                        </Text>
                    </Flex>
                )}
            </Box>
        </>
    );
};

export default HomePage;