import React from 'react'
import { Button } from '@chakra-ui/react';
import { logoutUser } from '../reducers/userReducer';
import useShowToast from './../hooks/useShowToast';
import { useDispatch, useSelector } from 'react-redux';
import { FiLogOut } from "react-icons/fi";
import { useState } from 'react';
const LogoutButton = () => {
    const dispatch = useDispatch();
    const showToast = useShowToast();
    const user = useSelector(state => state.user.user); // Thêm dòng này để debug


    const handleLogout = async () => {

        try {
            console.log("Logging out...", user); // Log user trước khi logout

            // fetch
            const res = await fetch('/api/users/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const data = await res.json();

            if (data.error) {
                showToast('Error', data.error, 'error');
            }
            // dispatch action logoutuser for update redux store and delete localstorage user-honeys
            dispatch(logoutUser())

            localStorage.removeItem("user-honeys");
            console.log("Logged out successfully, localStorage cleared");
            showToast('Success', 'Logged out successfully', 'success');

            window.location.reload();

        } catch (error) {
            console.error("Logout failed:", error);
            showToast('Error', 'Logout failed', 'error');
        }
        // van logout neu api error
        // dispatch(logoutUser());

    }
    return (
        <Button
            position={"fixed"}
            top={"30px"}
            right={"30px"}
            size={"sm"}
            onClick={handleLogout}
            leftIcon={<FiLogOut
                size={"20px"}
            />}

        >

        </Button>
    )
}

export default LogoutButton
