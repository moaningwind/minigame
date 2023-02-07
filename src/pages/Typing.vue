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
  fade: true,
  bounce: false,
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

let interval: NodeJS.Timer | undefined

function handleCountdown() {
  if (countdown > 0) {
    countdown--
    if (countdown === 0) {
      elInput?.blur()
      message = 'Game Over'
      animation.fade = true
      animation.bounce = false
      setTimeout(() => {
        clearInterval(interval)
        interval = undefined
        changeLevel(0)
        countdown = 7
        setHighScore()
      }, 1000)
    }
  }
}

function handleOninput() {
  animation.wheel = false

  animation.fade = false
  animation.bounce = false

  if (inputValue === currentWord) {
    clearInterval(interval)
    interval = setInterval(handleCountdown, 1000)

    score += countdown

    countdown = 7 - Math.floor(currentIndex / 10)

    if (blue === 255) {
      changeLevel(level + 1)
    }
    else {
      currentIndex += 1
      inputValue = ''

      animation.bounce = true

      setColors()
    }
  }
}

function handleToggle() {
  if (interval) {
    clearInterval(interval)
    interval = undefined
  }
  else {
    interval = setInterval(handleCountdown, 1000)
  }
}

function getLetterColor(letter: string, index: number) {
  if (inputValue.length <= index)
    return 'text-white'
  return inputValue[index] === letter ? 'text-blue' : 'text-red'
}
</script>

<template>
  <div class="wrapper">
    <div flex flex-col mt12 mr25 text-center>
      <div>
        <p class="counthead">
          Countdown
        </p>
        <p class="countdown">
          {{ countdown }}
        </p>
      </div>
      <div class="wordlist">
        <div class="arrow" />
        <div class="scrollingwords" :style="{ marginTop: `${offset}px` }">
          <ul>
            <li v-for="item in realWords" :key="item" :class="{ active: item === currentWord }">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div flex flex-col justify-center items-center mt--25>
      <div class="circular">
        <div
          v-for="index in 4" :key="index" ref="quarters"
          class="quarters" :class="[animation.wheel ? `wheel${index}` : '']"
        />
        <div class="bouncy" :class="{ 'fade-in': animation.fade, 'bounce': animation.bounce }" />
        <p class="word">
          <span
            v-for="(letter, index) in [...currentWord]" :key="letter + index"
            :class="getLetterColor(letter, index)"
          >
            {{ letter }}
          </span>
        </p>
      </div>
      <div>
        <input
          ref="elInput"
          v-model="inputValue"
          class="input"
          type="text"
          :placeholder="placeholder"
          spellcheck="false"
          @focus="placeholder = ''"
          @blur="placeholder = 'Type the text above to begin...'"
          @input="handleOninput"
          @keyup.enter="handleToggle"
        >
      </div>
      <div class="message">
        {{ message }}
      </div>
    </div>

    <div text-center>
      <div flex>
        <div mx-25>
          <p class="scorehead">
            Score
          </p>
          <p class="score">
            {{ score }}
          </p>
        </div>
        <div>
          <p class="highhead">
            Your High Score
          </p>
          <p class="highscore">
            {{ highscore }}
          </p>
        </div>
      </div>
      <div class="footer">
        Author
        <span text="white"><del>Wind</del></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '~/styles/animation.css';

.wrapper {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(35deg, #1e2530, #11151c);
}

.counthead {
  font-family: 'Montserrat', Helvetica, sans-serif;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  letter-spacing: 1px;
  margin-left: -300px;
  opacity: 0;
  animation: slide-right 0.3s ease-in 1.5s forwards, fade-in 0.3s ease-in 1.5s forwards;
}

.countdown {
  font-family: 'Paytone One', Helvetica, sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 54px;
  opacity: 0;
  animation: shrink 0.3s ease-in-out 1.5s forwards, fade-in 0.3s ease-in-out 1.5s forwards;
}

.wordlist {
  position: relative;
  height: 325px;
  width: 230px;
  box-sizing: border-box;
  overflow: hidden;
  border-left: 5px solid transparent;
  margin-top: 50px;
  animation: showup 0.5s ease-out 2.3s forwards;
}

.arrow {
  position: absolute;
  top: 137px;
  width: 0;
  height: 0;
  border-top: 13px solid transparent;
  border-bottom: 13px solid transparent;
  border-left: 13px solid #222a38;
  opacity: 0;
  animation: fade-in 0.5s ease-out 2.3s forwards;
}

.scrollingwords {
  width: 200px;
  text-align: left;
  margin-left: 40px;
  margin-top: 133px;
}

.scrollingwords ul {
  margin-top: 300px;
  opacity: 0;
  animation: slide-top 1s ease-out 1.5s forwards, fade-in 1s ease-out 1.5s forwards;
}

.scrollingwords li {
  font-family: 'Montserrat', Helvetica, sans-serif;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.2);
  font-size: 18px;
  transition: font-size 0.2s linear, color 0.2s linear;
}
.scrollingwords li.active {
  font-size: 25px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.7);
}

.circular {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 350px;
  width: 350px;
  box-sizing: border-box;
  box-shadow: 2px 10px 30px rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  background: #11151c;
}

.quarters {
  position: absolute;
  top: 0;
  left: 0;
  width: 175px;
  height: 175px;
  box-sizing: border-box;
  background: #11151c;
  border-top-left-radius: 175px;
  border-top: 5px solid rgb(0, 255, 0);
  border-left: 5px solid rgb(0, 255, 0);
  transform: rotate(-90deg);
  transform-origin: bottom right;
  transition: all 0.1s ease-out;
}

.wheel1 {
  animation: wheel1 1s linear forwards;
}

.wheel2 {
  animation: wheel2 1s linear forwards;
}

.wheel3 {
  animation: wheel3 1s linear forwards;
}

.wheel4 {
  animation: wheel4 1s linear forwards;
}

.bouncy {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0px 0px 6px rgba(255, 255, 255, 0.1);
  opacity: 0;
}

.fade-in {
  animation: shrink 0.6s ease-in-out 1.2s forwards, fade-in 0.6s ease-in-out 1.2s forwards;
  opacity: 1;
}

.bounce {
  animation: bounce 1s linear;
  opacity: 1;
}

.word {
  font-family: 'Paytone One', Helvetica, sans-serif;
  position: absolute;
  font-size: 40px;
  color: rgba(255, 255, 255, 0.7);
  opacity: 0;
  animation: shrink 0.6s ease-in-out 1.2s forwards, fade-in 0.6s ease-in-out 1.2s forwards;
}

.input {
  font-family: 'Montserrat', Helvetica, sans-serif;
  position: relative;
  width: 400px;
  border-radius: 30px;
  background-color: #222a38;
  margin-top: 70px;
  outline: none;
  box-shadow: 2px 10px 30px rgba(0, 0, 0, 0.5);
  padding: 14px 12px;
  text-align: center;
  color: black;
  font-weight: bold;
  font-size: 14pt;
  transition: background-color 0.1s linear;
  letter-spacing: 0.7px;
  opacity: 0;
  border: none;
  animation: shrink 0.6s ease-in-out 1.2s forwards, fade-in 0.6s ease-in-out 1.2s forwards;
  cursor: pointer;
}

.input:focus {
  background-color: rgba(255, 255, 255, 0.85);
}

.message {
  font-family: 'Montserrat', Helvetica, sans-serif;
  position: absolute;
  font-size: 18px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 1px;
  margin-top: 320px;
  opacity: 0;
  animation: slide-up 0.2s linear 1.5s forwards, fade-in 0.2s linear 1.5s forwards;
}

.scorehead {
  font-family: 'Montserrat', Helvetica, sans-serif;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  letter-spacing: 1px;
  opacity: 0;
  animation: shrink 0.3s ease-in 1.5s forwards, fade-in 0.3s ease-in 1.5s forwards;
}

.score {
  font-family: 'Paytone One', Helvetica, sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 54px;
  opacity: 0;
  animation: shrink 0.3s ease-in-out 1.5s forwards, fade-in 0.3s ease-in-out 1.5s forwards;
}

.highhead {
  font-family: 'Montserrat', Helvetica, sans-serif;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  letter-spacing: 1px;
  opacity: 0;
  animation: shrink 0.3s ease-in 1.5s forwards, fade-in 0.3s ease-in 1.5s forwards;
  transition: color 0.2s linear;
}

.highscore {
  font-family: 'Paytone One', Helvetica, sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 54px;
  opacity: 0;
  animation: shrink 0.3s ease-in-out 1.5s forwards, fade-in 0.3s ease-in-out 1.5s forwards;
  transition: color 0.2s linear;
}

.footer {
  font-family: 'Montserrat', Arial, Helvetica, sans-serif;
  position: absolute;
  bottom: 10px;
  right: 50px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: bold;
  letter-spacing: 1px;
}
</style>
