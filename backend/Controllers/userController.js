import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js"
import { v2 as cloudinary } from "cloudinary"

// Sửa hàm extractPublicIdFromUrl để xử lý đúng public_id
const extractPublicIdFromUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;
    
    try {
        // Tách URL để lấy phần public_id
        const urlParts = url.split('/');
        // Tìm vị trí của 'upload' trong URL
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        
        if (uploadIndex === -1) return null;
        
        // Lấy các phần sau 'upload'
        const pathParts = urlParts.slice(uploadIndex + 1);
        
        // Loại bỏ phần version number (vXXXXXXXXX)
        if (pathParts.length > 0 && pathParts[0].match(/^v\d+$/)) {
            pathParts.shift(); // Xóa phần tử đầu tiên (version)
        }
        
        // Ghép lại thành public_id đầy đủ
        let fullPath = pathParts.join('/');
        
        // Loại bỏ query parameters
        if (fullPath.includes('?')) {
            fullPath = fullPath.split('?')[0];
        }
        
        // Loại bỏ file extension
        if (fullPath.includes('.')) {
            const lastDotIndex = fullPath.lastIndexOf('.');
            fullPath = fullPath.substring(0, lastDotIndex);
        }
        
        console.log("Extracted public_id:", fullPath);
        return fullPath;
    } catch (error) {
        console.error("Error extracting public_id:", error);
        return null;
    }
}

const getUserProfile = async (req, res) => {
    const { username } = req.params
    try {
        const user = await User.findOne({ username }).select("-password").select("-updateAt") // exclude password from user object
        if (!user) {
            return res.status(404).json({ error: "user not found" })
        }
        res.status(200).json({ user })
    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in getUserProfile controller", err.message)
    }
}


// dang ky
const signupUser = async (req, res) => {
    try {
        const { name, email, username, password } = req.body
        const user = await User.findOne({ $or: [{ email }, { username }] })
        if (user) {
            return res.status(400).json({ error: "Email or username already exists" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await User.create({
            name,
            email,
            username,
            password: hashedPassword,
        })
        await newUser.save()

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res) // set token in cookie
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                bio: newUser.bio,
                profilePic: newUser.profilePic,
            })
        } else {
            res.status(400).json({ error: "invalid user data" })
        }

    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in signupUser controller", err.message)
    }
}


const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "") // check password
        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "invalid username or password" })
        }
        generateTokenAndSetCookie(user._id, res)
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilePic: user.profilePic,
        })

    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in loginUser controller", err.message)
    }
}
const logoutUser = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 })
        res.status(200).json({ error: "logged out successfully" })

    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in logoutUser controller", err.message)
    }
}
const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params
        const userToModify = await User.findById(id)
        const CurrentUser = await User.findById(req.user._id)
        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "you cannot follow/unfollow yourself" })
        }
        if (!userToModify || !CurrentUser) {
            return res.status(404).json({ error: "user not found" })
        }
        const isFollowing = CurrentUser.following.includes(id)
        if (isFollowing) {
            // unfollow user
            // modify current user follwing
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } })
            res.status(200).json({ error: "unfollowed successfully" })
        } else {
            // Follow user
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } })
            res.status(200).json({ error: "followed successfully" })
        }
    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in followUnfollowUser controller", err.message)
    }
}
const updateUser = async (req, res) => {
    const { name, email, username, password, bio } = req.body
    let { profilePic } = req.body
    const userId = req.user._id
    try {
        let user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: "user not found" })
        }
        if (req.params.id !== userId.toString()) {
            return res.status(401).json({ error: "you are not authorized to update this user" })
        }
        if (password) {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)
            user.password = hashedPassword
        }
        
        // Biến để lưu thông tin Cloudinary
        let cloudinaryInfo = null;
        
        // upload image to cloudinary
        if (profilePic) {
            try {
                // Xóa ảnh cũ nếu có
                if (user.profilePic) {
                    const publicId = extractPublicIdFromUrl(user.profilePic);
                    
                    if (publicId) {
                        console.log("Old image URL:", user.profilePic);
                        console.log("Attempting to delete with public ID:", publicId);
                        
                        try {
                            // Thêm options để đảm bảo xóa hoàn toàn
                            const deleteOptions = {
                                invalidate: true,
                                resource_type: "image"
                            };
                            
                            const deleteResult = await cloudinary.uploader.destroy(publicId, deleteOptions);
                            console.log("Delete result:", deleteResult);
                            
                            // Kiểm tra kết quả xóa và log chi tiết hơn
                            if (deleteResult.result === 'ok') {
                                console.log("Successfully deleted old image");
                            } else {
                                console.warn(`Warning: Could not delete old image. Result: ${JSON.stringify(deleteResult)}`);
                                
                                // Thử phương pháp xóa với tùy chọn khác
                                try {
                                    console.log("Trying alternative delete method...");
                                    const altDeleteResult = await cloudinary.api.delete_resources([publicId], {
                                        type: 'upload',
                                        resource_type: 'image'
                                    });
                                    console.log("Alternative delete result:", altDeleteResult);
                                } catch (altError) {
                                    console.error("Alternative delete method failed:", altError);
                                }
                            }
                        } catch (deleteError) {
                            console.error("Error deleting old image:", deleteError);
                        }
                    } else {
                        console.warn("Could not extract public_id from URL:", user.profilePic);
                    }
                }
                
                // Thêm timestamp vào options để tránh cache
                const uploadOptions = {
                    folder: "user_avatars", // Lưu trong folder cụ thể
                    public_id: `user_${userId}_${Date.now()}`, // Tạo public_id duy nhất dựa trên userId và timestamp
                    overwrite: true,        // Ghi đè nếu tồn tại
                    invalidate: true,       // Invalidate CDN cache
                    resource_type: "image"
                };
                
                const uploadedResponse = await cloudinary.uploader.upload(profilePic, uploadOptions);
                
                // Thêm tham số để tránh cache vào URL
                profilePic = uploadedResponse.secure_url + "?t=" + Date.now();
                
                // Lưu thông tin đầy đủ
                cloudinaryInfo = {
                    url: profilePic,
                    public_id: uploadedResponse.public_id,
                    format: uploadedResponse.format,
                    width: uploadedResponse.width,
                    height: uploadedResponse.height,
                    bytes: uploadedResponse.bytes,
                    resource_type: uploadedResponse.resource_type,
                    timestamp: Date.now()
                };
                
                console.log("Cloudinary upload response:", uploadedResponse);
            } catch (cloudinaryError) {
                console.error("Cloudinary error:", cloudinaryError);
                return res.status(500).json({ error: "Error uploading image" });
            }
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        
        // Chỉ cập nhật profilePic nếu có ảnh mới
        if (profilePic) {
            user.profilePic = profilePic;
        }
        
        user.bio = bio || user.bio;
        user = await user.save();
        
        // Trả về thông tin Cloudinary cùng với response
        res.status(200).json({ 
            error: "profile updated successfully", 
            user,
            cloudinaryInfo 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("error in updateUser controller", err.message);
    }
}

export { signupUser, loginUser, logoutUser, followUnfollowUser, updateUser, getUserProfile }