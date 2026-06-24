<?php

namespace Database\Seeders;

use App\Models\Board;
use App\Models\Card;
use App\Models\ListModel;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $board = Board::create(['name' => 'Project Board']);

        $todo = ListModel::create(['board_id' => $board->id, 'name' => 'To Do', 'position' => 0]);
        $doing = ListModel::create(['board_id' => $board->id, 'name' => 'Doing', 'position' => 1]);
        $done = ListModel::create(['board_id' => $board->id, 'name' => 'Done', 'position' => 2]);

        Card::create(['list_id' => $todo->id, 'title' => 'Set up project', 'description' => 'Initial scaffolding', 'position' => 0]);
        Card::create(['list_id' => $todo->id, 'title' => 'Write tests', 'position' => 1]);
        Card::create(['list_id' => $doing->id, 'title' => 'Build API', 'position' => 0]);
        Card::create(['list_id' => $done->id, 'title' => 'Design schema', 'position' => 0]);
    }
}
