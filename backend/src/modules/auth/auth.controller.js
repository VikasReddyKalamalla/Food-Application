import authService from './auth.service.js';
import env from '../../config/env.js';
import { sendSuccess } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/v1/auth',
});

export class AuthController {
  /**
   * Register a new user
   */
  register = async (req, res) => {
    const result = await authService.register(req.body);

    res.cookie('refreshToken', result.refreshToken, getCookieOptions());

    return sendSuccess(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Account registered successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken, // Also return in body for mobile/header clients
      },
    });
  };

  /**
   * Authenticate user with credentials
   */
  login = async (req, res) => {
    const result = await authService.login(req.body);

    res.cookie('refreshToken', result.refreshToken, getCookieOptions());

    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Authenticated successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  };

  /**
   * Refresh access token using cookie or body
   */
  refreshToken = async (req, res) => {
    const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const result = await authService.refreshToken(rawRefreshToken);

    res.cookie('refreshToken', result.refreshToken, getCookieOptions());

    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      },
    });
  };

  /**
   * Logout user and invalidate refresh session
   */
  logout = async (req, res) => {
    const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    await authService.logout(rawRefreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      path: '/api/v1/auth',
    });

    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Logged out successfully',
      data: { loggedOut: true },
    });
  };

  /**
   * Retrieve current authenticated user profile
   */
  getCurrentUser = async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id);

    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'User profile retrieved successfully',
      data: { user },
    });
  };

  /**
   * Request password reset link / token
   */
  forgotPassword = async (req, res) => {
    const result = await authService.forgotPassword(req.body.email);

    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: result.resetToken ? { resetToken: result.resetToken } : {},
    });
  };

  /**
   * Reset password using token
   */
  resetPassword = async (req, res) => {
    const result = await authService.resetPassword(req.body.token, req.body.newPassword);

    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: result.message,
      data: {},
    });
  };
}

export const authController = new AuthController();
export default authController;
