import { Flex, useColorMode, Image, Box, Icon, Text, useBreakpointValue } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { AddIcon } from '@chakra-ui/icons'; // Thêm import AddIcon 
import { useDisclosure } from '@chakra-ui/react'; // Thêm useDisclosure để mở modal 
import CreatePosts from './CreatePosts'; // Thêm import

const Header = () => {
    const { colorMode, toggleColorMode } = useColorMode();
    const currentUser = useSelector((state) => state.user.user);
    const location = useLocation();
    const [activeIcon, setActiveIcon] = useState("home");
    const user = useSelector((state) => state.user.user);
    const { isOpen, onOpen, onClose } = useDisclosure(); // Để mở modal CreatePost
    
    useEffect(() => {
        if (location.pathname === "/") {
            setActiveIcon("home");
        } else if (currentUser && location.pathname.includes(`/${currentUser.username}`)) {
            setActiveIcon("profile");
        } else {
            setActiveIcon("");
        }
    }, [location.pathname, currentUser]);

    const activeIconStyles = {
        borderRadius: "10px",
        p: 2,
    }
    
    const hoverStyles = {
        bg: colorMode === "dark" ? "rgba(80, 80, 80, 0.3)" : "rgba(180, 180, 180, 0.3)",
        borderRadius: "10px",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        zIndex: 1
    }

    const textHoverStyles = {
        transform: "scale(1.05)",
        transition: "all 0.2s ease",
        cursor: "default",
    }

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

            {/* Responsive Navigation Bar */}
            <Box 
                position="fixed"
                left={{ base: 0, md: 0 }}
                bottom={{ base: 0, md: "auto" }}
                top={{ base: "auto", md: "50%" }}
                transform={{ base: "translateY(0)", md: "translateY(-50%)" }}
                width={{ base: "100%", md: "80px" }}
                height={{ base: "60px", md: "auto" }} 
                display="flex"
                flexDirection={{ base: "row", md: "column" }}
                alignItems="center"
                justifyContent="space-evenly"
                gap={{ base: 0, md: 6 }}
                zIndex={100}
                bg={{ base: colorMode === "dark" ? "#101010" : "whiteAlpha.300", md: "transparent" }}
                borderTop={{ base: "1px solid", md: "none" }}
                borderColor={{ base: colorMode === "dark" ? "whiteAlpha.300" : "#101010", md: "transparent" }}
                boxShadow={{ base: "0 -2px 10px rgba(0,0,0,0.05)", md: "none" }}
                px={{ base: 4, md: 0 }}
            >
                {/* Logo */}
                <Box
                    sx={containerStyle}
                    _hover={hoverStyles}
                    boxSize={{ base: 45, md: 55 }}
                    mx={{ base: 0, md: "auto" }}
                    display="flex" 
                    alignItems="center"
                    justifyContent="center"
                >
                    <Image
                        cursor={'pointer'}
                        alt='logo'
                        w={{ base: 9, md: 10 }}
                        src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
                        onClick={toggleColorMode}
                        position="relative"
                        zIndex={2}
                        transition="transform 0.45s ease"
                        _hover={{ transform: "rotate(360deg)" }}
                    />
                </Box>

                {/* Home Icon */}
                {user && (
                    <Link to="/" onClick={() => setActiveIcon("home")}>
                        <Box
                            {...(activeIcon === "home" ? activeIconStyles : {})}
                            sx={containerStyle}
                            boxSize={{ base: 45, md: 50 }}
                            _hover={activeIcon !== "home" ? hoverStyles : {}}
                            mx={{ base: 0, md: "auto" }}
                            display="flex"
                            alignItems="center" 
                            justifyContent="center"
                        >
                            <Icon
                                viewBox="1 1 24 24"
                                boxSize={{ base: 6, md: 6 }}
                                cursor="pointer"
                                fill={activeIcon === "home" ? "currentColor" : "none"}
                                stroke={"currentColor"}
                                strokeWidth={2}
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
                )}

                {/* Add Post Icon */}
                {user && (
                    <Box
                        sx={containerStyle}
                        bg={colorMode === "dark" ? "whiteAlpha.200" : "rgba(0, 0, 0, 0.06)"}
                        boxSize={{ base: 45, md: 50 }}
                        mx={{ base: 0, md: "auto" }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        cursor="pointer"
                        onClick={onOpen} // Mở CreatePost modal
                        _hover={{
                            bg: colorMode === "dark" ? "whiteAlpha.300" : "rgba(0, 0, 0, 0.1)",
                            transform: "scale(1.05)",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        }}
                        position="relative"
                        transition="all 0.3s ease"
                    >
                        <AddIcon 
                            boxSize={{ base: 4, md: 5 }}
                            color={colorMode === "dark" ? "white" : "black"}
                            position="relative"
                            zIndex={2}
                        />
                    </Box>
                )}

                {/* Profile Icon */}
                {user && (
                    <Link
                        to={currentUser ? `/${currentUser.username}` : "/auth"}
                        onClick={() => setActiveIcon("profile")}
                    >
                        <Box
                            {...(activeIcon === "profile" ? activeIconStyles : {})}
                            sx={containerStyle}
                            boxSize={{ base: 45, md: 50 }}
                            _hover={activeIcon !== "profile" ? hoverStyles : {}}
                            mx={{ base: 0, md: "auto" }}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon
                                viewBox="1 1 24 24"
                                boxSize={{ base: 6, md: 6 }}
                                cursor="pointer"
                                fill={activeIcon === "profile" ? "currentColor" : "transparent"}
                                stroke={"currentColor"}
                                strokeWidth={2}
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
                )}
            </Box>

            {/* Modal CreatePost */}
            {isOpen && <CreatePosts isOpen={isOpen} onClose={onClose} />}
        </>
    );
};

export default Header;
