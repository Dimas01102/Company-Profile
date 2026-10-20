<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\AdminResource;
use App\Models\Admin;
use App\Support\ActivityLogger;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/admin/login
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        $admin = Admin::where('email', $credentials['email'])->first();

        if (! $admin || ! Hash::check($credentials['password'], $admin->password)) {
            // Deliberately generic, never reveal whether the email exists.
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        $token = $admin->createToken(
            name: 'admin-console-'.$request->userAgent(),
            expiresAt: now()->addMinutes((int) config('sanctum.expiration')),
        );

        ActivityLogger::log('Login', 'Authentication', 'Signed in to the admin console', actor: $admin);

        return ApiResponse::success(
            data: [
                'token' => $token->plainTextToken,
                'token_type' => 'Bearer',
                'expires_at' => $token->accessToken->expires_at,
                'admin' => new AdminResource($admin),
            ],
            message: 'Logged in successfully.',
        );
    }

    /**
     * POST /api/admin/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        ActivityLogger::log('Logout', 'Authentication', 'Signed out of the admin console');

        return ApiResponse::success(message: 'Logged out successfully.');
    }

    /**
     * GET /api/admin/me
     */
    public function me(Request $request)
    {
        return ApiResponse::success(new AdminResource($request->user()));
    }

    /**
     * PUT /api/admin/profile
     */
    public function updateProfile(UpdateProfileRequest $request)
    {
        $admin = $request->user();
        $data = $request->safe()->except('photo');

        if ($request->hasFile('photo')) {
            if ($admin->photo_path) {
                Storage::disk('public')->delete($admin->photo_path);
            }
            $data['photo_path'] = $request->file('photo')->store('admins', 'public');
        }

        $admin->update($data);

        return ApiResponse::success(new AdminResource($admin->fresh()), 'Profile updated.');
    }

    /**
     * PUT /api/admin/password
     */
    public function changePassword(ChangePasswordRequest $request)
    {
        $admin = $request->user();

        if (! Hash::check($request->validated('current_password'), $admin->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Your current password is incorrect.'],
            ]);
        }

        $admin->update(['password' => Hash::make($request->validated('password'))]);

        $admin->tokens()->where('id', '!=', $admin->currentAccessToken()->id)->delete();

        return ApiResponse::success(message: 'Password updated. Other sessions were signed out.');
    }
}
