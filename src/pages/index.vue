<script setup lang="ts" generic="T extends any, O extends any">
import { GamePlay } from '~/composables/gobang'
defineOptions({
  name: 'IndexPage',
})

const play = new GamePlay()
</script>

<template>
  <div>
    <div flex="~ gap1" justify-center p4>
      <button btn @click="play.reset()">
        New Game
      </button>
      <button btn @click="play.reset(false)">
        Computer Down First
      </button>
    </div>

    <div border class="chessboard">
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
          :computer-last-chess="play.state.value.computerLastChess"
          @click="play.onClick(block)"
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
