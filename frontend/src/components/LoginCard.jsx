'use client'

import {
    Flex,
    Box,
    FormControl,
    Input,
    Stack,
    Button,
    Heading,
    Text,
    Link,
    useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setAuthScreen } from "../reducers/authReducer";
import { setUser } from "../reducers/userReducer";
import useShowToast from "../hooks/useShowToast";

export default function LoginCard() {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const [inputs, setInputs] = useState({
        username: "",
        password: "",
    });
    const showToast = useShowToast();

    const handleLogin = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputs),
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            dispatch(setUser(data));
        } catch (error) {
            showToast("Error", error.toString(), "error");
        } finally {
            setLoading(false);
        }
    };

    // Define light and dark mode values using useColorModeValue
    const bgColor = useColorModeValue("gray.100", "transparent");
    const textColor = useColorModeValue("black", "white");
    const inputBg = useColorModeValue("rgba(104, 101, 101, 0.3)", "rgba(71, 68, 68, 0.3)");
    const inputBorder = useColorModeValue("gray.300", "white");
    const placeholderColor = useColorModeValue("gray.700", "gray.400");
    const buttonBg = useColorModeValue("black", "white");
    const buttonTextColor = useColorModeValue("white", "black");
    const buttonHoverBg = useColorModeValue("gray.800", "gray.200");
    const linkColor = useColorModeValue("gray.700", "gray.400");

    return (
        <Flex align={"center"} justify={"center"}>
            <Stack  align={"center"} spacing={4} mx={"auto"} maxW={"sm"} py={12} px={6}>
                <Stack align={"center"}>
                    <Heading fontSize={"xl"} textAlign={"center"} color={textColor}>
                        Đăng nhập 
                    </Heading>
                </Stack>
                <Box
                    rounded={"lg"}
                    bg={bgColor}
                    p={0}
                    w={{
                        base: "full",
                        sm: "380px",
                    }}
                >
                    <Stack spacing={2}>
                    <FormControl isRequired>
                            <Input
                                type="text"
                                placeholder="Tên người dùng, số điện thoại hoặc email"
                                value={inputs.username}
                                onChange={(e) =>
                                    setInputs((prev) => ({
                                        ...prev,
                                        username: e.target.value,
                                    }))
                                }
                                bg={inputBg}
                                color={textColor}
                                border="none" // Remove default border
                                borderRadius="xl"
                                _placeholder={{ color: placeholderColor }}
                                size="lg"
                              height="55px"
                                _hover={{ border: "none" }} // No border on hover
                                _focus={{
                                    borderWidth: "1px", // Fixed 1px border
                                    borderStyle: "solid",
                                    borderColor: inputBorder,
                                    boxShadow: "none", // Remove focus shadow/glow
                                    outline: "none", // Remove default outline
                                }}
                                transition="none" // Disable all transitions
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <Input
                                type="password"
                                placeholder="Mật khẩu"
                                value={inputs.password}
                                onChange={(e) =>
                                    setInputs((prev) => ({
                                        ...prev,
                                        password: e.target.value,
                                    }))
                                }
                                bg={inputBg}
                                color={textColor}
                                border="none" // Remove default border
                                borderRadius="xl"
                                _placeholder={{ color: placeholderColor }}
                                size="lg"
                                height="55px"
                                _hover={{ border: "none" }} // No border on hover
                                _focus={{
                                    borderWidth: "1px", // Fixed 1px border
                                    borderStyle: "solid",
                                    borderColor: inputBorder,
                                    boxShadow: "none", // Remove focus shadow/glow
                                    outline: "none", // Remove default outline
                                }}
                                transition="none" // Disable all transitions
                            />
                        </FormControl>
                        <Button
                            size="lg"
                            bg={buttonBg}
                            color={buttonTextColor}
                            _hover={{ bg: buttonHoverBg }}
                            onClick={handleLogin}
                            isLoading={loading}
                            height="55px"
                            borderRadius="xl"
                        >
                            Đăng nhập
                        </Button>
                        <Text align={"center"} color={textColor}>
                            <Link
                                color={linkColor}
                                onClick={() => dispatch(setAuthScreen("signup"))}
                            >
                                Đăng ký tài khoản mới
                            </Link>
                        </Text>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
}



// loi bị luu mat khau view nhập dữ liệu không load mẫu mới mà load mẫu cũ