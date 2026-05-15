const setupContainer = document.getElementById('setup-container')
const gameContainer = document.getElementById('game-container')
const wordDisplay = document.getElementById('word-display')
const gameMessage = document.getElementById('game-message')
const errorCount = document.getElementById('error-count')
const resetBtn = document.getElementById('reset-btn')
const hintDisplay = document.getElementById('hint-display')
const timerDisplay = document.getElementById('timer')

const URL_API = "https://api-palavras-8ptt.onrender.com"

// ÁUDIOS
const soundStart = document.getElementById('sound-start')
const soundHit = document.getElementById('sound-hit')
const soundWrong = document.getElementById('sound-wrong')
const soundTime = document.getElementById('sound-time')

// TIMER / CONTROLE
let tempo = 50
let timer
let jogoAtivo = true

// =========================
// TIMER
// =========================
function iniciarTimer() {
    timerDisplay.innerText = `Tempo: ${tempo}s`

    timer = setInterval(() => {

        if (!jogoAtivo) return

        tempo--
        timerDisplay.innerText = `Tempo: ${tempo}s`

        // aviso final
        if (tempo === 10) {
            soundTime.play()
        }

        // acabou o tempo
        if (tempo <= 0) {
            clearInterval(timer)
            jogoAtivo = false

            soundWrong.play()
            gameMessage.innerText = "Tempo esgotado! Você perdeu!"
            gameMessage.style.color = "#b71c1c"

            document.body.classList.add("lose")
            resetBtn.classList.remove('hidden')
        }

    }, 1000)
}

// =========================
// INICIAR JOGO
// =========================
async function iniciarJogo(event) {
    if (event.key === "Enter") {

        const nickname = document.getElementById('nickname-input').value

        if (!nickname) {
            alert('Preencha o nickname!')
            return
        }

        // reset estado
        tempo = 50
        jogoAtivo = true

        soundStart.play()

        const response = await fetch(`${URL_API}/iniciar`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname })
        })

        const data = await response.json()

        if (data.erro) {
            alert(data.erro)
            return
        }

        setupContainer.classList.add('hidden')
        gameContainer.classList.remove('hidden')

        document.getElementById('player-display').innerText = data.mensagem

        iniciarTimer()
        buscarPalavra()
    }
}

// =========================
// BUSCAR PALAVRA + DICA
// =========================
async function buscarPalavra() {
    const response = await fetch(`${URL_API}/status`, {
        credentials: 'include'
    })

    const data = await response.json()

    wordDisplay.innerHTML = ''
    hintDisplay.innerText = "Dica: " + data.dica

    for (let i = 0; i < data.qtde_caracteres; i++) {
        const span = document.createElement('span')
        span.className = 'letter-slot'
        span.id = `slot-${i}`
        wordDisplay.appendChild(span)
    }
}

// =========================
// TENTAR LETRA
// =========================
async function tentarLetra(event) {

    if (event.key !== "Enter") return
    if (!jogoAtivo) return

    const input = document.getElementById('letter-input')
    const caractere = input.value
    input.value = ''
    input.focus()

    if (!caractere) {
        alert("Digite uma letra!")
        return
    }

    const response = await fetch(`${URL_API}/tentativa`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caractere })
    })

    const data = await response.json()

    data.posicoes.forEach(pos => {
        document.getElementById(`slot-${pos}`).innerText = caractere
    })

    errorCount.innerText = data.erros_atuais
    gameMessage.innerText = data.mensagem

    if (data.posicoes.length > 0) {
        soundHit.play()
    } else {
        soundWrong.play()
    }

   
    // FINAL DE JOGO
    if (data.status_jogo !== 'Jogando') {

        jogoAtivo = false
        clearInterval(timer)

        resetBtn.classList.remove('hidden')

        if (data.status_jogo === 'Derrota') {
            document.body.classList.add('lose')
            gameMessage.style.color = "#b71c1c"
            gameMessage.innerHTML = `Você perdeu! A palavra era: <strong>${data.palavra.toUpperCase()}</strong>`;
        } else {
            document.body.classList.add('win')
            gameMessage.style.color = "#1b5e20"
        }
    }
}


// =========================
// REINICIAR
// =========================
function reiniciarJogo() {
    location.reload()
}