<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitQuizAnswerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'student';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'question_id' => 'required|exists:quiz_questions,id',
            'selected_option_id' => 'nullable|exists:quiz_question_options,id',
            'answer_text' => 'nullable|string|max:2000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'question_id.required' => 'Question ID is required.',
            'question_id.exists' => 'Invalid question.',
            'selected_option_id.exists' => 'Invalid option selected.',
        ];
    }
}
