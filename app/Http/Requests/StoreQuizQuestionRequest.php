<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreQuizQuestionRequest extends FormRequest
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
            'question_text' => 'required|string|max:1000',
            'question_type' => ['required', Rule::in(['multiple_choice', 'true_false', 'essay'])],
            'points' => 'required|integer|min:1|max:100',
            'options' => 'required_if:question_type,multiple_choice,true_false|array|min:2',
            'options.*.option_text' => 'required|string|max:500',
            'options.*.is_correct' => 'required|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'question_text.required' => 'Teks pertanyaan wajib diisi.',
            'question_type.required' => 'Tipe pertanyaan wajib dipilih.',
            'question_type.in' => 'Tipe pertanyaan tidak valid.',
            'points.required' => 'Poin wajib diisi.',
            'points.min' => 'Poin minimal adalah 1.',
            'points.max' => 'Poin maksimal adalah 100.',
            'options.required_if' => 'Pilihan jawaban wajib diisi untuk pertanyaan pilihan ganda atau benar/salah.',
            'options.min' => 'Minimal harus ada 2 pilihan jawaban.',
            'options.*.option_text.required' => 'Semua pilihan jawaban harus diisi.',
            'options.*.is_correct.required' => 'Setiap pilihan harus ditandai benar atau salah.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if (in_array($this->question_type, ['multiple_choice', 'true_false'])) {
                $options = $this->input('options', []);
                $hasCorrect = collect($options)->contains('is_correct', true);
                
                if (!$hasCorrect) {
                    $validator->errors()->add(
                        'options',
                        'Minimal satu pilihan jawaban harus ditandai sebagai jawaban yang benar.'
                    );
                }
            }
        });
    }
}
