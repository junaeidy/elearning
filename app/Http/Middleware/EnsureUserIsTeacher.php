<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsTeacher
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isTeacher()) {
            abort(403, 'Akses ditolak. Hanya untuk guru.');
        }

        return $next($request);
    }
}
