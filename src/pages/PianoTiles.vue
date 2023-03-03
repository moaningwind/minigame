<script setup lang="ts" generic="T extends any, O extends any">
import { GamePlay } from '~/composables/pianoTiles'

defineOptions({
  name: 'PianoTilesPage',
})

const play = new GamePlay()
</script>

<template>
  <div flex="~ gap1" py5 items-center justify-center>
    <button btn @click="play.reset()">
      New Game
    </button>
  </div>

  <div w81 h100 ma border="gray 2" overflow="hidden">
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
          border="gray 1"
          :class="block.isBlack ? 'bg-black' : 'bg-white'"
          @click="play.onClick(block)"
        >
          <!-- {{ block.x }},{{ block.y }} -->
        </div>
      </div>
    </div>
  </div>
</template>
