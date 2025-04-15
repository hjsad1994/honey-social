
import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    HStack,
    InputRightElement,
    Stack,
    Button,
    Heading,
    Text,
    useColorModeValue,
    Link,
    useToast,
} from '@chakra-ui/react'
import { use, useState } from 'react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useDispatch } from 'react-redux'
import { setAuthScreen } from '../reducers/authReducer'
import useShowToast from './../hooks/useShowToast';
import { setUser } from '../reducers/userReducer'; // Add this import

export default function SignupCard() {
    const [showPassword, setShowPassword] = useState(false)
    const dispatch = useDispatch()
    const [inputs, setInputs] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
    })
    const showToast = useShowToast()
    const handleSignup = async () => {
        console.log(inputs)
        try {
            // CRUD -> Create is POST , Read is GET, Update is PUT, Delete is DELETE
            const res = await fetch('/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // set content type to JSON
                },
                body: JSON.stringify(inputs), // convert to JSON string
            })
            const data = await res.json(); // convert to JSON object
            if(data.error) {
                showToast('Error', data.error, 'error')
                return
            }            
            dispatch(setUser(data));
            
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra: ' + error.message);
        }
    }

    return (
        <Flex
            align={'center'}
            justify={'center'}
        >
            <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
                <Stack align={'center'}>
                    <Heading fontSize={'4xl'} textAlign={'center'}>
                        Sign up
                    </Heading>
                </Stack>
                <Box
                    rounded={'lg'}
                    bg={useColorModeValue('white', 'gray.dark')}
                    boxShadow={'lg'}
                    p={8}>
                    <Stack spacing={4}>
                        <HStack>
                            <Box>
                                <FormControl isRequired>
                                    <FormLabel>Full Name</FormLabel>
                                    <Input type="text"
                                        onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                                        value={inputs.name} />
                                </FormControl>
                            </Box>
                            <Box>
                                <FormControl isRequired>
                                    <FormLabel>Username</FormLabel>
                                    <Input type="text"
                                        onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                                        value={inputs.username}
                                    />
                                </FormControl>
                            </Box>
                        </HStack>
                        <FormControl isRequired>
                            <FormLabel>Email address</FormLabel>
                            <Input type="email"
                                onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                                value={inputs.email}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Password</FormLabel>
                            <InputGroup>
                                <Input type={showPassword ? 'text' : 'password'} 
                                    onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                                    value={inputs.password}
                                />
                                <InputRightElement h={'full'}>
                                    <Button
                                        variant={'ghost'}
                                        onClick={() => setShowPassword((showPassword) => !showPassword)}>
                                        {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                        <Stack spacing={10} pt={2}>
                            <Button
                                loadingText="Submitting"
                                size="lg"
                                bg={useColorModeValue('gray.600', 'gray.700')}
                                color={'white'}
                                _hover={{
                                    bg: useColorModeValue('gray.700', 'gray.800'),
                                }}
                                onClick={handleSignup}
                                >
                                Sign up
                            </Button>
                        </Stack>
                        <Stack pt={6}>
                            <Text align={'center'}>
                                Already a user? <Link color={'blue.400'} onClick={() => dispatch(setAuthScreen('login'))}>Login</Link>
                            </Text>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    )
}