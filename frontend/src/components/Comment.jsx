import React, { useState, useEffect } from 'react';
import { Flex, Avatar, Text, Divider, Box } from '@chakra-ui/react';
import { BsThreeDots } from 'react-icons/bs';
import { useSelector, useDispatch } from 'react-redux';
import useShowToast from '../hooks/useShowToast';
import { updatePost } from '../reducers/postReducer';

function Comment({ reply, postId }) {
    // Add check for reply prop
    if (!reply) return null;
    
    const dispatch = useDispatch();
    // Extract all necessary data from reply object
    const { text, username, userProfilePic, createdAt, likes = [] } = reply;
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(likes.length);
    const [isLiking, setIsLiking] = useState(false);
    const currentUser = useSelector(state => state.user.user);
    const showToast = useShowToast();

    // Format time function
    const formatTimeCompact = (date) => {
        try {
            const now = new Date();
            const postDate = new Date(date);

            // Check if date is valid
            if (isNaN(postDate.getTime())) {
                return ""; // Return empty string for invalid dates
            }

            const diffInSeconds = Math.floor((now - postDate) / 1000);

            if (diffInSeconds < 60) return `${diffInSeconds}s`;
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            if (diffInMinutes < 60) return `${diffInMinutes}m`;
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) return `${diffInHours}h`;
            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 7) return `${diffInDays}d`;
            const diffInWeeks = Math.floor(diffInDays / 7);
            if (diffInWeeks < 5) return `${diffInWeeks}w`;
            const diffInMonths = Math.floor(diffInDays / 30);
            if (diffInMonths < 12) return `${diffInMonths}mo`;
            const diffInYears = Math.floor(diffInDays / 365);
            return `${diffInYears}y`;
        } catch (error) {
            console.error("Date formatting error:", error);
            return "";
        }
    };

    // Check if current user has liked this comment
    useEffect(() => {
        if (currentUser && likes) {
            setIsLiked(likes.includes(currentUser._id));
            setLikesCount(likes.length);
        }
    }, [currentUser, likes]);

    // Handle like/unlike functionality
    const handleLike = async () => {
        if (!currentUser) {
            showToast("Error", "You must be logged in to like comments", "error");
            return;
        }
        
        if (isLiking) return;
        
        setIsLiking(true);
        const wasLiked = isLiked;
        setIsLiked(!wasLiked);
        setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
        
        try {
            const res = await fetch(`/api/posts/reply/like/${reply._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });
            
            const data = await res.json();
            if (data.error && data.error !== "reply liked successfully" && data.error !== "reply unliked successfully") {
                // Revert UI changes if error
                setIsLiked(wasLiked);
                setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
                showToast("Error", data.error, "error");
            } else {
                // Success - update Redux store
                setTimeout(() => {
                    fetch(`/api/posts/${postId}`)
                        .then(res => res.json())
                        .then(updatedPostData => {
                            if (!updatedPostData.error) {
                                dispatch(updatePost(updatedPostData));
                            }
                        })
                        .catch(err => console.error("Failed to fetch updated post data:", err));
                }, 300);
            }
        } catch (error) {
            // Revert UI changes if error
            setIsLiked(wasLiked);
            setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
            showToast("Error", error.message, "error");
        } finally {
            setIsLiking(false);
        }
    };

    // Use proper avatar with fallbacks
    const avatarSrc = userProfilePic || 
                     (currentUser && username === currentUser.username ? currentUser.profilePic : null) ||
                     "/tai.png";

    return (
        <>
            <Flex gap={4} my={2} w="full">
                <Avatar src={avatarSrc} size="sm" name={username} />
                <Flex gap={1} w="full" flexDirection="column">
                    <Flex w="full" justifyContent="space-between" alignItems="center">
                        <Text fontSize="sm" fontWeight="bold">{username}</Text>
                        <Flex gap={2} alignItems="center">
                            <Text fontSize="sm" color="gray.light">
                                {formatTimeCompact(createdAt)}
                            </Text>
                            <BsThreeDots />
                        </Flex>
                    </Flex>
                    <Text>{text}</Text>
                    <Flex gap={2} alignItems="center" mt={1}>
                        <Box>
                            <svg
                                aria-label="Like"
                                color={isLiked ? "rgb(237, 73, 86)" : ""}
                                fill={isLiked ? "rgb(237, 73, 86)" : "transparent"}
                                height="19"
                                role="img"
                                viewBox="0 0 24 22"
                                width="20"
                                onClick={handleLike}
                                style={{
                                    cursor: isLiking ? "wait" : "pointer",
                                    opacity: isLiking ? 0.7 : 1,
                                }}
                            >
                                <path
                                    d="M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                ></path>
                            </svg>
                        </Box>
                        {likesCount > 0 && (
                            <Text fontSize="sm" color="gray.light">
                                {likesCount} {likesCount === 1 ? "like" : "likes"}
                            </Text>
                        )}
                    </Flex>
                </Flex>
            </Flex>
            <Divider my={4} />
        </>
    );
}

export default Comment;