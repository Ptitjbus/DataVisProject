import story from "../assets/data/story.json" assert { type: 'json' }

let landingPage = document.getElementById("landingPage")
let introPage = document.getElementById("introPage")
let viewerPage = document.getElementById("viewerPage")
let sourcePage = document.getElementById("sourcePage")
let launchingPage = document.getElementById("launchingPage")

let landingBtn = document.querySelector(".landingBtn")
let backToLanding = document.getElementById("backToLanding")
let sourcesAndCredits = document.getElementById("sourcesAndCredits")
let introTextContainer = document.getElementById("introText")
let introContinueBtn = document.getElementById("introContinueBtn")
let helperContainer = document.getElementById("helperContainer")
let helperContainerCharacter = document.getElementById("helperContainerCharacter")
var duration = 0
let reloaded = false

landingBtn.addEventListener("click",(e)=> {
    e.preventDefault()
    goTo(landingPage,introPage)
    intro()
})

backToLanding.addEventListener("click",(e)=> {
    e.preventDefault()
    goTo(sourcePage,landingPage)
})

sourcesAndCredits.addEventListener("click",(e)=> {
    e.preventDefault()
    goTo(landingPage,sourcePage)
})

let audio = new Audio('../assets/musics/ambianceMin.mp3');
audio.volume = 0.3;
audio.loop = true;

document.querySelector(".soundButton").addEventListener("click", (e)=>{
    e.preventDefault()
    let mutedSvg =document.getElementById("muted")
    mutedSvg.classList.toggle("d-none")
    document.getElementById("unmuted").classList.toggle("d-none")
    if(!mutedSvg.classList.contains("d-none")){
        audio.pause()
    }else{
        audio.play()
    }
})


/**
 * 
 * @param {*} from 
 * @param {*} to  
 */
async function goTo(from,to){
    from.classList.toggle('disappear', true)
    to.classList.toggle('disappear', false)
}


async function intro(){
    document.addEventListener("keydown",function(e){
        if(e.key === "e" || e.code === "KeyE"){
            goTo(introPage, viewerPage)
            viewer()
        }
    })
    for(let i = 1; i<5; i++){
        introTextContainer.innerText = ""
        introContinueBtn.innerText = ""
        await displayText(i, introTextContainer)
        introContinueBtn.innerText = story.find(x => x.id === i).btnInner
        introContinueBtn.classList.toggle('disappear', false)      
        await waitingKeypress()
        introContinueBtn.classList.toggle('disappear', true)      
    }
    goTo(introPage, viewerPage)
    viewer()
}

/**
 * 
 * @param {number} step 
 */
async function displayText(step, container) {

    let p = story.find(x => x.id === step).text
    let array = p.split("");
    let textDone = false

    document.addEventListener("keydown", (e) => {
        if(e.key === " " || e.code === "Space"){    
            container.innerHTML = p      
            textDone = true
        }                       
    })

    while(array.length > 0){
        if(!textDone){
            container.innerHTML += array.shift();
            await sleep(duration)
        }else{
            break;
        }
    }
    array = []
}

/**
 * 
 * @param {number} ms 
 * @returns 
 */
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function waitingKeypress() {
    return new Promise((resolve) => {
      document.addEventListener('keydown', onKeyHandler);
      function onKeyHandler(e) {
        if (e.key === "Enter") {
          document.removeEventListener('keydown', onKeyHandler);
          resolve();
        }
      }
    });
  }


async function viewer(){    
    await sleep(1000)
    helperContainer.classList.toggle('disappear', false) 
    helperContainerCharacter.classList.toggle('disappear', false) 
    await displayHelper(5, "right")
    let timoutFunc = setTimeout(function(){
    document.getElementById("bottomBar").style.height = 15 + "vh"
    document.getElementById("beginQuizz").classList.remove("d-none")
    },15000)
    let beginQuizzBtn = document.getElementById("beginQuizz")
    beginQuizzBtn.addEventListener("click", function(e){
        e.preventDefault()
        document.getElementById("quizzIntro").classList.add("d-none")
        document.getElementById("quizz").classList.remove("d-none", "disappear")
        quizz()
    })    

}

async function quizz(){
    console.log("quizz")
    let questionText = document.querySelector(".questionText")
    let awnsersContainer = document.querySelector(".awnsersContainer")
    let pageInfo = document.querySelector(".pageInfo")

    fetch('../assets/data/quizz.json')
    .then((response) => response.json())
    .then(async (json) => {
        for(let question of json){
            awnsersContainer.innerHTML = ""
            showDataTab(question.id)
            questionText.innerText = question.text
            pageInfo.innerText = `${question.id} sur ${json.length}`

            let counter = 0
            for(let answer of question.answers){
                let input = document.createElement("input")
                let label = document.createElement("label")
                input.setAttribute("type","radio")
                input.setAttribute("name",`radioAwnser${question.id}`)
                input.setAttribute("id",`radioAwnser${counter}`)
                input.setAttribute("data-answerId",counter)
                input.classList.add("inputRadio","d-none")
                label.setAttribute("for",`radioAwnser${counter}`)
                label.classList.add("button","answersButton")
                label.innerText = answer
                awnsersContainer.appendChild(input)
                awnsersContainer.appendChild(label)
                counter++

                label.addEventListener("click", async (event) => {
                        for(let label of document.querySelectorAll(".answersButton")){
                            if(label.classList.contains("activeBtn")){
                                label.classList.remove("activeBtn")
                            }
                        }
                        label.classList.add("activeBtn")
                })
            }
            await waitingGoodAnwser(question)
        }
        
    })
}

function waitingGoodAnwser(question) {
    console.log(question)
    if(question.id === 4){
        document.getElementById("nextBtn").value = "LANCEMENT"
    }
    return new Promise((resolve) => {
    document.getElementById("nextBtn").addEventListener("click", onKeyHandler)
            console.log("passe")

      function onKeyHandler(e) {
        e.preventDefault()
        if(question.id === 4){
            launching()
        }
        let isGood = false
        for(let input of document.getElementsByName(`radioAwnser${question.id}`)){
            if(input.checked){
                isGood = parseInt(input.dataset.answerid) === question.goodAnwserId
            }
        }
        if (isGood) {
            console.log("juste")
            document.getElementById("nextBtn").removeEventListener('click', onKeyHandler);
            resolve();
        }else{
            displayHelper(7,"left")
            document.getElementById("littleCharacter").style.opacity = 0
            console.log("faux")
        }
      }
    });
}

function launching(){
    goTo(viewerPage,launchingPage)
    let endAnimation = document.getElementById("endAnimation")
    endAnimation.play()
    let playAgain = setTimeout(function(){
        let reloadExperience = document.getElementById("reloadExperience")
        reloadExperience.classList.remove("d-none")
        reloadExperience.addEventListener("click",(e)=>{
            e.preventDefault()        
            location.reload()
        })
        
    },10000)
}

// async function initViewer(){
//     reloaded=true            
//     console.clear()
//     showDataTab(0)
//     document.getElementById("nextBtn").value = "Suivant"
//     document.getElementById("quizzIntro").classList.remove("d-none")
//     document.getElementById("quizz").classList.add("d-none", "disappear")
//     goTo(launchingPage,viewerPage)
//     viewer()

// }


async function showDataTab(question){
    let activeTab = document.querySelector(".activeTab")
    let tabToShow = document.getElementById(`dataTab${question}`)
    if(question > 2){
        let player2 = document.getElementById(`animContainer${question}`);
        player2.load(`../assets/animations/anim${question}.json`);
    }
    activeTab.classList.remove("activeTab")
    tabToShow.classList.add("activeTab")
}


async function displayHelper(textId, side){
    document.activeElement.blur()
    let helperPopup = document.getElementById("helperPopupId")
    let helperText = document.getElementById("helperText")
    let closeBtn = document.getElementById("closeBtnId")
    let helperContainerAbsolute = document.getElementById("helperContainerCharacter")

    if(side === "right"){
        helperPopup.classList.add("v-inversed")
        helperText.classList.remove("helprText")
        helperText.classList.add("helprTextInverted")
        closeBtn.classList.remove("closeBtn")
        closeBtn.classList.add("closeBtnInversed")
        helperContainerAbsolute.classList.add("r-0")
    }else{
        helperPopup.classList.remove("v-inversed")
        helperText.classList.add("helprText")
        helperText.classList.remove("helprTextInverted")
        closeBtn.classList.add("closeBtn")
        closeBtn.classList.remove("closeBtnInversed")
        helperContainerAbsolute.classList.remove("r-0")
    }
    helperText.innerHTML = ""

    document.getElementById("closeBtnId").addEventListener("click", (e)=>{
        e.preventDefault()
        helperContainer.classList.toggle('disappear', true) 
        helperContainerCharacter.classList.toggle('disappear', true)
        document.getElementById("littleCharacter").style.opacity = 1
        helperText.innerHTML = "" 
    })
    helperContainer.classList.toggle('disappear', false) 
    helperContainerCharacter.classList.toggle('disappear', false) 
    await displayText(textId,helperText)
    return 1
}