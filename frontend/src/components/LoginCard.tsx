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
import { AppDispatch } from "../store/store";
import { useNavigate } from "react-router-dom";

interface LoginInputs {
    username: string;
    password: string;
}

const LoginCard: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [inputs, setInputs] = useState<LoginInputs>({
        username: "",
        password: "",
    });
    const showToast = useShowToast();

    const handleLogin = async (): Promise<void> => {
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
            
            // Set user data in Redux store
            dispatch(setUser(data));
            
            // Show success message
            showToast("Success", "Đăng nhập thành công", "success");
            
            // Navigate to home page
            navigate("/");
            
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            showToast("Error", errorMessage, "error");
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setInputs(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Flex align={"center"} justify={"center"}>
            <Stack align={"center"} spacing={4} mx={"auto"} maxW={"sm"} py={12} px={6}>
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
                                name="username"
                                placeholder="Tên người dùng, số điện thoại hoặc email"
                                value={inputs.username}
                                onChange={handleInputChange}
                                bg={inputBg}
                                color={textColor}
                                border="none"
                                borderRadius="xl"
                                _placeholder={{ color: placeholderColor }}
                                size="lg"
                                height="55px"
                                _hover={{ border: "none" }}
                                _focus={{
                                    borderWidth: "1px",
                                    borderStyle: "solid",
                                    borderColor: inputBorder,
                                    boxShadow: "none",
                                    outline: "none",
                                }}
                                transition="none"
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <Input
                                type="password"
                                name="password"
                                placeholder="Mật khẩu"
                                value={inputs.password}
                                onChange={handleInputChange}
                                bg={inputBg}
                                color={textColor}
                                border="none"
                                borderRadius="xl"
                                _placeholder={{ color: placeholderColor }}
                                size="lg"
                                height="55px"
                                _hover={{ border: "none" }}
                                _focus={{
                                    borderWidth: "1px",
                                    borderStyle: "solid",
                                    borderColor: inputBorder,
                                    boxShadow: "none",
                                    outline: "none",
                                }}
                                transition="none"
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
                                onClick={() => dispatch(setAuthScreen("register"))}
                            >
                                Đăng ký tài khoản mới
                            </Link>
                        </Text>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
};

export default LoginCard;