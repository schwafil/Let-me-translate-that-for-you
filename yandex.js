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
        checkUrlParameters();
    });
}

function checkUrlParameters() {
    var input = getParameterByName('input'); // "lorem"
    var language = getParameterByName('language'); // "" (present with empty value)
    if(input != null && input != undefined && language != null && language != undefined){
        console.log(input+" "+language);
        $('#textToTranslate').val(input);
    }
    var lang = getParameterByName("language");
    if(getParameterByName("language") == null || getParameterByName("language") == undefined){
        automaticallySelectLanguage("cs-en");
        $('#textToTranslate').focus();
    }else{
        $('#fromTo').attr('disabled', true);
        $('#textToTranslate').attr('disabled',true);
        automaticallySelectLanguage(lang);
        moveMouseOnTranslateButtonAndClick();
    }
}

function automaticallySelectLanguage(lang) {
    var selectLanguage = document.getElementById("fromTo");
    selectLanguage.value = lang;
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
        $("#inputText").text(text);
        $("#fromToLang").text(JSON.parse(responseText).lang);
        var user_id = localStorage.getItem("id");
        if(user_id != null && user_id != undefined) {
            $("#saveTranslatedText").html("<input type='button' class='btn btn-primary' onclick='saveTranslation()' value='Save translation'>" +
                " <input type='button' class='btn btn-primary' onclick='showLink()' value='Share translation via Link'>");
        }else{
            $("#saveTranslatedText").html("<input type='button' id='saveTranslationBtn' class='btn btn-primary' style='display: none' onclick='saveTranslation()' value='Save translation'>" +
                " <input type='button' class='btn btn-primary' onclick='showLink()' value='Share translation via Link'>");
        }
        $("#linkToShare").html("");
    });
}

function showLink() {
    var inputText = encodeURI($("#inputText").text());
    var lang = $("#fromToLang").text();
    $("#linkToShare").html("<input type='text' id='link' readonly='readonly' style='width: 250px'" +
        " value='https://schwafil.github.io/Let-me-translate-that-for-you/showTranslation?input="+inputText+"&language="+lang+"'/>");

}


function saveTranslation() {
    var user_id  = localStorage.getItem("id");
    var inputText = $("#inputText").text();
    var translatedText = $("#translatedText").text();
    var fromToLang = $("#fromToLang").text();
    var data = "translatedText="+inputText+"&resultText="+translatedText+"&fromToLang="+fromToLang;
    httpRequestAsync("POST", "https://lmttfy-matyapav.rhcloud.com/api/translations/"+user_id, data , function (responseText) {
        console.log(responseText);
        getSavedTranslationsOfLoggedUser();
    });
}

function getSavedTranslationsOfLoggedUser() {
    var user_id = localStorage.getItem("id");
    httpRequestAsync("GET", "https://lmttfy-matyapav.rhcloud.com/api/translations/"+user_id, null, function (responseText) {
        console.log(responseText);
        var data = JSON.parse(responseText).translations;
        var html = '<table class="table">' +
            '<thead>' +
            '<th>Id</th>' +
            '<th>Input text</th>' +
            '<th>Translated text</th>' +
            '<th>Language</th>' +
            '<th>Actions</th>' +
            '</thead>' +
            '<tbody>';
        for (var i = 0, len = data.length; i < len; ++i) {
            html += '<tr>';
            html += '<td>' + data[i].id + '</td>';
            html += '<td>' + data[i].translatedText + '</td>';
            html += '<td>' + data[i].resultText + '</td>';
            html += '<td>' + data[i].fromToLang + '</td>';
            var translate_id = data[i].id;
            html += '<td> <button class="btn btn-danger" value="Delete" onclick="deleteTranslation('+translate_id+')">Delete</td>'
            html += "</tr>";
        }
        $('#savedTranslations').html(html);
    })
}

function deleteTranslation(id) {
    var user_id = localStorage.getItem("id");
    httpRequestAsync("DELETE", "https://lmttfy-matyapav.rhcloud.com/api/translations/"+user_id+"/delete/"+id, null, function (responseText) {
        console.log(responseText);
        getSavedTranslationsOfLoggedUser();
    })
}