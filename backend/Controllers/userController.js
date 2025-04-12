import User from "../model/userModel.js"

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

        if(newUser) {
            res.status(201).json({ message: "User created successfully" })
        }
        else {
            res.status(400).json({ message: "User creation failed" })
        }

    } catch (err) {
        res.status(500).json({ message: err.message })
        console.log("loi khi dang nhap (signupUser)", err.message)
    }
}

export { signupUser }