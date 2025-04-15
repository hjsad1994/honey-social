import { Flex, useColorMode, Image, Box, Icon, Text } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
const Header = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const currentUser = useSelector((state) => state.user.user);
    const location = useLocation();
    const [activeIcon, setActiveIcon] = useState("home");
    const user = useSelector((state) => state.user.user);
    // Determine active icon based on current URL
    useEffect(() => {
        if (location.pathname === "/") {
            setActiveIcon("home");
        } else if (currentUser && location.pathname.includes(`/${currentUser.username}`)) {
            setActiveIcon("profile");
        } else {
            setActiveIcon("");
        }
    }, [location.pathname, currentUser]);

    // Active icon styles
    const activeIconStyles = {
        borderRadius: "10px",
        p: 2,
        // bg property removed as per your comment
    }
    
    // Enhanced hover styles for smoother animation
    const hoverStyles = {
        bg: colorMode === "dark" ? "rgba(80, 80, 80, 0.3)" : "rgba(180, 180, 180, 0.3)",
        borderRadius: "10px",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        zIndex: 1
    }

    // New text hover styles
    const textHoverStyles = {
        transform: "scale(1.05)",
        // textDecoration: "underline",
        transition: "all 0.2s ease",
        cursor: "default",
        // color: colorMode === "dark" ? "teal.200" : "teal.500",
    }

    // Container style with improved transition
    const containerStyle = {
        transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        borderRadius: "10px"
    };

    return (
        <>
            {/* Header text with hover effect */}
            {user && (
                <Flex justifyContent={"center"} mt={5} mb="5" fontWeight="bold">
                    <Text
                        fontSize="lg"
                        color={colorMode === "dark" ? "white" : "black"}
                        transition="all 0.3s ease"
                        _hover={textHoverStyles}
                        px={3}
                        py={1}
                        borderRadius="md"
                    >
                        {activeIcon === "profile" ? "Trang Cá Nhân" : "Dành Cho Bạn"}
                    </Text>
                </Flex>
            )}


            <Box width="100%" left={1} right={0} position="relative">
                {/* Logo container */}
                <Flex
                    alignItems="center"
                    mt="400"
                    pl={4}
                    position="absolute"
                    left={0}
                >
                    <Box
                        sx={containerStyle}
                        _hover={hoverStyles}
                        boxSize={50}
                    >
                        <Image
                            cursor={'pointer'}
                            alt='logo'
                            w={7}
                            src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
                            onClick={toggleColorMode}
                            position="relative"
                            zIndex={2}
                            transition="transform 0.3s ease"
                            _hover={{ transform: "rotate(180deg)" }}
                        />
                    </Box>
                </Flex>
            </Box>
            {user && (
                <Box width="100%" left={1} right={0} position="relative">
                    <Flex
                        alignItems="center"
                        mt="300"
                        pl={4}
                        position="absolute"
                        left={0}
                    >
                        {/* Home icon SVG */}
                        <Link to="/" onClick={() => setActiveIcon("home")}>
                            <Box
                                {...(activeIcon === "home" ? activeIconStyles : {})}
                                sx={containerStyle}
                                boxSize={50}
                                _hover={activeIcon !== "home" ? hoverStyles : {}}
                            >
                                <Icon
                                    viewBox="1 1 24 24"
                                    boxSize={6}
                                    cursor="pointer"
                                    fill={activeIcon === "home" ? "currentColor" : "none"}
                                    stroke={"currentColor"}
                                    strokeWidth={2.5}
                                    strokeLinecap="round"
                                    position="relative"
                                    zIndex={2}
                                    transition="all 0.3s ease"
                                    _hover={{ transform: "scale(1.1)" }}
                                >
                                    <path d="M2.25 12.8855V20.7497C2.25 21.8543 3.14543 22.7497 4.25 22.7497H8.25C8.52614 22.7497 8.75 22.5259 8.75 22.2497V17.6822V17.4997C8.75 15.1525 10.6528 13.2497 13 13.2497C15.3472 13.2497 17.25 15.1525 17.25 17.4997V17.6822V22.2497C17.25 22.5259 17.4739 22.7497 17.75 22.7497H21.75C22.8546 22.7497 23.75 21.8543 23.75 20.7497V12.8855C23.75 11.3765 23.0685 9.94815 21.8954 8.99883L16.1454 4.3454C14.3112 2.86095 11.6888 2.86095 9.85455 4.3454L4.10455 8.99883C2.93153 9.94815 2.25 11.3765 2.25 12.8855Z" />
                                </Icon>
                            </Box>
                        </Link>
                    </Flex>
                </Box>
            )}

            {user && (
                <Box width="100%" left={1} right={0} position="relative">
                    <Flex
                        alignItems="center"
                        mt="500"
                        pl={4}
                        position="absolute"
                        left={0}
                    >
                        <Link
                            to={currentUser ? `/${currentUser.username}` : "/auth"}
                            onClick={() => setActiveIcon("profile")}
                        >
                            <Box
                                {...(activeIcon === "profile" ? activeIconStyles : {})}
                                sx={containerStyle}
                                boxSize={50}
                                _hover={activeIcon !== "profile" ? hoverStyles : {}}
                            >
                                <Icon
                                    viewBox="1 1 24 24"
                                    boxSize={6}
                                    cursor="pointer"
                                    fill={activeIcon === "profile" ? "currentColor" : "transparent"}
                                    stroke={"currentColor"}
                                    strokeWidth={2.5}
                                    strokeLinecap="round"
                                    position="relative"
                                    zIndex={2}
                                    transition="all 0.3s ease"
                                    _hover={{ transform: "scale(1.1)" }}
                                >
                                    <circle cx="13" cy="9" r="6" stroke="currentColor" strokeWidth="2.5" />
                                    <path d="M6.26678 23.75H19.744C21.603 23.75 22.5 23.2186 22.5 22.0673C22.5 19.3712 18.8038 15.75 13 15.75C7.19625 15.75 3.5 19.3712 3.5 22.0673C3.5 23.2186 4.39704 23.75 6.26678 23.75Z" stroke="currentColor" strokeWidth="2.5" />
                                </Icon>
                            </Box>
                        </Link>
                    </Flex>
                </Box>
            )}

        </>
    );
};

export default Header;
