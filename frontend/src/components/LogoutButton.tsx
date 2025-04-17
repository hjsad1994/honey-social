
import { Button, useColorModeValue, Tooltip } from '@chakra-ui/react';
import { logoutUser } from '../reducers/userReducer';
import useShowToast from '../hooks/useShowToast';
import { useDispatch } from 'react-redux';
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const dispatch = useDispatch();
    const showToast = useShowToast();
    const navigate = useNavigate();
    
    // Use Chakra's color mode values for consistent theming
    const buttonBg = useColorModeValue("white", "gray.800");
    const buttonHoverBg = useColorModeValue("gray.100", "gray.700");
    const iconColor = useColorModeValue("black", "white");

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/users/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();

            // Only handle as error if it's not a success message
            if (data.error && data.error !== "logged out successfully") {
                showToast('Error', data.error, 'error');
                return;
            }
            
            // Continue with logout process
            dispatch(logoutUser());
            localStorage.removeItem("user-honeys");
            showToast('Success', 'Đăng xuất thành công', 'success');
            
            // Use React Router navigate for better SPA behavior
            navigate('/auth', { replace: true });

        } catch (error) {
            console.error("Logout failed:", error);
            showToast('Error', 'Đăng xuất thất bại', 'error');
        }
    }

    return (
        <Tooltip label="Đăng xuất" placement="left">
            <Button
                position="fixed"
                top={{ base: "20px", md: "30px" }}
                right={{ base: "20px", md: "30px" }}
                size={{ base: "sm", md: "md" }}
                onClick={handleLogout}
                leftIcon={<FiLogOut size="20px" />}
                bg={buttonBg}
                color={iconColor}
                boxShadow="sm"
                borderRadius="full"
                _hover={{
                    bg: buttonHoverBg,
                    transform: "translateY(-2px)",
                    boxShadow: "md"
                }}
                transition="all 0.3s ease"
            >
                Đăng xuất
            </Button>
        </Tooltip>
    );
}

export default LogoutButton;