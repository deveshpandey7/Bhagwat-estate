import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;
    const hashedPasssword = bcryptjs.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPasssword });
    try {
        await newUser.save();
        res.status(201).json("User created Successfully!")
        
    } catch (error) {
        // use middleware in index.js to throw error, error is next send to that
       next(error);
    }
}

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        // check user email
        const validUser = await User.findOne({ email });

        // if not found user by email use middleware and send error 
        if(!validUser) return next(errorHandler(404, 'User not found!'));

        // check user password
        const validPassword = bcryptjs.compareSync(password, validUser.password);

        // if incorrect passsword use middleware send error
        if(!validPassword) return next(errorHandler(401, 'Invalid Credentials!'));

        // if valid sign token 
        const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET );

        //  user info without password
        const { password: pass, ...rest }  = validUser._doc;

        //and save cookie of user in browser and send
        res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest);

    } catch (error) {
        next(error);
    }
}