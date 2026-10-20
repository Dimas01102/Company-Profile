<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicEmployeeResource;
use App\Models\Employee;
use App\Support\ApiResponse;

class EmployeeController extends Controller
{
    /** GET /api/employees, only employees marked Active. */
    public function index()
    {
        return ApiResponse::success(
            PublicEmployeeResource::collection(Employee::active()->ordered()->get()),
        );
    }
}
