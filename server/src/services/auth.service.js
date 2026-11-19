import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const publicUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  plan: user.plan,
});

export async function registerUser(input) {
  const existingUser = await User.exists({ email: input.email });
  if (existingUser) {
    throw new ApiError(409, "EMAIL_EXISTS", "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });
    return publicUser(user);
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "EMAIL_EXISTS", "An account with this email already exists");
    }
    throw error;
  }
}

export async function authenticateUser(input) {
  const user = await User.findOne({ email: input.email }).select("+passwordHash");
  const passwordMatches = user
    ? await bcrypt.compare(input.password, user.passwordHash)
    : false;

  if (!user || !passwordMatches) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }

  return { user: publicUser(user), userId: String(user._id) };
}

export async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "User account is unavailable");
  }
  return publicUser(user);
}
