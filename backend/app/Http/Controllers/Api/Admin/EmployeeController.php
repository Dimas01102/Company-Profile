<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\EmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Support\ActivityLogger;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{
    /** GET /api/admin/employees?search=&department=&status=&per_page= */
    public function index(Request $request)
    {
        $query = Employee::query()->ordered();

        if ($search = $request->string('search')->trim()->value()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%")
                    ->orWhere('employee_code', 'like', "%{$search}%");
            });
        }

        if ($department = $request->string('department')->trim()->value()) {
            $query->where('department', $department);
        }

        if ($status = $request->string('status')->trim()->value()) {
            $query->where('status', $status);
        }

        $employees = $query->paginate($request->integer('per_page', 15));

        return ApiResponse::success(
            EmployeeResource::collection($employees),
            meta: [
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
                'total' => $employees->total(),
            ],
        );
    }

    /** POST /api/admin/employees */
    public function store(EmployeeRequest $request)
    {
        $data = $request->safe()->except(['photo', 'remove_photo']);

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store('employees', 'public');
        }

        $data['order'] ??= (int) Employee::max('order') + 1;
        $data['status'] ??= 'Active';

        $employee = Employee::create($data);

        ActivityLogger::log('Create', 'Employees', 'Added an employee', $employee->name);

        return ApiResponse::created(new EmployeeResource($employee), 'Employee added.');
    }

    /** GET /api/admin/employees/{employee} */
    public function show(Employee $employee)
    {
        return ApiResponse::success(new EmployeeResource($employee));
    }

    /** PUT /api/admin/employees/{employee} */
    public function update(EmployeeRequest $request, Employee $employee)
    {
        $data = $request->safe()->except(['photo', 'remove_photo']);

        if ($request->hasFile('photo')) {
            if ($employee->photo_path) {
                Storage::disk('public')->delete($employee->photo_path);
            }
            $data['photo_path'] = $request->file('photo')->store('employees', 'public');
        } elseif ($request->boolean('remove_photo') && $employee->photo_path) {
            Storage::disk('public')->delete($employee->photo_path);
            $data['photo_path'] = null;
        }

        $employee->update($data);

        ActivityLogger::log('Update', 'Employees', 'Updated an employee', $employee->name);

        return ApiResponse::success(new EmployeeResource($employee), 'Employee updated.');
    }

    /** DELETE /api/admin/employees/{employee} */
    public function destroy(Employee $employee)
    {
        if ($employee->photo_path) {
            Storage::disk('public')->delete($employee->photo_path);
        }
        $employee->delete();

        ActivityLogger::log('Delete', 'Employees', 'Deleted an employee', $employee->name);

        return ApiResponse::success(message: 'Employee deleted.');
    }

    /** PATCH /api/admin/employees/{employee}/reorder */
    public function reorder(Request $request, Employee $employee)
    {
        $request->validate(['direction' => 'required|in:up,down']);

        $siblings = Employee::ordered()->get();
        $index = $siblings->search(fn ($e) => $e->id === $employee->id);
        $targetIndex = $request->input('direction') === 'up' ? $index - 1 : $index + 1;

        if ($targetIndex < 0 || $targetIndex >= $siblings->count()) {
            return ApiResponse::success(EmployeeResource::collection($siblings));
        }

        // Swap the two positions, then renumber 1..n so duplicate `order`
        // values (the form accepts any number) cannot make the swap a no-op.
        $ids = $siblings->pluck('id')->all();
        [$ids[$index], $ids[$targetIndex]] = [$ids[$targetIndex], $ids[$index]];

        foreach ($ids as $position => $id) {
            Employee::whereKey($id)->update(['order' => $position + 1]);
        }

        return ApiResponse::success(EmployeeResource::collection(Employee::ordered()->get()));
    }
}
