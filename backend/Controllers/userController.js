import User from "../model/userModel.js"
import bcrypt from "bcryptjs"
import GenerateTokenAndSetCookie from "../utils/helpers/GenerateTokenAndSetCookie.js"
import generateTokenAndSetCookie from "../utils/helpers/GenerateTokenAndSetCookie.js"


// dang ky
const signupUser = async (req, res) => {
    try {
        const { name, email, username, password } = req.body
        const user = await User.findOne({ $or: [{ email }, { username }] })
        if (user) {
            return res.status(400).json({ message: "Email or username already exists" })
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
            GenerateTokenAndSetCookie(newUser._id, res) // set token in cookie
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                profilePic: newUser.profilePic,
                followers: newUser.followers,
                following: newUser.following,
                bio: newUser.bio,
            })
        } else {
            res.status(400).json({ message: "invalid user data" })
        }

    } catch (err) {
        res.status(500).json({ message: err.message })
        console.log("error in signupUser controller", err.message)
    }
}


const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "") // check password
        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ message: "invalid username or password" })
        }
        generateTokenAndSetCookie(user._id, res)
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
        })

    } catch (err) {
        res.status(500).json({ message: err.message })
        console.log("error in loginUser controller", err.message)
    }
}
const logoutUser = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 })
        res.status(200).json({ message: "logged out successfully" })

    } catch (err) {
        res.status(500).json({ message: err.message })
        console.log("error in logoutUser controller", err.message)
    }
}
const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params
        const userToModify = await User.findById(id)
        const CurrentUser = await User.findById(req.user._id)
        if (id === req.user._id) {
            return res.status(400).json({ message: "you cannot follow/unfollow yourself" })
        }
        if (!userToModify || !CurrentUser) {
            return res.status(404).json({ message: "user not found" })
        }
        const isFollowing = CurrentUser.following.includes(id)
        if (isFollowing) {
            // unfollow user
            // modify current user follwing
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } })
            res.status(200).json({ message: "unfollowed successfully" })
        } else {
            // Follow user
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } })
            res.status(200).json({ message: "followed successfully" })
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
        console.log("error in followUnfollowUser controller", err.message)
    }
}
export { signupUser, loginUser, logoutUser, followUnfollowUser }