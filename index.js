console.log("Hello Vishesh Sharma !");
let currentSong = new Audio();
let songs;
let currFolder;
function formatTime(seconds) {
    // Ensure seconds is integer
    const totalSeconds = Math.floor(seconds);

    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    // zero-padding seconds
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `
        <li>
            <img class="invert" src="assets/music (1).svg" alt="Music Icon">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Vishesh</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="assets/play (1).svg" alt="Play Icon" width="16px">
            </div>          
        </li>`;
        // return songs;
    }
    //  Attach an event listener to each songs
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerText.trim());
        });
    });

}
const playMusic = (track, pause = false) => {
    // let audio = new Audio(`/songs/${track}`)
    currentSong.src = `/${currFolder}/` + track;
    if (pause) {
        currentSong.pause();
        play.src = "assets/play (1).svg";
    } else {
        currentSong.play();
        play.src = "assets/pause (1).svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00/00:00"

    // To fix NAN
    currentSong.onloadedmetadata = function () {
        document.querySelector(".songTime").innerHTML = `00:00/${formatTime(currentSong.duration)}`;
    };

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let folders = [];
    let cardContainer = document.querySelector(".card-container");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
    }
    if (e.href.includes("/songs")) {
        let folder = (e.href.split("/").slice(-2)[0]);
        // get the meta data of folder
        let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
        let response = await a.json();
        cardContainer.innerHTML = cardContainer.innerHTML + `
                <div class="card" data-folder="${folder}">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="32" fill="#1DB954" />
                            <polygon points="24,18 24,46 46,32" fill="black" />
                        </svg>
                    </div>
                    <img src="assets/${folder}.jpeg" alt="${response.title}">
                    <h3>${response.title}</h3>
                    <p>${response.description}</p>
                </div>
            `;
    }
}

async function main() {
    //     Get the list of all songs
    await getsongs("songs/karan");
    playMusic(songs[0], true);
    // console.log(songs);

    // Display all the albums on the page 
    displayAlbums();



    //  Attach an event listener to the play , now ,and previous button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "assets/pause (1).svg"
        }
        else {
            currentSong.pause();
            play.src = "assets/play (1).svg"
        }
    })

    // Listen for time update
    currentSong.addEventListener("timeupdate", () => {
        let currentTime = currentSong.currentTime;
        let duration = currentSong.duration;
        document.querySelector(".songTime").innerHTML = `${formatTime(currentTime)}/${formatTime(duration)}`;
        document.querySelector(".circle").style.left = `${(currentTime / duration) * 100}%`;
    });
    //  add Event Listener for seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        document.querySelector(".circle").style.left = `${(e.offsetX / e.target.clientWidth) * 100}%`;
        currentSong.currentTime = (e.offsetX / e.target.clientWidth) * currentSong.duration;
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    //    add Event Listener for volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    //  Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            const folder = item.currentTarget.dataset.folder; // e.g. "karan"
            await getsongs(`songs/${folder}`); // Correct path
            playMusic(songs[0], true); // Update playbar with first song
        });
    });
    // add event Listner to mute the track;
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src == "assets/volume.svg") {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 1;
        }
    });
}
main()
