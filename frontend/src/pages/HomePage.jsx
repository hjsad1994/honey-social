import { Flex, Spinner, Text, Box, useColorModeValue } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";

const HomePage = () => {
    const showToast = useShowToast();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const cardBg = useColorModeValue("white", "#161617");
    const shadowColor = useColorModeValue("lg", "dark-lg");
    useEffect(() => {
        const getFeedPosts = async () => {
            try {
                const res = await fetch("/api/posts/feed");
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                console.log("Fetched posts:", data);
                setPosts(data);
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoading(false);
            }
        };

        getFeedPosts();
    }, [showToast]);

    // Render based on loading state and posts
    if (loading) {
        return (
            <Flex justifyContent="center" alignItems="center" height="100vh">
                <Spinner size="xl" />
            </Flex>
        );
    }

    // If there are no posts to display
    if (posts.length === 0) {
        return (
            <Flex justifyContent="center" alignItems="center" height="100vh" flexDirection="column" gap={4}>
                <Text fontSize="lg" fontWeight="bold">No posts found</Text>
                <Text color="gray.500">Follow some users to see their posts</Text>
            </Flex>
        );
    }

    // Render posts when available
    return (
        <>
      <Box
        p={6}
        borderRadius="30px"
        borderWidth="0.5px" 
        borderStyle="solid"
        borderColor={useColorModeValue("blackAlpha.300", "whiteAlpha.200")}
        bg={cardBg}
        boxShadow={shadowColor}
        transition="all 0.3s ease"
      >

                {posts.map((post) => (
                    <Post
                        key={post._id}
                        post={{
                            _id: post._id,
                            text: post.text,     // KEEP LOWERCASE to match Post component
                            img: post.img,       // KEEP LOWERCASE to match Post component
                            likes: post.likes || [],
                            replies: post.replies || [],
                            createdAt: post.createdAt
                        }}
                        postedBy={post.postedBy}
                    />
                ))}
            </Box>
        </>
    );
};

export default HomePage;