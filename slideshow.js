
const keyAllowLeft  = 37;
const keyAllowRight = 39;
let flipInputs;

class DocumentUrlParameterListener{
    constructor(name, onGet = (it)=> it){
        this.url = new URL(document.location);
        this.name = name;
        this.onGet = onGet;
        this.listeners = [];
        this.listeners["set"] = [];
    }
    get value(){
        return this.onGet(this.url.searchParams.get(this.name));
    }
    set value(value){
        this.url.searchParams.set(this.name, value);
        history.replaceState('','', this.url.href);
        if("set" in this.listeners)
            this.listeners["set"].forEach(it=> it(value, this.url));
    }
    addOnSet(func){
        this.listeners["set"].push(func);
    }
}
const page    = new DocumentUrlParameterListener("page", it=> Number(it) || 0);
const session = new DocumentUrlParameterListener("session");

window.onload = function(){
    page.addOnSet( value=> console.log(value) );
    const slideshow = document.getElementsByClassName('slideshow')[0];
    const inputs
        = Array.from(slideshow.children)
            .filter(it=> it.tagName == "INPUT");
    const flips = inputs.filter(it=> it.name == "flip");
    const inputInvalidationCheckbox = inputs[0];
    const listViewButton            = flips[0];
    flipInputs = flips.slice(1);
    flipInputs.forEach((it, index)=> it.onchange = value=> { if(value) page.value = index; });
    setPage(page.value);
    
    if(!isMobile())
        inputInvalidationCheckbox.checked = true;

    document.onkeydown = function(event){
        switch(event.keyCode){
            case keyAllowLeft : slideshowDecrement(); break;
            case keyAllowRight: slideshowIncrement(); break;
        }
    };

    const sessionId = session.value;
    if(sessionId)
        joinToSession(sessionId);
}

// TODO: in page fli@
function slideshowDecrement(){ setPage(page.value -1); }
function slideshowIncrement(){ setPage(page.value +1); }
function setPage(index){
    const target = flipInputs[index];
    if(!target) return;
    target.checked = true;
    page.value = index;
}
function isMobile(){
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}



// get session js
const sessionController = new URL("https://script.google.com/macros/s/AKfycbxE1H5XIwMf8YL25ail4TBgfp-uu77VDJSVE7aahS_KEtsepMo/exec");
function hostingSession(id){
    console.log("start Hosting...");
    console.log("id: "+ id);
    sessionController.searchParams.set("action", "set");
    sessionController.searchParams.set("id"    , id   );
    page.addOnSet(value=>{
        sessionController.searchParams.set("page", index);
        fetch(sessionController);
    });
}
function getSessionId() {
    fetch(sessionController)
        .then(function(response) { return response.json(); })
        .then(function(json) {
            session.value = json.id;
            hostingSession(json.id);
        });
}
function joinToSession(id){
    console.log("join to session.");
    console.log("id: "+ id);
    sessionController.searchParams.set("action", "get");
    sessionController.searchParams.set("id"    , id   );
    syncPage();
}
function syncPage(){
    console.log(".");
    fetch(sessionController)
        .then(function(response) { return response.json(); })
        .then(function(json) {
            setPage(json.page);
            setTimeout(()=> { syncPage(); }, 750);
        });
}
