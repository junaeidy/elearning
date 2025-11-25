import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import FunButton from '@/Components/FunButton';
import { motion } from 'framer-motion';
import { PhotoIcon, CalendarIcon, KeyIcon } from '@heroicons/react/24/outline';

export default function Create({ generatedCode }) {
    const [imagePreview, setImagePreview] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        subject: '',
        lesson_code: generatedCode || '',
        cover_image: null,
        start_date: '',
        end_date: '',
        status: 'draft',
        max_students: 30,
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('cover_image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const generateNewCode = async () => {
        try {
            const response = await fetch(route('teacher.lessons.generate-code'));
            const result = await response.json();
            setData('lesson_code', result.code);
        } catch (error) {
            console.error('Failed to generate code:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('teacher.lessons.store'), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Create New Lesson ✨
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Fill in the details to create an awesome lesson for your students
                    </p>
                </div>
            }
        >
            <Head title="Create Lesson" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Main Information Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            📝 Basic Information
                        </h3>

                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lesson Title *
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g., Introduction to Mathematics"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe what students will learn in this lesson..."
                                    rows="5"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                        errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    required
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            {/* Subject and Lesson Code */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        placeholder="e.g., Mathematics, Science"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                            errors.subject ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {errors.subject && (
                                        <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lesson Code *
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={data.lesson_code}
                                            onChange={(e) => setData('lesson_code', e.target.value.toUpperCase())}
                                            placeholder="AUTO-GENERATED"
                                            className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                                errors.lesson_code ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={generateNewCode}
                                            className="px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                                            title="Generate New Code"
                                        >
                                            <KeyIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {errors.lesson_code && (
                                        <p className="mt-1 text-sm text-red-600">{errors.lesson_code}</p>
                                    )}
                                </div>
                            </div>

                            {/* Cover Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cover Image
                                </label>
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 transition-colors">
                                            <input
                                                type="file"
                                                onChange={handleImageChange}
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="text-center">
                                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-600">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG, GIF up to 2MB
                                                </p>
                                            </div>
                                        </div>
                                        {errors.cover_image && (
                                            <p className="mt-1 text-sm text-red-600">{errors.cover_image}</p>
                                        )}
                                    </div>
                                    {imagePreview && (
                                        <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-purple-200">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            📅 Schedule & Settings
                        </h3>

                        <div className="space-y-6">
                            {/* Date Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                            errors.start_date ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {errors.start_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                            errors.end_date ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {errors.end_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                                    )}
                                </div>
                            </div>

                            {/* Status and Max Students */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status *
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                            errors.status ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Students *
                                    </label>
                                    <input
                                        type="number"
                                        value={data.max_students}
                                        onChange={(e) => setData('max_students', e.target.value)}
                                        min="1"
                                        max="100"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                            errors.max_students ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {errors.max_students && (
                                        <p className="mt-1 text-sm text-red-600">{errors.max_students}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-end">
                        <Link href={route('teacher.lessons.index')}>
                            <FunButton type="button" variant="secondary" size="lg">
                                Cancel
                            </FunButton>
                        </Link>
                        <FunButton
                            type="submit"
                            variant="primary"
                            size="lg"
                            icon="✨"
                            disabled={processing}
                        >
                            {processing ? 'Creating...' : 'Create Lesson'}
                        </FunButton>
                    </div>
                </form>
            </motion.div>
        </AuthenticatedLayout>
    );
}
