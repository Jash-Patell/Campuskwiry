const form = document.querySelector("form");
fnField = form.querySelector(".fname");
fnInput = fnField.querySelector("input");
lnField = form.querySelector(".lname");
lnInput = lnField.querySelector("input");
uField = form.querySelector(".uname");
uInput = uField.querySelector("input");
eField = form.querySelector(".email");
eInput = eField.querySelector("input");
pField = form.querySelector(".password");
pInput = pField.querySelector("input");
let passwordField = document.getElementById("password");
cpField = form.querySelector(".cpassword");
let passwordConfirmField = document.getElementById("passwordConf")
cpInput = cpField.querySelector("input");

//! On Register form Submit
form.onsubmit = (e)=>{
  e.preventDefault(); //preventing from form submitting
  //if email and password is blank then add shake class in it else call specified function
  (fnInput.value == "") ? fnField.classList.add("shake", "error") : checkFname();
  (lnInput.value == "") ? lnField.classList.add("shake", "error") : checkLname();
  (uInput.value == "") ? uField.classList.add("shake", "error") : checkUname();
  (eInput.value == "") ? eField.classList.add("shake", "error") : checkEmail();
  (pInput.value == "") ? pField.classList.add("shake", "error") : checkPass();
  (cpInput.value == "") ? cpField.classList.add("shake", "error") : checkCpass();

  setTimeout(()=>{ //remove shake class after 500ms
    fnField.classList.remove("shake");
    lnField.classList.remove("shake");
    uField.classList.remove("shake");
    eField.classList.remove("shake");
    pField.classList.remove("shake");
    cpField.classList.remove("shake");
  }, 500);

  fnInput.onkeyup = ()=>{checkFname();} //calling checkEmail function on email input keyup
  lnInput.onkeyup = ()=>{checkLname();} //calling checkPassword function on pass input keyup
  uInput.onkeyup = ()=>{checkUname();} //calling checkPassword function on pass input keyup
  eInput.onkeyup = ()=>{checkEmail();} //calling checkPassword function on pass input keyup
  pInput.onkeyup = ()=>{checkPass();} //calling checkPassword function on pass input keyup
  cpInput.onkeyup = ()=>{checkCpass();} //calling checkPassword function on pass input keyup

  function checkFname(){ //check Frist name function
    if(fnInput.value== ""){ //if not matched then add error and remove valid class
      fnField.classList.add("error");
      fnField.classList.remove("valid");
    }else{ //if matched then remove error and add valid class
      fnField.classList.remove("error");
      fnField.classList.add("valid");
    }
  }
  function checkLname(){ //check Last name function
    if(lnInput.value== ""){ //if not matched then add error and remove valid class
      lnField.classList.add("error");
      lnField.classList.remove("valid");
    }else{ //if matched then remove error and add valid class
      lnField.classList.remove("error");
      lnField.classList.add("valid");
    }
  }
  function checkUname(){ //check User Name function
    if(uInput.value== ""){ //if not matched then add error and remove valid class
      uField.classList.add("error");
      uField.classList.remove("valid");
    }else{ //if matched then remove error and add valid class
      uField.classList.remove("error");
      uField.classList.add("valid");
    }
  }

  function checkEmail(){ //checkEmail function
    let pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/; //pattern for validate email
    if(!eInput.value.match(pattern)){ //if pattern not matched then add error and remove valid class
      eField.classList.add("error");
      eField.classList.remove("valid");
      let errorTxt = eField.querySelector(".error-txt");
      //if email value is not empty then show please enter valid email else show Email can't be blank
      (eInput.value != "") ? errorTxt.innerText = "Enter a valid email address" : errorTxt.innerText = "Email can't be blank";
    }else{ //if pattern matched then remove error and add valid class
      eField.classList.remove("error");
      eField.classList.add("valid");
    }
  }
  
  function checkPass(){ //checkPass function
    if(pInput.value == ""){ //if pass is empty then add error and remove valid class
      pField.classList.add("error");
      pField.classList.remove("valid");
    }else{ //if pass is empty then remove error and add valid class
      pField.classList.remove("error");
      pField.classList.add("valid");
    }
  }

  function checkCpass(){ //checkPass function
    if( passwordField.value != passwordConfirmField.value ){ //if pass is empty then add error and remove valid class
      cpField.classList.add("error");
      cpField.classList.remove("valid");
      let errorTxt = cpField.querySelector(".error-txt");
      //if email value is not empty then show please enter valid email else show Email can't be blank
      (cpInput.value !== "") ? errorTxt.innerText = "Password do not match" : errorTxt.innerText = "Confirm Password can't be blank";
    }else{ //if pass is empty then remove error and add valid class
      cpField.classList.remove("error");
      cpField.classList.add("valid");
    }
  }

  //if eField and pField doesn't contains error that submit form
if(!fnField.classList.contains("error") 
    && !lnField.classList.contains("error") 
    && !uField.classList.contains("error")  
    && !eField.classList.contains("error")  
    && !pField.classList.contains("error")  
    && !cpField.classList.contains("error"))
    {
      form.submit();
    }
}

//! Password Sregth checker
let parameters = {
  count : false,
  letters : false,
  numbers : false,
  special : false
}

let strengthBar = document.getElementById("strength-bar");
let msg = document.getElementById("msg");

function strengthChecker(){
  let password = document.getElementById("password").value;

  parameters.letters = (/[A-Za-z]+/.test(password))?true:false;
  parameters.numbers = (/[0-9]+/.test(password))?true:false;
  parameters.special = (/[!\"$%&/()=?@~`\\.\';:+=^*_-]+/.test(password))?true:false;
  parameters.count = (password.length > 7)?true:false;

  let barLength = Object.values(parameters).filter(value=>value);

  console.log(Object.values(parameters), barLength);

  strengthBar.innerHTML = "";
  for( let i in barLength){
      let span = document.createElement("span");
      span.classList.add("strength");
      strengthBar.appendChild(span);
  }

  let spanRef = document.getElementsByClassName("strength");
  for( let i = 0; i < spanRef.length; i++){
      switch(spanRef.length - 1){
          case 0 :
              spanRef[i].style.background = "#ff3e36";
              msg.textContent = "Your password is very weak";
              break;
          case 1:
              spanRef[i].style.background = "#ff691f";
              msg.textContent = "Your password is weak";
              break;
          case 2:
              spanRef[i].style.background = "#ffda36";
              msg.textContent = "Your password is good";
              break;
          case 3:
              spanRef[i].style.background = "#0be881";
              msg.textContent = "Your password is strong";
              break;
      }
  }
}


