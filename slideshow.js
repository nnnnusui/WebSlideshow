
const keyAllowLeft  = 37;
const keyAllowRight = 39;
let flipInputs;

window.onload = function(){
    const slideshow = document.getElementsByClassName('slideshow')[0];
    const inputs
        = Array.from(slideshow.children)
            .filter(it=> it.tagName == "INPUT");
    const flips = inputs.filter(it=> it.name == "flip");
    const inputInvalidationCheckbox = inputs[0];
    const listViewButton            = flips[0];
    flipInputs = flips.slice(1);
    flipInputs.forEach((it, index)=> it.onchange = value=> { if(value) updatePageUrlParameter(index) });
    setPage(getPageUrlParameter());
    
    if(!isMobile())
        inputInvalidationCheckbox.checked = true;

    document.onkeydown = function(event){
        switch(event.keyCode){
            case keyAllowLeft : slideshowDecrement(); break;
            case keyAllowRight: slideshowIncrement(); break;
        }
    };
}

// TODO: in page fli@
function slideshowDecrement(){ setPage(getPageUrlParameter() -1); }
function slideshowIncrement(){ setPage(getPageUrlParameter() +1); }
function setPage(index){
    const target = flipInputs[index];
    if(!target) return;
    target.checked = true;
    updatePageUrlParameter(index);
}

function getPageUrlParameter(){
    const url    = new URL(document.location);
    const gotten = Number(url.searchParams.get("page"));
    if (gotten) return gotten;
    updatePageUrlParameter(0);
    return 0;
}
function updatePageUrlParameter(index){
    const url = new URL(document.location);
    url.searchParams.set("page", index);
    history.replaceState('','',url.href);
}
function isMobile(){
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}