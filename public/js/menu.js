document.addEventListener("DOMContentLoaded",main);

function main(){
    const profile = document.querySelector(".profile");
    const menuSelect = document.querySelector(".menu")
    profile.onclick = ()=>{
        menuSelect.classList.toggle("hidden");
    }

    const logout= document.querySelector(".logout");
    logout.onclick = async ()=>{
        const logoutResponse = await fetch("/logout", {
            method:"POST"
        });
        const logoutSuccess = await logoutResponse.json();
        if (logoutSuccess){
            window.location.href = "/login";
        }
    }

}