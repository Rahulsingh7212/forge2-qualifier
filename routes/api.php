<?php

use App\Http\Controllers\BoardController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\ListController;
use Illuminate\Support\Facades\Route;

Route::apiResource('boards', BoardController::class);
Route::apiResource('boards.lists', ListController::class)->only(['store', 'update', 'destroy']);
Route::apiResource('lists.cards', CardController::class)->only(['store', 'update', 'destroy']);
Route::post('lists/{list}/cards/{card}/move', [CardController::class, 'move']);
