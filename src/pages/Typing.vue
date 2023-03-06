<script setup lang="ts">
import { chunk, randomSort } from '~/utils'
import json from '~/dict/4000_Essential_English_Words-sentence.json'

const chunks = chunk(randomSort(json.map(item => item.name)), 30)

let level = $ref(0)
let currentIndex = $ref(0)

const realWords = $computed(() => chunks[level])

const currentWord = $computed(() => realWords[currentIndex])

let countdown = $ref(7)

const initialOffset = 133
const nextOffset = 38

const offset = $computed(() => initialOffset - currentIndex * nextOffset)

let red = 0
let blue = 0
let green = 255
let rotationOffset = -90
const colorAddition = 25.5
const rotationAddition = 9

const quarters = $shallowRef<HTMLDivElement[]>([])
let message = $ref('Level-0')

const elInput = $ref<HTMLInputElement>()
let inputValue = $ref('')
const placeholder = $ref('Type the text above to begin...')

let score = $ref(0)
let highscore = $ref(0)

const animation = reactive({
  wheel: true,
  bouncy: false,
})

function setColors() {
  if (green === 255 && red < 255 && blue === 0) {
    red += colorAddition
    rotationOffset += rotationAddition
    for (let i = 1; i < 4; i++)
      quarters[i].style.transform = `rotate(${rotationOffset}deg)`
  }
  else if (green > 0 && red === 255 && blue === 0) {
    green -= colorAddition
    rotationOffset += rotationAddition
    for (let i = 2; i < 4; i++)
      quarters[i].style.transform = `rotate(${rotationOffset}deg)`
  }
  else if (green === 0 && red === 255 && blue < 255) {
    blue += colorAddition
    rotationOffset += rotationAddition
    for (let i = 3; i < 4; i++)
      quarters[i].style.transform = `rotate(${rotationOffset}deg)`
  }
  quarters.forEach((quater) => {
    const color = `rgb(${red}, ${green}, ${blue})`
    quater.style.borderLeftColor = quater.style.borderTopColor = color
  })
}

function changeLevel(newLevel: number) {
  // reset
  inputValue = ''

  animation.wheel = true

  red = blue = 0
  green = 255
  rotationOffset = -90

  level = newLevel
  currentIndex = 0
  message = `Level-${newLevel}`

  quarters.forEach((quater) => {
    const color = `rgb(${red}, ${green}, ${blue})`
    quater.style.borderLeftColor = quater.style.borderTopColor = color
    quater.style.transform = `rotate(${rotationOffset}deg)`
  })
}

function setHighScore() {
  if (score > highscore)
    highscore = score

  score = 0
}

let interval: number | undefined

function handleCountdown() {
  if (countdown > 0) {
    countdown--
    if (countdown === 0) {
      elInput?.blur()
      message = 'Game Over'
      animation.bouncy = false
      setTimeout(() => {
        window.window.clearInterval(interval)
        interval = undefined
        changeLevel(0)
        countdown = 7
        setHighScore()
      }, 1000)
    }
  }
}

function handleOninput() {
  if (!interval)
    interval = window.setInterval(handleCountdown, 1000)

  animation.wheel = false

  animation.bouncy = false

  if (inputValue === currentWord) {
    window.clearInterval(interval)
    interval = window.setInterval(handleCountdown, 1000)

    score += countdown

    countdown = 7 - Math.floor(currentIndex / 10)

    if (blue === 255) {
      changeLevel(level + 1)
    }
    else {
      currentIndex += 1
      inputValue = ''

      animation.bouncy = true

      setColors()
    }
  }
}

function handleToggle() {
  if (interval) {
    window.clearInterval(interval)
    interval = undefined
  }
  else {
    interval = window.setInterval(handleCountdown, 1000)
  }
}

function getLetterColor(letter: string, index: number) {
  if (inputValue.length <= index)
    return 'text-white'
  return inputValue[index] === letter ? 'text-blue' : 'text-red'
}
</script>

<template>
  <div
    class="h-100vh justify-center items-center"
    flex="~"
    bg="from-#1e2530 to-#11151c gradient-to-tr"
    font="mono"
  >
    <div
      flex="~ col"
      m="t-12 r-25"
    >
      <div>
        <div
          font="tracking-1px"
          text="white/60 5"
          animated="slide-in-left duration-1s"
        >
          Countdown
        </div>
        <div
          text="white/80 54px"
          animated="zoom-in duration-1s"
        >
          {{ countdown }}
        </div>
      </div>
      <div
        class="h-325px w-230px relative of-hidden"
        m="t-50px"
        border="l-5 #222a38"
      >
        <div
          class="top-137px absolute size-0"
          border="y-transparent y-13 l-13 l-#222a38"
          animated="fade-in duration-1s"
        />
        <div
          class="w-50"
          m="l-10"
          text="left"
          transition="margin duration-500"
          :style="{ marginTop: `${offset}px` }"
        >
          <ul animated="fade-in-down duration-1s">
            <li
              v-for="item in realWords" :key="item"
              m="b-10px"
              text="white/20 18px"
              transition="color"
              :class="{ active: item === currentWord }"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div
      class="justify-center items-center"
      flex="~ col"
      m="t--25"
    >
      <div
        class="relative justify-center items-center size-350px"
        flex="~"
        bg="#11151c"
        border="rounded-1/2"
        shadow="black/50 [2px,10px,30px]"
      >
        <div
          v-for="index in 4" :key="index" ref="quarters"
          class="top-0 left-0 absolute size-175px"
          bg="#11151c"
          border="rounded-tl-175px t-5 l-5 #00FF00"
          transform="rotate--90 origin-bottom-right"
          transition="all duration-100 ease-out"
          :class="[animation.wheel ? `wheel${index}` : '']"
        />
        <div
          class="absolute size-75"
          border="rounded-1/2 1 black/10"
          shadow="black/10 [0,0,6]"
          :class="{
            bouncy: animation.bouncy,
          }"
        />
        <div
          absolute
          text="10 white/70"
          animated="rotate-in duration-1s"
        >
          <span
            v-for="(letter, index) in [...currentWord]" :key="letter + index"
            :class="getLetterColor(letter, index)"
          >
            {{ letter }}
          </span>
        </div>
      </div>
      <div>
        <div
          m="y-10"
          font="bold tracking-1px"
          text="18px white/80"
          animated="zoom-in duration-1s"
        >
          {{ message }}
        </div>
        <input
          ref="elInput"
          v-model="inputValue"
          class="cursor-pointer outline-none w100"
          p="y14px x12px"
          bg="#222a38 focus:white/85"
          font="bold tracking-0.7px"
          text="black center 14pt"
          border="rounded-30px none"
          shadow="black/50 [2px,10px,30px]"
          transition="colors"
          animated="zoom-in duration-1s"
          type="text"
          :placeholder="placeholder"
          spellcheck="false"
          @focus="placeholder = ''"
          @blur="placeholder = 'Type the text above to begin...'"
          @input="handleOninput"
          @keyup.enter="handleToggle"
        >
      </div>
    </div>

    <div flex="~">
      <div m="x25">
        <div
          font="tracking-1px"
          text="20px white/60"
          animated="zoom-in duration-1s"
        >
          Score
        </div>
        <div
          text="54px white/80"
          animated="zoom-in duration-1s"
        >
          {{ score }}
        </div>
      </div>
      <div>
        <div
          font="tracking-1px"
          text="20px white/80"
          animated="zoom-in duration-1s"
        >
          Your High Score
        </div>
        <div
          text="54px white/80"
          animated="zoom-in duration-1s"
        >
          {{ highscore }}
        </div>
      </div>
    </div>
    <div
      class="right-50px bottom-10px absolute"
      font="bold tracking-1px"
      text="14px white/60"
    >
      Author
      <span text="white line-through">
        Wind
      </span>
    </div>
  </div>
</template>

<style scoped>
@import '~/styles/animation.css';

.active {
  @apply font-bold text-white text-25px text-opacity-70;
}

.wheel1 {
  animation: wheel1 1s linear;
}

.wheel2 {
  animation: wheel2 1s linear;
}

.wheel3 {
  animation: wheel3 1s linear;
}

.wheel4 {
  animation: wheel4 1s linear;
}

.bouncy {
  animation: bouncy 1s linear;
}
</style>
