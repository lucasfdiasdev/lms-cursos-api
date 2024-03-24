import ejs from "ejs";
import "dotenv/config";
import path from "path";
import cloudinary from "cloudinary";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { redis } from "../config/redis";
import { sendMail } from "../utils/sendMail";
import { userModel } from "../models/user.model";
import { ErrorHandler } from "../utils/ErrorHandler";
import { IUser } from "../interfaces/user.interface";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import {
  sendToken,
  accessTokenOptions,
  refreshTokenOptions,
} from "../utils/jwt";
import {
  getAllUsersService,
  getUserById,
  updateUserRoleService,
} from "../services/user-service";

interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registrationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler(400, "Email already exists"));
      }

      const user: IRegistrationBody = {
        name,
        email,
        password,
      };

      const activationToken = createActivationToken(user);

      const activationCode = activationToken.activationCode;

      const data = { user: { name: user.name }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mail.ejs"),
        data
      );

      try {
        await sendMail({
          email: user.email,
          subject: "Activate your account",
          template: "activation-mail.ejs",
          data,
        });

        res.status(201).json({
          message: `Please check your email: ${user.email} to active your account!`,
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(500, error.message));
      }
    } catch (error: any) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);

interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    { user, activationCode },
    process.env.JWT_ACTIVATION_SECRET as Secret,
    {
      expiresIn: "5m",
    }
  );

  return { token, activationCode };
};

// activate user
interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;

      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.JWT_ACTIVATION_SECRET as string
      ) as { user: IUser; activationCode: string };

      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler(400, "Invalid activation code"));
      }

      const { name, email, password } = newUser.user;

      const existUser = await userModel.findOne({ email });

      if (existUser) {
        return next(new ErrorHandler(400, "Email already exists"));
      }

      const user = await userModel.create({
        name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
      });
    } catch (error: any) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);

// login user
interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;

      if (!email || !password) {
        return next(new ErrorHandler(400, "Please enter email and password"));
      }

      const user = await userModel.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler(400, "Invalid email or password"));
      }

      const isPasswordMatched = await user.comparePassword(password);

      if (!isPasswordMatched) {
        return next(new ErrorHandler(400, "Invalid password"));
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);

//logout user
export const logoutUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "", { maxAge: 1 });
      res.cookie("refresh_token", "", { maxAge: 1 });

      // delete user by id in redis
      const userId = req.user?._id || "";
      await redis.del(userId);

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);

// update access token
export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      const decoded = jwt.verify(
        refresh_token,
        process.env.JWT_REFRESH_TOKEN as string
      ) as JwtPayload;

      const message = "Could not refresh token";
      if (!decoded) {
        return next(new ErrorHandler(400, message));
      }

      const session = await redis.get(decoded.id as string);
      if (!session) {
        return next(new ErrorHandler(400, message));
      }

      const user = JSON.parse(session);

      const accessToken = jwt.sign(
        { id: user._id },
        process.env.JWT_ACCESS_TOKEN as string,
        {
          expiresIn: "5m",
        }
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_TOKEN as string,
        {
          expiresIn: "3d",
        }
      );

      req.user = user;

      res.cookie("access_token", accessToken, accessTokenOptions);
      res.cookie("refresh_token", refreshToken, refreshTokenOptions);

      res.status(200).json({
        success: "success",
        accessToken,
      });
    } catch (error: any) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);

// get user info
export const getUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      getUserById(userId, res);
    } catch (error: any) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);

interface ISocialAuthBody {
  email: string;
  name: string;
  avatar: string;
}

// social auth
export const socialAuth = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, avatar } = req.body as ISocialAuthBody;
      const user = await userModel.findOne({ email });

      if (!user) {
        const newUser = await userModel.create({
          email,
          name,
          avatar,
        });
        sendToken(newUser, 200, res);
      } else {
        sendToken(user, 200, res);
      }
    } catch (error: any) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);

interface IUpdateUserInfo {
  name?: string;
  email?: string;
}

// update user info
export const updateUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email } = req.body as IUpdateUserInfo;
      const userId = req.user?._id;
      const user = await userModel.findById(userId);

      if (email && user) {
        const isEmailExist = await userModel.findOne({ email });
        if (isEmailExist) {
          return next(new ErrorHandler(400, "Email already exists"));
        }
        user.email = email;
      }

      if (name && user) {
        user.name = name;
      }

      await user?.save();
      // update user info in the redis
      await redis.set(userId, JSON.stringify(user));

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {}
  }
);

// update user password

interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}

export const updatePassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpdatePassword;
      if (!oldPassword || !newPassword) {
        return next(
          new ErrorHandler(400, "Please enter old password and new password")
        );
      }

      const user = await userModel.findById(req.user?._id).select("+password");

      if (user?.password === undefined) {
        return next(new ErrorHandler(400, "Invalid user"));
      }

      const isPasswordMatched = await user?.comparePassword(oldPassword);

      if (!isPasswordMatched) {
        return next(new ErrorHandler(400, "Invalid old password"));
      }

      user.password = newPassword;

      await user.save();
      // save new password in the redis
      await redis.set(req.user?._id, JSON.stringify(user));

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);

// update user avatar
interface IUpdateAvatar {
  avatar: string;
}

export const updateAvatar = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body as IUpdateAvatar;

      const userId = req.user?._id;

      const user = await userModel.findById(userId);

      if (avatar && user) {
        // if user have one avatar then call this if
        if (user?.avatar?.public_id) {
          // first delete the old image
          await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: 150,
          });

          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        } else {
          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatars",
            width: 150,
          });

          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        }
      }

      await user?.save();
      // update avatar in the redis
      await redis.set(userId, JSON.stringify(user));

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);

// get all users --- only for admin
export const getAllUsers = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllUsersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);

// update user role --- only for admin
export const updateUserRole = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, role } = req.body;
      updateUserRoleService(res, id, role);
    } catch (error: any) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);

// delete user --- only for admin
export const deleteUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await userModel.findById(id);

      if (!user) {
        return next(new ErrorHandler(404, "User not found"));
      }

      await user.deleteOne({ id });

      // delete user from the redis
      await redis.del(id);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(500, error.message));
    }
  }
);
