document.addEventListener("DOMContentLoaded",main);

const parseCookie = () =>
    // if (!document.cookie){
    //     return;
    // }
    document.cookie
    .split(';')
    .map(v => v.split('='))
    .reduce((acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
        return acc;
    }, {});

async function main(){
    const authResponse = await fetch("/api/checkauth");
    const authData = await authResponse.json();
    const hiddenMenu = document.querySelector(".menu");
    const authState = {
        isAuth: false,
        username: null
    };
    if(authData.success){
        authState.isAuth = true;
        if (parseCookie().username){
            authState.username = parseCookie().username;
        } 
        hiddenMenu.innerHTML = `
        <div class="username">
        <h2 id="menu-welcome"> Welcome  ${authState.username} </h2>
        </div>
        <div class="recent-searches">
           <a href="/recent"><h5>Recent Searches</h5></a>
        </div>
        <div class="logout">
            <h5>Logout</h5>
        </div>
        `
        const logout= document.querySelector(".logout");
        if (logout){
            logout.onclick = async (event)=>{
                event.stopPropagation();
                const logoutResponse = await fetch("/api/logout", {
                    method:"POST"
                });
                const logoutSuccess = await logoutResponse.json();
                if (logoutSuccess){
                    window.location.reload();
                }
            }
        }
    }
    
    else{
        authState.username = "Guest";
    }
};