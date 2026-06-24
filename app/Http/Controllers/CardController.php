<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\ListModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function store(Request $request, ListModel $list): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:500',
            'description' => 'nullable|string',
        ]);
        $validated['list_id'] = $list->id;
        $validated['position'] = $list->cards()->count();
        $card = Card::create($validated);
        return response()->json($card, 201);
    }

    public function update(Request $request, ListModel $list, Card $card): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:500',
            'description' => 'nullable|string',
        ]);
        $card->update($validated);
        return response()->json($card);
    }

    public function destroy(ListModel $list, Card $card): JsonResponse
    {
        $card->delete();
        return response()->json(null, 204);
    }

    public function move(Request $request, ListModel $list, Card $card): JsonResponse
    {
        $validated = $request->validate([
            'new_list_id' => 'required|exists:lists,id',
        ]);

        $newList = ListModel::findOrFail($validated['new_list_id']);
        $card->update(['list_id' => $newList->id]);

        return response()->json($card->fresh());
    }
}
