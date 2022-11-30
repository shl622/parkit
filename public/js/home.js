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
    console.log(authData);
    const hiddenMenu = document.querySelector(".menu");
    const authState = {
        isAuth: false,
        username: null
    };
    if(authData.success){
        authState.isAuth = true;
        if (parseCookie().username){
            authState.username = parseCookie.username;
        } 
        console.log(hiddenMenu);
        console.log(authState);
        hiddenMenu.innerHTML = `
        <div class="username">
        <h2> Welcome, ${authState.username} </h2>
        </div>
        <div class="recent-searches">
           <a href="/recent"><h5>Recent Searches</h5></a>
        </div>
        <div class="logout">
            <h5>Logout</h5>
        </div>
        `
        const logout= document.querySelector(".logout");
        console.log(logout);
        if (logout){
            logout.onclick = async (event)=>{
                event.stopPropagation();
                console.log("clickedLogout");
                const logoutResponse = await fetch("/api/logout", {
                    method:"POST"
                });
                const logoutSuccess = await logoutResponse.json();
                console.log("logout",logoutSuccess);
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