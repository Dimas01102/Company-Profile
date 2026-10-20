<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

/**
 * Every API endpoint responds with this envelope shape:
 *
 *   { "success": bool, "message": string|null, "data": mixed, "meta": mixed|null }
 *
 * ...or, on failure:
 *
 *   { "success": false, "message": string, "errors": object|null }
 *
 * Keeping one shape across every controller means the frontend's API
 * client can parse every response the same way, regardless of endpoint.
 */
class ApiResponse
{
    public static function success(
        mixed $data = null,
        ?string $message = null,
        int $status = 200,
        mixed $meta = null,
    ): JsonResponse {
        $payload = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        if ($meta !== null) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    public static function created(mixed $data = null, ?string $message = 'Created.'): JsonResponse
    {
        return self::success($data, $message, 201);
    }

    public static function error(
        string $message,
        int $status = 400,
        mixed $errors = null,
    ): JsonResponse {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }
}
