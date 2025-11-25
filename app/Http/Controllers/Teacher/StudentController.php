<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index()
    {
        // List all students
        $students = User::where('role', 'student')
            ->latest()
            ->paginate(20);

        return Inertia::render('Teacher/Students/Index', [
            'students' => $students,
        ]);
    }

    public function create()
    {
        return Inertia::render('Teacher/Students/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:50|unique:users',
            'full_name' => 'required|string|max:100',
            'password' => 'required|min:6',
        ]);

        $student = User::create([
            'username' => $request->username,
            'name' => $request->full_name,
            'full_name' => $request->full_name,
            'email' => null, // Siswa tidak perlu email
            'password' => Hash::make($request->password),
            'role' => 'student',
            'is_active' => true,
        ]);

        return redirect()->route('teacher.students.index')
            ->with('success', 'Akun siswa berhasil dibuat! Username: ' . $student->username);
    }

    public function edit(User $student)
    {
        // Pastikan hanya student yang bisa diedit
        if (!$student->isStudent()) {
            abort(403);
        }

        return Inertia::render('Teacher/Students/Edit', [
            'student' => $student,
        ]);
    }

    public function update(Request $request, User $student)
    {
        if (!$student->isStudent()) {
            abort(403);
        }

        $request->validate([
            'username' => 'required|string|max:50|unique:users,username,' . $student->id,
            'full_name' => 'required|string|max:100',
            'password' => 'nullable|min:6',
            'is_active' => 'boolean',
        ]);

        $data = [
            'username' => $request->username,
            'name' => $request->full_name,
            'full_name' => $request->full_name,
            'is_active' => $request->is_active ?? true,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $student->update($data);

        return redirect()->route('teacher.students.index')
            ->with('success', 'Data siswa berhasil diupdate!');
    }

    public function destroy(User $student)
    {
        if (!$student->isStudent()) {
            abort(403);
        }

        $student->delete();

        return redirect()->route('teacher.students.index')
            ->with('success', 'Akun siswa berhasil dihapus!');
    }
}
