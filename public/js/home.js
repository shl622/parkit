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
        window.location.href="/login.html"
        return;
    }
    else if(!parseCookie().username){
        window.location.href="/login.html"
        return;
    }
};