document.addEventListener("DOMContentLoaded",main);

function main(){
    const profile = document.querySelector(".profile");
    const menuSelect = document.querySelector(".menu")
    profile.onclick = ()=>{
        console.log("clickedProfile");
        menuSelect.classList.toggle("hidden");
    }
}