const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/112.0',
    'Accept': 'application/json',
    'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
    'Accept-Encoding': 'gzip, deflate',
    'Referer': 'https://cartolaexpress.globo.com/',
    'Content-Type': 'application/json',
    'Origin': 'https://cartolaexpress.globo.com',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'If-None-Match': 'W/"dde-K8L5n5Cu1IkJcmMeG1Emv4i8+N8"',
    'Te': 'trailers'
}

let arrayPlayers = []
let playersDB
let nAtacantes = 0
let nMeias = 0
let taticaAtual = 1
let contadorAtacantes = 0
let contadorMeias = 0
let filtroDb



async function getPlayers() {
    try {
        const idTorneio = getID()
        const res = await api.get(`tournaments/${idTorneio}/players?`, headers)
        const players = res.data.playerChoices
        
        const dbPlayers = setDB(players)
        playersDB = [...dbPlayers]
        adicionaElementos(dbPlayers,filtroDb)
    }
    catch (error) {
        console.log('Erro: ', error)
    }

}

function setDB(players) {
    const dbPlayers = players.map(player => {
        if (player.realPlayer.firstName !== null && player.realPlayer.lastName !== null) {
            return {
                name: `${player.realPlayer.firstName} ${player.realPlayer.lastName}`,
                id: player.realPlayerId,
                price: player.price,
                position: player.position
            };
        } else if (player.realPlayer.firstName !== null) {
            return {
                name: `${player.realPlayer.firstName}`,
                id: player.realPlayerId,
                price: player.price,
                position: player.position
            };
        } else {
            return {
                name: `${player.realPlayer.lastName}`,
                id: player.realPlayerId,
                price: player.price,
                position: player.position
            }
        }
    })

    return dbPlayers
}


function getID() {
    const id = Number(document.getElementById('id-input').value)
    
    return id
}

document.querySelectorAll('input[name="posRadioCheck"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const filtro = document.querySelector('input[name="posRadioCheck"]:checked').value;
        filtroDb = filtro
        getPlayers()

    })
})

function adicionaElementos(players,filtro = "midfielder") {
    let playersFiltrados

    if (filtro === "all") {
        playersFiltrados = [...players]
    } else if (filtro === "defender"){
        playersFiltrados = players.filter(player => player.position === "defender" ||  player.position === "goalkeeper")
    } else {
        playersFiltrados = players.filter(player => player.position === "midfielder" ||  player.position === "forward")
    }
    
    playersFiltrados.sort((a,b) => b.price - a.price)
    
    const tbody = document.getElementById('table-body')
    tbody.innerHTML = ''

    playersFiltrados.forEach(player => {

        
        const tr = document.createElement('tr')
        tr.id = `check-${player.id}`
        const tdID = document.createElement('td')
        tdID.innerHTML = player.id
        const tdName = document.createElement('td')
        tdName.innerHTML = player.name
        const tdPos = document.createElement('td')
        tdPos.innerHTML = translatePosition(player.position)
        const tdPrice = document.createElement('td')
        tdPrice.innerHTML = player.price
        const tdPra = document.createElement('td')
        tdPra.innerHTML = `<input class="form-control form-control-sm form-pra" id="input-${player.id}" type="text" placeholder="PRA" aria-label=".form-control-sm example">`
        const tdBtn = document.createElement('td')
        const btn = document.createElement('button')
        btn.setAttribute('type', 'button')
        btn.setAttribute('onclick', `addArray(playersDB, ${player.id})`)
        btn.classList.add('btn')
        btn.classList.add('btn-primary')
        btn.classList.add('btn-sm')
        btn.classList.add('blue')
        btn.innerText = 'Add'


        tbody.appendChild(tr)
        tr.appendChild(tdID)
        tr.appendChild(tdName)
        tr.appendChild(tdPos)
        tr.appendChild(tdPrice)
        tr.appendChild(tdPra)
        tr.appendChild(tdBtn)
        tdBtn.appendChild(btn)

    })
}
function alteraContagem(id,pos,fator,xAp ) {
    console.log(xAp, "To na função")

    if (fator === "subtrai") {
        if (pos === "ATA") {
            nAtacantes -= xAp
        } else if (pos === "MEI") {
            nMeias -= xAp
        }

    } else if (fator === "soma") {
        if (pos === "ATA") {
            nAtacantes += xAp
        } else if (pos === "MEI") {
            nMeias += xAp
        }
    }

    diminuiAparicao()
}

function addArray(players, id) {
        const player = players.find(player => player.id === id)
        player.xPa = Number(document.getElementById(`input-${id}`).value)
        const eachPlayer = [player.id, player.price, player.xPa,player.name,translatePosition(player.position)]
        const isPlayerInArray = arrayPlayers.some(item => item[0] === player.id)
        const tr = document.getElementById(`check-${player.id}`)
        const tdToRemove = document.getElementById(`icon-${player.id}`)


        if (isPlayerInArray) {
            const indexToRemove = arrayPlayers.findIndex(item => item[0] === player.id);
            arrayPlayers.splice(indexToRemove, 1)
            alteraContagem(player.id,translatePosition(player.position),"soma",player.xPa)
            tdToRemove.innerHTML = ``
            return
        } 

        
        if (tdToRemove) {
            player.xPa = Number(document.getElementById(`input-${id}`).value)
            arrayPlayers.push(eachPlayer)
            alteraContagem(player.id,translatePosition(player.position),"subtrai",player.xPa)
            tdToRemove.innerHTML = `<i class="fa-solid fa-check"></i>`
            tr.appendChild(tdToRemove)
            return
        }

        const tdCheck = document.createElement('td')
        tdCheck.id = `icon-${player.id}`
        player.xPa = Number(document.getElementById(`input-${id}`).value)
        arrayPlayers.push(eachPlayer)
        alteraContagem(player.id,translatePosition(player.position),"subtrai",player.xPa)
        tdCheck.innerHTML = `<i class="fa-solid fa-check"></i>`
        tr.appendChild(tdCheck)
        
}

function downloadArray() {
    arrayPlayers.sort((a,b) => b[2] - a[2])
    const jsonString = JSON.stringify(arrayPlayers, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'arrayPlayers.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

function translatePosition(position) {

    const translatePosition = {
        "forward": "ATA",
        "midfielder": "MEI",
        "defender": "DEF",
        "goalkeeper": "GOL",
    }

    return translatePosition[position] || "Não Definido";
}


function incrementar() {
    contador++
    contaPlayers.value = `Players: ${contador}`
}

function selectedTatica() {
    const selectedValue = taticaSelect.value
    taticaAtual = taticaSelect.value
    atualizaInicial(selectedValue)
}


function translateAta(tatica) {
    const totalAta = {
        1: 3,
        2: 2,
        3: 3,
        4: 2,
        5: 1,
    }

    return totalAta[tatica]
}

function translateMei(tatica) {
    const totalMei = {
        1: 3,
        2: 4,
        3: 2,
        4: 3,
        5: 4,
    }

    return totalMei[tatica]
}


function atualizaInicial(tatica = 1) {
    textTotalOfensivo.textContent = Math.floor(150 / totalDefesas.value)
    textTotalDefensivo.textContent = totalDefesas.value
    nAtacantes = translateAta(tatica) * Math.floor(150 / totalDefesas.value)
    nMeias = translateMei(tatica)  * Math.floor(150 / totalDefesas.value)
    contaAta.value = `ATA: ${nAtacantes}`
    contaMei.value = `MEI: ${nMeias}`

}

function diminuiAparicao() {
    contaAta.value = `ATA: ${nAtacantes}`
    contaMei.value = `MEI: ${nMeias}`
}

