console.log("Let's Start Scripting")
let currentSong = new Audio()
let songs;
let currFolder;


function formateTime(seconds) {
    // Check if the input is a valid number and non-negative
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formatedMinutes = String(minutes).padStart(2, '0');
    const formatedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formatedMinutes}:${formatedSeconds}`
}


const playMusic = (event, pause = false) => {
    currentSong.src = `http://192.168.50.192:3000/${currFolder}/` + event
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = event
    document.querySelector(".songTimer").innerHTML = "00:00 / 00:00"
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://192.168.50.192:3000/${folder}/`)
    let responce = await a.text()
    let div = document.createElement("div");
    div.innerHTML = responce
    let as = div.getElementsByTagName("a")
    songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i]
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //add songs to library
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        // songUL.innerHTML = songUL.innerHTML + `<li>${song.replaceAll("%20" ," ").replaceAll("(PagalWorld.com.sb).mp3" , " ")}</li>`;
        songUL.innerHTML = songUL.innerHTML + `
        <li>
            <div class="img-Songname">
                <img src="img/music.svg" alt="">
                <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                </div>
            </div>
            <div class="playMusic">
                <img src="img/play.svg" alt="">
            </div>
        </li>
        `;
    }

    //attach an eventlistner to each song 
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener('click', () => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML.trim());
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs

}

async function displayAlbum() {
    console.log("Displaying Albums")
    let a = await fetch(`http://192.168.50.192:3000/song/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/song/")) {
            let folder = e.href.split("/").slice(-2)[0]
            // get the meta data of the folder
            let a = await fetch(`http://192.168.50.192:3000/song/${folder}/info.json`)
            let response = await a.json()
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card p-1 round">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40"
                    fill="none">
                    <!-- Green Circle with larger radius -->
                    <circle cx="12" cy="12" r="12" fill="#00ff00" />
                    <!-- Play Button -->
                    <path d="M8 5v14l11-7L8 5z" fill="black" />
                </svg>
            </div>
            <img src="/song/${folder}/cover.jpg" alt="Artist">
            <h3>${response.title}</h3>
            <p>${response.description}</p>
        </div>`
        }
    }
    // load the playlist when ever a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            let song = await getSongs(`song/${item.currentTarget.dataset.folder}`);
            
            playMusic(song[0])
        })
    })
}


async function main() {
    //get the songs
    await getSongs("song/ncs");
    playMusic(songs[0], true);

    // Display Albums
    displayAlbum()


    //add event listner to play , next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })



    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTimer").innerHTML = `${formateTime(currentSong.currentTime)}/${formateTime(currentSong.duration)}`
        document.querySelector(".duration").style.width = ((currentSong.currentTime / currentSong.duration) * 100 - (currentSong.currentTime / currentSong.duration) * 2) + "%"
    })

    //Add event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".duration").style.width = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100

    })

    // Add eventlistner to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Add eventlistner to close
    document.querySelector(".cut-svg").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"

    })


    let previous = document.querySelector("#previous")
    // Add event listner to previous
    previous.addEventListener("click", () => {
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1].replaceAll("%20", " "))
        }
    })


    let next = document.querySelector("#next")
    // Add event listner to next
    next.addEventListener("click", () => {
        console.log("Next clicked")

        // console.log(currentSong.src.split("/").slice(-1)[0])
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1].replaceAll("%20", " "))
        }
    })

    // Add event listner to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //Add event listner to mute volume
    document.querySelector(".volumeContainer > img").addEventListener("click" , e=>{
        if(e.target.src.includes("img/volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg" , "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else{
            e.target.src = e.target.src.replace("img/mute.svg" , "img/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
        }
    })

}

main()