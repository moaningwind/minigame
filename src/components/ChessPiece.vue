<script setup lang="ts">
import { BLACK_CHESS, EMPTY_CHESS } from '~/composables/gobang'
import type { PieceState } from '~/types'

const { block } = defineProps<{ block: PieceState }>()

// TODO Defining eslint with const throw error
let hoverClass = $ref('')

const isEmpty = $computed(() => block.status === EMPTY_CHESS)

function getPieceClass(block: PieceState) {
  if (isEmpty)
    return `${hoverClass}`

  return `${hoverClass} ${block.status === BLACK_CHESS ? 'black' : 'white'}${block.isMark ? '-mark' : ''}`
}

function handleEnter(block: PieceState) {
  if (isEmpty) {
    const { x, y } = block
    if (x === 0 && y === 0)
      hoverClass = 'hover-up-left'
    else if (x === 0 && y === 14)
      hoverClass = 'hover-down-left'
    else if (x === 14 && y === 0)
      hoverClass = 'hover-up-right'
    else if (x === 14 && y === 14)
      hoverClass = 'hover-down-right'
    else if (x === 0)
      hoverClass = 'hover-left'
    else if (x === 14)
      hoverClass = 'hover-right'
    else if (y === 0)
      hoverClass = 'hover-up'
    else if (y === 14)
      hoverClass = 'hover-down'
    else hoverClass = 'hover'
  }
}

function handleLeave(block: PieceState) {
  if (isEmpty)
    hoverClass = ''
}

watch(() => isEmpty, () => {
  if (!isEmpty)
    hoverClass = ''
})
</script>

<template>
  <div
    w-9
    h-9
    cursor-pointer
    :class="getPieceClass(block)"
    @mouseenter="handleEnter(block)"
    @mouseleave="handleLeave(block)"
  />
</template>

<style scoped>
.black {
  background: url(../images/black.png) no-repeat 4px 4px;
}
.white {
  background: url(../images/white.png) no-repeat 4px 4px;
}
.hover {
  background: url(../images/hover.png) no-repeat 1px 1px;
}
.hover-up {
  background: url(../images/hover_up.png) no-repeat 1px 1px;
}
.hover-down {
  background: url(../images/hover_down.png) no-repeat 1px 1px;
}
.hover-up-left {
  background: url(../images/hover_up_left.png) no-repeat 1px 1px;
}
.hover-up-right {
  background: url(../images/hover_up_right.png) no-repeat 1px 1px;
}
.hover-left {
  background: url(../images/hover_left.png) no-repeat 1px 1px;
}
.hover-right {
  background: url(../images/hover_right.png) no-repeat 1px 1px;
}
.hover-down-left {
  background: url(../images/hover_down_left.png) no-repeat 1px 1px;
}
.hover-down-right {
  background: url(../images/hover_down_right.png) no-repeat 1px 1px;
}
.black-mark {
  background: url(../images/black_last.png) no-repeat 4px 4px;
}
.white-mark {
  background: url(../images/white_last.png) no-repeat 4px 4px;
}
</style>
