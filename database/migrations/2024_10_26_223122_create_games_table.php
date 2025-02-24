<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGamesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable('games')) {
            Schema::create('games', function (Blueprint $table) {
                $table->id();
                $table->bigInteger('player1_id')->notNull();
                $table->bigInteger('player2_id')->notNull();
                $table->string('status')->check("status in ('ongoing', 'checkmate', 'draw', 'resigned', 'timeout')")->default('ongoing');
                $table->string('winner_id')->nullable();
                $table->bigInteger('turn')->notNull();
                $table->integer('player1_time')->default(600);
                $table->integer('player2_time')->default(600);
                $table->integer('game_time')->notNull();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('games');
    }
}
