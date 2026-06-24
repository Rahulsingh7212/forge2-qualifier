<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\ListModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListController extends Controller
{
    public function store(Request $request, Board $board): JsonResponse
    {
        $validated = $request->validate(['name' => 'required|string|max:255']);
        $validated['board_id'] = $board->id;
        $validated['position'] = $board->lists()->count();
        $list = ListModel::create($validated);
        return response()->json($list, 201);
    }

    public function update(Request $request, Board $board, ListModel $list): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'position' => 'sometimes|integer|min:0',
        ]);
        $list->update($validated);
        return response()->json($list);
    }

    public function destroy(Board $board, ListModel $list): JsonResponse
    {
        $list->delete();
        return response()->json(null, 204);
    }
}
