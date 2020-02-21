
const keyAllowLeft  = 37;
const keyAllowRight = 39;
let flipInputs;

class PageUrlParameter {
    get url(){ return new URL(document.location); }
    get() {
        const url    = this.url;
        const gotten = Number(url.searchParams.get("page"));
        if (gotten) return gotten;
        return 0;
    }
    set(value) {
        const url = this.url;
        url.searchParams.set("page", value);
        history.replaceState('','',url.href);
    }
}
const page = new PageUrlParameter;

window.onload = function(){
    const slideshow = document.getElementsByClassName('slideshow')[0];
    const inputs
        = Array.from(slideshow.children)
            .filter(it=> it.tagName == "INPUT");
    const flips = inputs.filter(it=> it.name == "flip");
    const inputInvalidationCheckbox = inputs[0];
    const listViewButton            = flips[0];
    flipInputs = flips.slice(1);
    flipInputs.forEach((it, index)=> it.onchange = value=> { if(value) page.set(index) });
    setPage(page.get());
    
    if(!isMobile())
        inputInvalidationCheckbox.checked = true;

    document.onkeydown = function(event){
        switch(event.keyCode){
            case keyAllowLeft : slideshowDecrement(); break;
            case keyAllowRight: slideshowIncrement(); break;
        }
    };

    const sessionId = getSessionUrlParameter();
    if(sessionId)
        joinToSession(sessionId);
}

// TODO: in page fli@
function slideshowDecrement(){ setPage(page.get() - 1); }
function slideshowIncrement(){ setPage(page.get() +1); }
function setPage(index){
    const target = flipInputs[index];
    if(!target) return;
    target.checked = true;
    page.set(index);
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
    flipInputs.forEach((it, index)=> it.onchange = value=> {
        if(!value) return;
        page.set(index)
        sessionController.searchParams.set("page", index);
        fetch(sessionController);
        console.log(".");
    });
}
function getSessionId() {
    fetch(sessionController)
        .then(function(response) { return response.json(); })
        .then(function(json) {
            setSessionUrlParameter(json.id);
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
function getSessionUrlParameter(){
    const url = new URL(document.location);
    return url.searchParams.get("session");
}
function setSessionUrlParameter(id){
    const url = new URL(document.location);
    url.searchParams.set("session", id);
    history.replaceState('','',url.href);
}
