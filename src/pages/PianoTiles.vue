<script setup lang="ts" generic="T extends any, O extends any">
import { GamePlay } from '~/composables/pianoTiles'

defineOptions({
  name: 'PianoTilesPage',
})

const play = new GamePlay(5, 4, 16)

function newGame(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      play.reset(4, 4, 400)
      break
    case 'medium':
      play.reset(4, 4, 200)
      break
    case 'hard':
      play.reset(4, 4, 100)
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

  <div ma h100 border="2 solid gray" overflow="hidden">
    <div relative :style="{ top: `${play.state.value.top}px` }">
      <div
        v-for="row, y in play.board" :key="y"
        flex="~"
        items-center justify-center
      >
        <div
          v-for="block, x in row"
          :key="x"
          w20 h25
          border="1 solid gray"
          :class="block.isBlack ? 'bg-black' : 'bg-white'"
          @click="play.onClick(block)"
        >
          <!-- {{ block.x }},{{ block.y }} -->
        </div>
      </div>
    </div>
  </div>
</template>
