<script setup lang="ts" generic="T extends any, O extends any">
import { GamePlay } from '~/composables/gobang'

defineOptions({
  name: 'IndexPage',
})

const play = new GamePlay()
</script>

<template>
  <div>
    <div flex="~ gap1" py5 items-center justify-center>
      <button btn @click="play.reset()">
        Player First
      </button>
      <button btn @click="play.reset(false)">
        Computer First
      </button>
    </div>

    <div flex="~ gap1" py5 items-center justify-center>
      <button btn @click="play.reset(undefined, false)">
        New Game
      </button>
    </div>

    <div border py5 class="chessboard">
      <div
        v-for="row, y in play.board"
        :key="y"
        flex="~"
        items-center justify-center
      >
        <ChessPiece
          v-for="block, x in row"
          :key="x"
          :block="block"
          @click="play.state.value.manMachine ? play.playerTurn(block) : play.onClick(block)"
        />
      </div>
    </div>

    <Confetti :passed="play.state.value.status === 'won'" />
  </div>
</template>

<style scoped>
.chessboard {
  background: url(../images/chessboard.png) no-repeat center;
}
</style>
