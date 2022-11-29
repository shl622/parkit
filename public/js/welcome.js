document.addEventListener("DOMContentLoaded",main);

const parseCookie = () =>
    document.cookie
    .split(';')
    .map(v => v.split('='))
    .reduce((acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
        return acc;
    }, {});

function main(){
    console.log(document.cookie);
    if (!document.cookie){
        window.location.href="/signup"
        return;
    }
    else if(!parseCookie().username){
        window.location.href="/signup"
        return;
    }
    const welcomeMsgEl = document.getElementById("welcomeMsg");
    welcomeMsgEl.textContent= `
     Welcome, ${parseCookie().username}
    `
    const startExploringEl = document.getElementById("gotomain");
    startExploringEl.onclick = (event)=>{
        window.location.href = "/"
    }
};