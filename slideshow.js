
const keyAllowLeft  = 37;
const keyAllowRight = 39;
let flipInputs;

class DocumentUrlParameterListener{
    get url(){ return new URL(document.location); }
    constructor(name, onGet = it=> it, judgeInvalid = it=> false){
        this.name = name;
        this.onGet = onGet;
        this.judgeInvalid = judgeInvalid;
        this.listeners = [];
        this.listeners["set"] = [];
    }
    get value(){ return this.onGet(this.url.searchParams.get(this.name)); }
    set value(value){
        if(this.judgeInvalid(value)) return;
        const url = this.url;
        url.searchParams.set(this.name, value);
        history.replaceState('','', url.href);
        if("set" in this.listeners)
            this.listeners["set"].forEach(it=> it(value, url));
    }
    reload(){ this.value = this.value; }
    addOnSet(func){ this.listeners["set"].push(func); }
    removeOnSet(func){
        this.listeners["set"]
            .filter(it=> it === func)
            .forEach((it, index)=> this.listeners["set"].splice(index, 1));
    }
    clean(){
        const url = this.url;
        url.searchParams.delete(this.name);
        history.replaceState('','', url.href);
    }
}
const page
    = new DocumentUrlParameterListener(
        "page"
       ,it=> {
        if(it == null) return 1;
        return Number(it);
      },it=> {
        return it < 0
            || it >= flipInputs.length;
    });

class SessionController {
    static get url(){ return new URL("https://script.google.com/macros/s/AKfycbxE1H5XIwMf8YL25ail4TBgfp-uu77VDJSVE7aahS_KEtsepMo/exec"); }
    constructor(){
        this.id = new DocumentUrlParameterListener("sessionId");
        this.isAlive  = false;
        this.syncPageFunc = null;
    }
    toggle(id){
        this.isAlive = !this.isAlive;
        if(this.isAlive){
            if(!this.id.value){
                SessionController.promisedId().then(it=>{
                    this.id.value = it;
                    this.hostingSession();
                });
            }else{
                this.joinToSession();
            }
        }else{
            console.log("connection closed.");
            this.id.clean();
            page.removeOnSet(this.syncPageFunc);
        }
    }
    static promisedId() {
        return fetch(SessionController.url)
                .then(response  => response.json())
                .then(json      => json.id);
    }
    hostingSession(){
        console.log("start Hosting...");
        console.log("id: "+ this.id.value);
        const url = SessionController.url;
        url.searchParams.set("action", "set");
        url.searchParams.set("id"    , this.id.value);
        this.syncPageFunc = page=> this.setPage(url, page)
        page.addOnSet(this.syncPageFunc);
    }
    setPage(url, value){
        url.searchParams.set("page", value);
        fetch(url);
    }
    joinToSession(){
        const url = SessionController.url;
        console.log("join to session.");
        console.log("id: "+ this.id.value);
        url.searchParams.set("action", "get");
        url.searchParams.set("id"    , this.id.value);
        this.pageSyncing();
    }
    pageSyncing(){
        if(!this.isAlive) return;
        console.log(".");
        const url = SessionController.url;
        url.searchParams.set("id", this.id.value);
        fetch(url)
            .then(response  => response.json())
            .then(json=>{
                page.value = json.page;
                setTimeout(()=> this.pageSyncing(), 100);
            });
    }
}


window.onload = function(){
    const slideshow = document.getElementsByClassName('slideshow')[0];
    const inputs
        = Array.from(slideshow.children)
            .filter(it=> it.tagName == "INPUT");
    flipInputs = inputs.filter(it=> it.name == "flip");
    const inputInvalidationCheckbox = inputs[0];
    const listViewButton            = flipInputs[0];

    flipInputs.forEach((it, index)=> it.onchange = value=> { if(value) page.value = index; });
    page.addOnSet( it=> flipInputs[it].checked = true );
    page.reload();
    
    // if(!isMobile())
    //     inputInvalidationCheckbox.checked = true;

    document.onkeydown = function(event){
        switch(event.keyCode){
            case keyAllowLeft : slideshowDecrement(); break;
            case keyAllowRight: slideshowIncrement(); break;
        }
    };

    const sessionController = new SessionController();
    if(!!sessionController.id.value)
        sessionController.toggle();
    inputs.filter(it=> it.name == "sessionToggler")[0].onclick = ()=> sessionController.toggle();
}

// TODO: in page fli@
function slideshowDecrement(){ page.value = page.value -1; }
function slideshowIncrement(){ page.value = page.value +1; }
function isMobile(){
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

