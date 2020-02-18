
const keyAllowLeft  = 37;
const keyAllowRight = 39;
let flipInputs;

window.onload = function(){
    const slideshow = document.getElementsByClassName('slideshow')[0];
    flipInputs
        = Array.from(slideshow.children)
            .filter(it=> it.tagName == "INPUT")
            .filter(it=> it.name    == "flip" )
            .slice(1);
    flipInputs.forEach((it, index)=> it.onchange = value=> { if(value) updatePageUrlParameter(index) });
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
