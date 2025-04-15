'use client'

import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Stack,
    Button,
    Heading,
    Text,
    useColorModeValue,
    Link,
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useDispatch } from "react-redux";
import { setAuthScreen } from "../reducers/authReducer"; 
import { setUser } from "../reducers/userReducer";
import useShowToast from "../hooks/useShowToast";

export default function LoginCard() {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
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
            // Update Redux store
            dispatch(setUser(data));
        } catch (error) {
            showToast("Error", error.toString(), "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex align={"center"} justify={"center"}>
            <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
                <Stack align={"center"}>
                    <Heading fontSize={"4xl"} textAlign={"center"}>
                        Login
                    </Heading>
                </Stack>
                <Box
                    rounded={"lg"}
                    bg={useColorModeValue("white", "gray.dark")}
                    boxShadow={"lg"}
                    p={8}
                    w={{
                        base: "full",
                        sm: "400px",
                    }}
                >
                    <Stack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Username</FormLabel>
                            <Input
                                type="text"
                                value={inputs.username}
                                onChange={(e) =>
                                    setInputs((prev) => ({
                                        ...prev,
                                        username: e.target.value,
                                    }))
                                }
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Password</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={inputs.password}
                                    onChange={(e) =>
                                        setInputs((prev) => ({
                                            ...prev,
                                            password: e.target.value,
                                        }))
                                    }
                                />
                                <InputRightElement h={"full"}>
                                    <Button
                                        variant={"ghost"}
                                        onClick={() => setShowPassword((prev) => !prev)}
                                    >
                                        {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                        <Stack spacing={10} pt={2}>
                            <Button
                                loadingText="Logging in"
                                size="lg"
                                bg={useColorModeValue("gray.600", "gray.700")}
                                color={"white"}
                                _hover={{
                                    bg: useColorModeValue("gray.700", "gray.800"),
                                }}
                                onClick={handleLogin}
                                isLoading={loading}
                            >
                                Login
                            </Button>
                        </Stack>
                        <Stack pt={6}>
                            <Text align={"center"}>
                                Don't have an account?{" "}
                                <Link
                                    color={"blue.400"}
                                    onClick={() => dispatch(setAuthScreen("signup"))}
                                >
                                    Sign up
                                </Link>
                            </Text>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
}