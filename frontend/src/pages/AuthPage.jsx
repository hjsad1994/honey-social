import { useSelector } from "react-redux";
import LoginCard from "../components/LoginCard";
import SignupCard from "../components/SignupCard";

function AuthPage() {
    // Sử dụng useSelector của Redux để thay thế useRecoilValue
    const authScreen = useSelector((state) => state.auth.authScreen);
    console.log(authScreen);

    return (
        <>
            {authScreen === 'login' ? <LoginCard /> : <SignupCard />}
        </>
    );
}

export default AuthPage;
