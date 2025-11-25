<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuizRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'teacher';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'duration_minutes' => 'required|integer|min:1|max:300',
            'passing_score' => 'required|integer|min:0|max:100',
            'max_attempts' => 'required|integer|min:1|max:10',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after:start_time',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Quiz title is required.',
            'duration_minutes.required' => 'Quiz duration is required.',
            'duration_minutes.min' => 'Quiz duration must be at least 1 minute.',
            'duration_minutes.max' => 'Quiz duration cannot exceed 300 minutes.',
            'passing_score.min' => 'Passing score must be at least 0.',
            'passing_score.max' => 'Passing score cannot exceed 100.',
            'max_attempts.min' => 'At least 1 attempt must be allowed.',
            'max_attempts.max' => 'Maximum 10 attempts allowed.',
            'end_time.after' => 'End time must be after start time.',
        ];
    }
}
