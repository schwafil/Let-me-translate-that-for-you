/**
 * Created by fisch on 10.01.2017.
 */
function getListOfSupportedLanguages() {
    httpRequestAsync("POST", "https://translate.yandex.net/api/v1.5/tr.json/getLangs?key="+APIKEY, null, function (responseText) {
        console.log(responseText);
        var jsonObj = JSON.parse(responseText);
        var selectLanguage = document.getElementById("fromTo");
        for(var i in jsonObj.dirs){
            var opt = document.createElement("option");
            opt.value = jsonObj.dirs[i];
            opt.textContent = jsonObj.dirs[i];
            selectLanguage.appendChild(opt);
        }
        selectCzechToEnglish();
    });
}

function selectCzechToEnglish() {
    var selectLanguage = document.getElementById("fromTo");
    selectLanguage.value = "cs-en";
}

function translateYandex() {
    var selectedLang = $("#fromTo").val();
    var text = $("#textToTranslate").val();
    if(selectedLang == null || selectedLang == undefined || text == null || text == undefined || text == ""){
        alert("Please select language and write text to translate.");
        return;
    }
    httpRequestAsync("POST", "https://translate.yandex.net/api/v1.5/tr.json/translate?key="+APIKEY+"&text="+text+"&lang="+selectedLang, null, function (responseText) {
        console.log(responseText);
        $("#translatedText").text(JSON.parse(responseText).text[0]);
    });
}