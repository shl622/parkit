document.addEventListener("DOMContentLoaded",main);

function main(){
    const signupformState = {
        username:"",
        email: "",
        password:""
    }
    const loginformState = {
        username:"",
        password:""
    }
    const loginformEl = document.getElementById("login-form");
    const loginformInputEls = document.querySelectorAll(".login-form-input");
    const signupformEl = document.getElementById("signup-form");
    const signupformInputEls = document.querySelectorAll(".signup-form-input");
    if (signupformEl){
        signupformInputEls.forEach((input,index)=>{
            input.oninput = (event) => {
                signupformState[event.target.name] = event.target.value;
                console.log(signupformState);
            }
        });
        signupformEl.onsubmit = async (event)=>{
            event.preventDefault();
            if (signupformState.username.length < 6){
                const usernameError = document.getElementById("usernameError");
                usernameError.classList.remove("hidden");
            }
            if (signupformState.password.length < 6){
                const passwordError = document.getElementById("passwordError");
                passwordError.classList.remove("hidden");
            }
            try{
                const response = await fetch('/signup',{
                    method:"POST",
                    headers: {
                        "Content-Type":"application/json",
                    },
                    //cors--check later
                    withCredentials: true,
                    crednetials: 'include',
                    body: JSON.stringify(signupformState)
                });
                const data = await response.json();
                console.log(data);
                if (data.success){
                    window.location.href = "/welcome"
                }
            }catch(err){
                console.log(err.message);
            }
        }
    }
    if (loginformEl){
        loginformInputEls.forEach((input,index)=>{
            input.oninput = (event) =>{
                loginformState[event.target.name] = event.target.value;
                console.log(loginformState);
            }
        });
        loginformEl.onsubmit = async (event) =>{
            event.preventDefault();
            try{
            const response = await fetch('/api/login',{
                method:"POST",
                credentials: "include",
                headers: {
                    "Content-Type":"application/json",
                },
                //cors--check later
                withCredentials: true,
                crednetials: 'include',
                body: JSON.stringify(loginformState)
            });
            const data = await response.json();
            console.log(data);
            if (data.success){
                window.location.href = "/"
            }
            else{
                const loginErrorEl= document.querySelector(".login-form-error");
                loginErrorEl.classList.remove("hidden");
                loginErrorEl.textContent= "Username or password is incorrect"
            }
            }catch(err){
                console.log(err.message)
            }
        }
    }
}