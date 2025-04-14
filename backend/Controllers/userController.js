import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js"

const getUserProfile = async (req, res) => {
    const { username } = req.params
    try {
        const user = await User.findOne({ username }).select("-password").select("-updateAt") // exclude password from user object
        if (!user) {
            return res.status(404).json({ error: "user not found" })
        }
        res.status(200).json({user})
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
    const { name, email, username, password, profilePic, bio } = req.body
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
        user.name = name || user.name
        user.email = email || user.email
        user.username = username || user.username
        user.profilePic = profilePic || user.profilePic
        user.bio = bio || user.bio
        user = await user.save()
        res.status(200).json({ error: "profuile updated successfully", user })


    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in updateUser controller", err.message)
    }
}

export { signupUser, loginUser, logoutUser, followUnfollowUser, updateUser, getUserProfile }