'use client'

import {
    Flex,
    Box,
    FormControl,
    Input,
    InputGroup,
    InputRightElement,
    Stack,
    Button,
    Heading,
    Text,
    Link,
    useColorModeValue,
} from '@chakra-ui/react'
import { useState } from 'react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useDispatch } from 'react-redux'
import { setAuthScreen } from '../reducers/authReducer'
import useShowToast from '../hooks/useShowToast'
import { setUser } from '../reducers/userReducer'
import { AppDispatch } from '../store/store'

interface SignupInputs {
    name: string;
    username: string;
    email: string;
    password: string;
}

const SignupCard: React.FC = () => {
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const dispatch = useDispatch<AppDispatch>()
    const [inputs, setInputs] = useState<SignupInputs>({
        name: "",
        username: "",
        email: "",
        password: "",
    })
    const [loading, setLoading] = useState<boolean>(false)
    const showToast = useShowToast()

    const handleSignup = async (): Promise<void> => {
        setLoading(true)
        try {
            const res = await fetch('/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inputs),
            })
            const data = await res.json()
            if (data.error) {
                showToast('Error', data.error, 'error')
                return
            }
            dispatch(setUser(data))
        } catch (error: any) {
            showToast('Error', error.toString(), 'error')
        } finally {
            setLoading(false)
        }
    }

    // Define light and dark mode values using useColorModeValue
    const bgColor = useColorModeValue("gray.100", "transparent")
    const textColor = useColorModeValue("black", "white")
    const inputBg = useColorModeValue("rgba(104, 101, 101, 0.3)", "rgba(71, 68, 68, 0.3)")
    const inputBorder = useColorModeValue("gray.300", "white")
    const placeholderColor = useColorModeValue("gray.700", "gray.400")
    const buttonBg = useColorModeValue("black", "white")
    const buttonTextColor = useColorModeValue("white", "black")
    const buttonHoverBg = useColorModeValue("gray.800", "gray.200")
    const linkColor = useColorModeValue("gray.700", "gray.400")

    // Handle input changes with typed event handler
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
                        Đăng ký
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
                                name="name"
                                placeholder="Họ và tên"
                                value={inputs.name}
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
                                type="text"
                                name="username"
                                placeholder="Tên người dùng"
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
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={inputs.email}
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
                            <InputGroup>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
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
                                <InputRightElement h={'full'}>
                                    <Button
                                        variant={'ghost'}
                                        onClick={() => setShowPassword(!showPassword)}
                                        bg="transparent"
                                        _hover={{ bg: "transparent" }}
                                        _active={{ bg: "transparent" }}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <ViewIcon color={textColor} /> : <ViewOffIcon color={textColor} />}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                        <Button
                            size="lg"
                            bg={buttonBg}
                            color={buttonTextColor}
                            _hover={{ bg: buttonHoverBg }}
                            onClick={handleSignup}
                            isLoading={loading}
                            height="55px"
                            borderRadius="xl"
                        >
                            Đăng ký
                        </Button>
                        <Text align={"center"} color={textColor}>
                            Đã có tài khoản?{' '}
                            <Link
                                color={linkColor}
                                onClick={() => dispatch(setAuthScreen('login'))}
                            >
                                Đăng nhập
                            </Link>
                        </Text>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    )
}

export default SignupCard;