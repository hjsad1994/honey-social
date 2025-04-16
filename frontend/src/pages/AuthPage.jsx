import { useSelector } from "react-redux";
import LoginCard from "../components/LoginCard";
import SignupCard from "../components/SignupCard";

function AuthPage() {
    const authScreen = useSelector((state) => state.auth.authScreen);
    console.log(authScreen);

    return (
        <div
            style={{
                backgroundImage: "url('/bg-logout.png')", // Ảnh background từ thư mục public
                backgroundSize: "1785px 510px", // Kích thước cố định: 1785px x 510px
                backgroundPosition: "top center", // Căn giữa ảnh
                backgroundRepeat: "no-repeat", // Không lặp lại ảnh
                minHeight: "100vh", // Đảm bảo bao quát toàn bộ chiều cao màn hình
                width: "100vw", // Đảm bảo bao quát toàn bộ chiều rộng màn hình
                position: "fixed", // Đảm bảo background cố định và bao quát toàn bộ
                top: 0,
                left: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "auto", // Cho phép cuộn nếu nội dung vượt quá màn hình
            }}
        >
            <div
                style={{
                    position: "relative",
                    zIndex: 1, // Đảm bảo nội dung nằm trên background
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                {authScreen === 'login' ? <LoginCard /> : <SignupCard />}
            </div>
        </div>
    );
}

export default AuthPage;