<script setup lang="ts" generic="T extends any, O extends any">
import { GamePlay } from '~/composables/snake'

defineOptions({
  name: 'SnakePage',
})

const play = new GamePlay(21, 21, 200)

function newGame(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      play.reset(21, 21, 400)
      break
    case 'medium':
      play.reset(21, 21, 200)
      break
    case 'hard':
      play.reset(21, 21, 100)
      break
  }
}
</script>

<template>
  <div flex="~ gap1" py5 items-center justify-center>
    <button btn @click="play.reset()">
      New Game
    </button>
    <button btn @click="newGame('easy')">
      Easy
    </button>
    <button btn @click="newGame('medium')">
      Medium
    </button>
    <button btn @click="newGame('hard')">
      Hard
    </button>
  </div>

  <table ma border="collapse" bg="#74afe0">
    <tr
      v-for="row, y in play.board"
      :key="y"
    >
      <td
        v-for="block, x in row"
        :key="x"
        w6 h6
        border
        :class="block.status"
      >
      <!-- {{ block.x }},{{ block.y }} -->
      </td>
    </tr>
  </table>
</template>

<style scoped>
.snakehead {
  background-color: orangered;
}
.snakebody {
  background-color: #ffcc00;
}
.food {
  background-color: orangered;
}
</style>
