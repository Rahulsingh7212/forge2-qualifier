<?php

namespace App\Http\Controllers;

use App\Models\Board;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Board::with(['lists.cards'])->get());
    }

    public function show(Board $board): JsonResponse
    {
        return response()->json($board->load(['lists.cards']));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate(['name' => 'required|string|max:255']);
        $board = Board::create($validated);
        return response()->json($board, 201);
    }

    public function update(Request $request, Board $board): JsonResponse
    {
        $validated = $request->validate(['name' => 'required|string|max:255']);
        $board->update($validated);
        return response()->json($board);
    }

    public function destroy(Board $board): JsonResponse
    {
        $board->delete();
        return response()->json(null, 204);
    }
}
