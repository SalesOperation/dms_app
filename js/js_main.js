// JavaScript General App

var userWS = '69BA4B9D76B7C3452E2A48B7BF9790FE';
var pdwWS  = '0BAD6CE456FCFBEF59544697D43E06D1';
var vFlagTracking = false;
var vTimerGPS; // = 30000;
var vIdFormulario ='XO';
var vLat = 0;
var vLng = 0;
//var ws_url = 'http://localhost:8090/ws_so/service_so.php'; 
var ws_url = 'https://190.4.63.207/ws_so/service_so.php';

var vDatosUsuario ={"user":"", "login":"", "name":"", "phone":0, "email":"na", "job":"na", "id_dms":0, "perfil":0, "id_pdv_dlr":0};
var vTitle ="S.O. DMS Experience";
var map;
var markHorus;
var pgActual = 0;
var pgBack = 0;


var vIntersept = true;
var vIntervalGeo;
var vInteDash;
var bgGeo;
var vFormData = {};
var vFormsPendientes = [];
var vFileG;  //Variable para foto del usuario

var lat1, lng1;
var vDistance = 0;
var vFechIniHorus;

//var webSvrListener =  setInterval(function(){ consultSVR()}, 59000);
var pagRoot = [{id:0, back:0},
                {id:1, back:0},
                {id:2, back:0},
                {id:3, back:0},
                {id:4, back:0},
                {id:5, back:0},
                {id:6, back:0},
                {id:100, back:3},
                {id:101, back:3}];
var app = {
    
    //alert(getParams('user'));
    
    initialize: function() {        
        document.addEventListener("deviceready", this.onDeviceReady, false);
        
 
    },
    
    onDeviceReady: function() {

        //shownot('Hello World');
        //window.plugins.toast.show('Back Bloq..', 1000, 'bottom');
        // Initialize the map view  
 
        //cordova.plugins.backgroundMode.setEnabled(true);  
        //cordova.plugins.backgroundMode.overrideBackButton(); 
        cordova.plugins.backgroundMode.setDefaults({title:'SO - Horus', text: 'Tracking..', resume:false, hidden:true}); 
       
        cordova.plugins.backgroundMode.on('activate',function(){
            if(vFlagTracking == true){
                cordova.plugins.backgroundMode.disableWebViewOptimizations();
        //        console.log('..'); 
                //vInteDash = setInterval(function(){navigator.vibrate(25);}, vTimerGPS); 
            }         
        });

        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, 
            function (fs) {
                fs.getDirectory('resources', { create: true }, function (fs2){
                    //console.log('Directorio - ' + fs2.name);
                    /*fs2.getFile('log.txt', {create: true, exclusive: false}, 
                        function(fileEntry) {
                            alert('File creation successfull!');
                        });*/
                });
            }, 
            function(e){ alert(e.toString); }
        );

        document.addEventListener('resume', function(e){
            //window.plugins.toast.show('Resume', 1000, 'bottom');
        });

        document.addEventListener('pause', function(e){
            //tracking();
            //clearInterval(vIntervalGeo);
            //vInteDash = setInterval(function(){ setMarkLocation(); }, vTimerGPS); 
        });

        document.addEventListener('backbutton', function(e){
            console.log('..');
            backButton();
       //     //window.plugins.toast.show('Back Bloq..', 1000, 'bottom');          
        });
        
        
    }

}

$(document).ready(function(e){

    //tablero1G();

    Highcharts.setOptions({
      credits: {
        enabled: false
      }
    }); 

    setTimeout(function(){initMap(14.618086,-86.959082);}, 2000);
    hide_pags();   
    var img = new Image();
    var fechx = new Date();
    var wknum = getWeekNumber(fechx);
    //img.src = 'img/salesman.png';
    //saveImgtoDB(img); 

    $("#dvDMS").show();
    $('#lbl_title').html('DMS EXPERIENCE');            
    $("#dvHead").show();
    $('#anomesRVtas').empty();
    $('#anomesRVtas').append('<option value="' + getYMD(0).toString().substr(0,6) + '" selected="selected">'+ getYMD(0).toString().substr(0,6) +'</option>');
    $('#anomesRVtas').selectmenu("refresh");

    $("#cbSemanaNum").empty();
    $('#cbSemanaNum').append('<option value="' + wknum[1] + '" selected="selected">'+ wknum[1] +'</option>');
    $('#cbSemanaNum').selectmenu("refresh");
    
    //map = plugin.google.maps.Map.getMap($("#dvMain")); 

    if (vFlagTracking==false){
        $("#startGPS").show();
        $("#stopGPS").hide();
    }else{
        $("#startGPS").hide();
        $("#stopGPS").show();        
    }


    function validaLogin(){
        var tempLogin = getParams();
        vLogin = tempLogin.login;
        vDateLicense = getYMD(0);

        vDatosUsuario.user = tempLogin.user;
        vDatosUsuario.login = vLogin;
        if(parseInt(vLogin) != 1){ 
            db.transaction(function(cmd){   
                cmd.executeSql("SELECT * FROM users where login = ? ", [1], function (cmd, results) {
                    var len = results.rows.length, i;                    
                    i = 0;

                    if(len > 0 && vDateLicense > results.rows.item(0).license){
                        //console.log('Licencia Vencida');
                        console.log(results.rows.item(i).id);
                        $.ajax( {type:'POST',
                                url: ws_url,
                                dataType:'json',
                                data: {m:100,vx:userWS, vy:pdwWS, ui:results.rows.item(i).id, pw:results.rows.item(i).pwd},
                                success: function(data){ 
                                    if(data[0].flag == 'false'){
                                        console.log('Log OK');
                                        vQuery = 'DELETE FROM users WHERE id = \'' + results.rows.item(i).id + '\'';
                                        ejecutaSQL(vQuery, 0);
                                        setTimeout(function(){window.location.replace('login.html');}, 800);
                                    }else{

                                        if(vDateLicense>data[0].vdatos[0].license){
                                            setTimeout(function(){window.location.replace('login.html');}, 800);
                                        }

                                        vQuery = 'UPDATE users SET license = '+ data[0].vdatos[0].license +' WHERE id = \'' + results.rows.item(i).id + '\'';
                                        ejecutaSQL(vQuery, 0);
                                        //console.log(results.rows.item(i).name);
                                        vDatosUsuario.user = results.rows.item(i).id;
                                        vDatosUsuario.login = 1;
                                        show_datos_user(vDatosUsuario.user);
                                        get_forms_info();
                                        logInOut(vDatosUsuario.user, 1); 
                                        
                                        $("#page").show();
                                        $("#dvMain").show();
                                        $("#bg_login").hide();
                                        $("#dvUserName").html(vDatosUsuario.user);
                                    }
                                },
                                error: function(data){
                                    alert('Error consultando el servidor..');
                                    setTimeout(function(){window.location.replace('login.html');}, 800);
                                }
                        });                        	                                           
                    }else if (len > 0){   
                        //window.location.replace('login.html');                         
                        //console.log('Loged In');
                        vDatosUsuario.user = results.rows.item(i).id;
                        vDatosUsuario.login = 1;
                        show_datos_user(vDatosUsuario.user);
                        get_forms_info();
                        logInOut(vDatosUsuario.user, 1);      
                        
                        $("#page").show();
                        $("#dvMain").show();
                        $("#bg_login").hide();
                        $("#dvUserName").html(vDatosUsuario.user);

                        setTimeout(function(){
                            var strUrl = '';
                            var arrFile = [];
                            db.transaction(function(cmd2){
                                cmd2.executeSql("SELECT * FROM tbl_files where id_file = ? order by correl asc", [vDatosUsuario.user], function (cmd2, results) {
                                    var len = results.rows.length;
                                    for(i=0;i<len; i++){
                                        strUrl += results.rows.item(i).strdtos;
                                        arrFile.push({id_file:results.rows.item(i).id_file, nombre:results.rows.item(i).name, tipo:results.rows.item(i).type, corel:results.rows.item(i).correl, dtos:results.rows.item(i).strdtos});
                                    }
                                    //console.log(strUrl);
                                    //console.log('Img Loaded');
                                    //sendFileToServer(arrFile);
                                    if(strUrl.length<=10){
                                        getFileToServer(vDatosUsuario.user);
                                    }else{
                                        displayImage(strUrl);
                                    }
                                });
                            });
                        }, 500);

                    }else{
                        window.location.replace('login.html'); 
                    }
                    //leeSMSs(); 
                });
            });
        }else{ 

            show_datos_user(vDatosUsuario.user);
            get_forms_info();
            $("#page").show();
        	$("#dvMain").show(); 
        	$("#bg_login").hide(); 
            logInOut(tempLogin.user, 1); 	            
            $("#dvUserName").html(vDatosUsuario.user);
            //sleep(400);
            setTimeout(function(){
                var strUrl = '';
                var arrFile = [];                

                db.transaction(function(cmd2){
                    cmd2.executeSql("SELECT * FROM tbl_files where id_file = ? order by correl asc", [vDatosUsuario.user], function (cmd2, results) {
                        var len = results.rows.length;

                        for(i=0;i<len; i++){
                            strUrl += results.rows.item(i).strdtos;
                            arrFile.push({id_file:results.rows.item(i).id_file, nombre:results.rows.item(i).name, tipo:results.rows.item(i).type, corel:results.rows.item(i).correl, dtos:results.rows.item(i).strdtos});          
                        }
                        //console.log(strUrl);                        
                        //console.log('Img Loaded');
                        //sendFileToServer(arrFile);                        
                        if(strUrl.length<=10){
                            getFileToServer(vDatosUsuario.user);
                        }else{
                            displayImage(strUrl);
                        }
                    });
                });
            }, 500);
        }
    }
    setTimeout( function(){ validaLogin();}, 100); 

    $("#imgUser").dblclick(function(){
        takePicture();
    });

    $('input[type="file"]').change(function(e){
        var fileName = e.target.files[0].name;
        alert('The file "' + fileName +  '" has been selected.');        
        //var file = document.querySelector('#files > input[type="file"]').files[0];
        var file = $("#vFile").prop('files')[0];
        getBase64(file); // prints the base64 string
    });

    setTimeout(function(){
        db.transaction(function(cmd2){
            cmd2.executeSql("SELECT * FROM params where id = 1", [], function (cmd2, results) {
                var len = results.rows.length;
                if(len>0){
                    vTimerGPS = results.rows.item(0).dvalue;
                }
            });
        });
    }, 1000);

});

function changYMVtas(e){
    $.mobile.loading('show'); 
    reporteVentas(e.value);
}

function chngFechaCierreVtas(ev){    
    $.mobile.loading('show'); 
    vFech = ev.value.replace('-', '').replace('-', '');
    cierresDiarios(vFech);
}

function changeSemanaPlan(cbsem){
    //console.log(cbsem.value);
    showPlanSemana(parseInt(cbsem.value), getYMD(0).toString().substr(0,6));
}

function show_datos_user(vUser){
    db.transaction(function(cmd2){
        cmd2.executeSql("SELECT * FROM users where id = ?", [vUser], function (cmd2, results) {
            var len = results.rows.length;
            if(len>0){
                vDatosUsuario.user = results.rows.item(0).id;
                vDatosUsuario.name = results.rows.item(0).name;
                vDatosUsuario.email = results.rows.item(0).email;
                vDatosUsuario.job = results.rows.item(0).job_title;
                vDatosUsuario.id_dms = results.rows.item(0).id_dms;
                vDatosUsuario.phone = results.rows.item(0).phone;
                vDatosUsuario.perfil = results.rows.item(0).type;
                vDatosUsuario.id_pdv_dlr = results.rows.item(0).id_pdv_dlr;


                $("#id_dms_user").html(vDatosUsuario.id_dms);
                $("#num_tel").html(vDatosUsuario.phone);
                $("#uid_user").html(vDatosUsuario.user.toLowerCase());
                $("#name_user").html(vDatosUsuario.name);
                $("#email_user").html(vDatosUsuario.email);
                $("#job_user").html(vDatosUsuario.job);                 
                $("#id_dms_dlr").html(vDatosUsuario.id_pdv_dlr); 

                validaPerfil();
            }
        });
    });
}

function get_forms_info(){
    $("#forms_pend").html('0');
    $("#forms_sent").html('0');

    db.transaction(function(cmd2){
        cmd2.executeSql("SELECT status, count(1) as cant FROM tbl_forms_filled where substr(date,1,8) = ? group by status order by status", [getYMD(0)], function (cmd2, results) {
            var len = results.rows.length;
            //console.log(len);
            if(len>0){
                for(i=0; i<len; i++){
                    if(results.rows.item(i).status == 0){
                        $("#forms_pend").html(results.rows.item(i).cant);
                    }else{
                        $("#forms_sent").html(results.rows.item(i).cant);
                    }
                }
            }
        });
    });
}

function show_Forms(){

    //Formularios
    var json_forms = [];
    db.transaction(function(cmd2){
        cmd2.executeSql("SELECT * FROM tbl_forms", [], function (cmd2, results) {
            var len = results.rows.length;
            if(len>0){
                for(j=0;j<len; j++){
                    json_forms.push({id:results.rows.item(j).id, tipo:results.rows.item(j).type, desc:results.rows.item(j).desc});
                }
            }
            var vStr = '';
            vStr = '<table id="tbl1" border="0" cellspacing="0" width="100%" class="tbl_boc">';
            vStr += '<thead><tr><th></th><th></th></tr></thead>';
            vStr += '<tbody>';
            for (i=0; i< json_forms.length; i++){ 
                if(json_forms[i].tipo == 1){            
                    vStr += '<tr>';
                    vStr += '<td width="90%"><a href="#" onclick="desplegarForm(\''+ json_forms[i].id +'\')">'+ json_forms[i].desc + '</a></td>';
                    vStr += '<td><img src="img/form_icon.png" width="30px" /></td>';
                    vStr += '</tr>';
                }       
            }
            vStr += '</tbody>';
            vStr += '</table>';

            $('#tbl_forms').html(vStr);

            // ENCUESTAS
            var vStr = '';
            vStr = '<table id="tbl1" border="0" cellspacing="0" width="100%" class="tbl_boc">';
            vStr += '<thead><tr><th></th><th></th></tr></thead>';
            vStr += '<tbody>';
            for (i=0; i< json_forms.length; i++){    
                if(json_forms[i].tipo == 2){       
                    vStr += '<tr>';
                    vStr += '<td width="90%"><a href="#" onclick="desplegarForm(\''+ json_forms[i].id +'\')">'+ json_forms[i].desc + '</a></td>';
                    vStr += '<td><img src="img/survey_icon.png" width="30px" /></td>';
                    vStr += '</tr>';
                }
            }
            vStr += '</tbody>';
            vStr += '</table>';

            $('#tbl_encs').html(vStr);

        });
    });

    

    

}

function hide_pags(){

    //$("#dvMain").hide();
    $("#dvtitle").html(vTitle); 
    $("#dvHorus").hide();
    $("#dvIncRep").hide();
    $("#pagDMS_forms").hide();
    $("#pag4").hide();
    $("#pag3").hide();
    $("#pag2").hide();
    $("#dvDMS").hide();
    //$("#dvHead").hide();
    $('#dv_forms_template').hide();
    $("#formsRPT").hide();
    $("#dvReporteVentas").hide();
    $("#dvPlanningDMS").hide();

    //Forms DMS    
    $("#forms_enviados").hide();
    $("#forms_pendientes").hide();

    //Reportes Ventas
    $("#sbRtpGlobal").hide();
    $("#sbCierreD").hide();

    //Reportes Gerenciales
    $("#dvRptG").hide();
    $("#dvMainGerencial").hide();

    $("#dvFichaPDV").html('');
    $("#dvFichaPDV").trigger('create');
    try{
        $("#finderPDv1").val('');
        var dvListx= document.getElementById('dvListPDVs');
        document.getElementById('dv_forms_template').removeChild(dvListx);
    }catch(e){null};
}

function takePicture(){
    navigator.camera.getPicture(onSuccess, onFail, { quality: 50, sourceType:Camera.PictureSourceType.CAMERA, correctOrientation:true,
            cameraDirection: Camera.Direction.FRONT, allowEdit: true});

    function onSuccess(imageURI) {        
        var img = new Image();
        img.src = imageURI;
        saveImgtoDB(img);
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }
}

function displayImage(imgUri) {
    $("#imgUser").attr('src', imgUri);
}


function saveImgtoDB(imgFile){
    var cant_rows = 0;
    var arrImg = [];
    var strUrl = '';
    var arrStrUrl = [];
    var arrFile = [];
    img = imgFile;

    setTimeout(function(){   
                imgW = img.width;
                imgH = img.height;
                ratio = (imgH/imgW).toFixed(2);

                var wid = 640;
                var hei = wid*ratio;            

                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                canvas.width=wid;
                canvas.height=hei;
                ctx.drawImage(img, 0, 0, wid, hei);
                var dataurl = canvas.toDataURL("image/jpeg");
                cant = (dataurl.length/4000).toFixed(2);
                //console.log(cant);
                arr_decimal = cant.split('.');
                if(parseInt(arr_decimal[1])>0){
                    cant_rows = parseInt(arr_decimal[0]) + 1;
                }else{
                    cant_rows = parseInt(arr_decimal[0]);
                }
                //console.log(cant_rows);

                for(i=1; i<=cant_rows; i++){
                    //console.log('From:' + (i-1)*4000 + ' To:'+ ((i*4000)-1));
                    //console.log(i +','+ vFile.name + ',' + dataurl.substring((i-1)*4000, ((i*4000)-1)));
                    arrImg.push(dataurl.substring((i-1)*4000, (i*4000)));
                }
                //console.log(arrImg);
                for(j=0;j<arrImg.length; j++){
                    strUrl += arrImg[j].replace('"', '');
                    arrStrUrl.push({user:vDatosUsuario.user, num:j, name:'imgUser', type:'jpeg', dtos:arrImg[j].replace('"', '')});
                    arrFile.push({id_file:vDatosUsuario.user, nombre:'imgUser', tipo:'jpeg', corel:j, dtos:arrImg[j].replace('"', '')});                              
                }

                //console.log(strUrl.length +'-'+ dataurl.length);
                //console.log(strUrl);
                ejecutaSQL('DELETE FROM tbl_files where id_file=\'' + arrStrUrl[0].user + '\'', 0)
                setTimeout(function(){
                    for(i=0;i<arrStrUrl.length; i++){
                        vQry = 'INSERT INTO tbl_files (id_file, correl, name, type, strdtos) VALUES(';
                        vQry += '\'' + arrStrUrl[i].user + '\',' + arrStrUrl[i].num + ',\''  + arrStrUrl[i].name + '\',\'' + arrStrUrl[i].type + '\',\'' + arrStrUrl[i].dtos + '\')';                
                        //console.log(vQry);
                        ejecutaSQL(vQry, 0); 
                    }
                    sendFileToServer(arrFile);

                }, 1000);

                displayImage(strUrl);
            }, 500);     
    
}

function backButton(){
    if(parseInt(pgActual) != 0){        
        for(i=0; i<pagRoot.length; i++){
            if(parseInt(pagRoot[i].id) == parseInt(pgActual)){
                //console.log(pgActual);
                switchMenu(pagRoot[i].id, pagRoot[i].back);
            }
        }
    } 
}
function switchMenu(vIdFrom, vIdTo){
    pgActual = vIdTo;
    pgBack = vIdFrom;
    //console.log('A-' + pgActual + '/B-' + pgBack);

    switch(vIdTo)
    {
        case 0:
            hide_pags();            
            $('#lbl_title').html('DMS EXPERIENCE');            
            $("#dvHead").show();
            $("#dvDMS").show();
            show_datos_user(vDatosUsuario.user); 
            get_forms_info();                                      

        break;
        case 1:            
            $("#pag4").hide();
            $("#pag3").hide();
            $("#pag2").show();
            $("#dvDMS").hide();
            reloadkpi();
        break;
        case 2:            
            hide_pags();
            $('#lbl_title').html('SO - Horus');            
            $("#dvHead").show();
            $("#dvHorus").show();
            
        break;
        case 3:
            hide_pags();
            $("#pagDMS_forms").show();
            $("#forms_list").show();
            $("#forms_enviados").hide();
            $("#forms_pendientes").hide();

            $('#lbl_title').html('DOCUMENTOS DMS');
            $("#dvHead").show();
            show_Forms();
            vfechini = getYMD(0);
            vfechfin = getYMD(0);
            $("#fechIniForm").val(vfechini.substr(0,4) + '-' + vfechini.substr(4,2) + '-' + vfechini.substr(6,2));
            $("#fechFinForm").val(vfechfin.substr(0,4) + '-' + vfechfin.substr(4,2) + '-' + vfechfin.substr(6,2));

        break;
        case 4:
            var aniomes = 0;
            var flag_mes_ac=0;
            var aniomesact = getYMD(0).toString().substr(0,6);
            hide_pags();
            $("#dvReporteVentas").show();
            $("#sbRtpGlobal").show();
            setTimeout(function(){
            db.transaction(function(cmd){ 
                cmd.executeSql('SELECT distinct anomes FROM tbl_ventas order by anomes asc', [], function (cmd, results) {
                    var len = results.rows.length;
                    if(len>0){ $("#anomesRVtas").empty(); $('#anomesRVtas').append('<option value="' + 0 + '" selected="selected">-</option>'); }
                    for(j=0;j<len;j++){
                        aniomes=results.rows[j].anomes;
                        if(parseInt(aniomes)==parseInt(aniomesact)){
                            flag_mes_ac = 1;
                        }
                        //console.log(results.rows[0].semana_anio);                        
                        $('#anomesRVtas').append('<option value="' + results.rows[j].anomes + '">'+ results.rows[j].anomes +'</option>');
                        
                    }  
                    if(flag_mes_ac==0){ 
                        $('#anomesRVtas').append('<option value="' + aniomesact + '" selected="selected">'+ aniomesact +'</option>');
                    }

                    $("#anomesRVtas").val(aniomes);
                    $("#anomesRVtas").selectmenu('refresh');
                    reporteVentas(aniomes);
                });
            });
            },800);
        break;
        case 5:
            var anioCb = getYMD(0).toString().substr(0,4);
            var fech = new Date();
            var weekNum = getWeekNumber(fech);
            var weekDb = 0;

            setTimeout(function(){
            db.transaction(function(cmd){ 
                cmd.executeSql('SELECT distinct semana_anio FROM tbl_plan_dms where substr(aniomes,1,4)=? order by semana_anio desc', [anioCb], function (cmd, results) {
                    var len = results.rows.length;
                    if(len>0){ $("#cbSemanaNum").empty(); $('#cbSemanaNum').append('<option value="' + 0 + '" selected="selected">-</option>'); }
                    for(j=0;j<len;j++){
                        if(weekDb==0){
                            weekDb=results.rows[j].semana_anio;
                        }
                        //console.log(results.rows[0].semana_anio);
                        $('#cbSemanaNum').append('<option value="' + results.rows[j].semana_anio + '">'+ results.rows[j].semana_anio +'</option>');
                    }
                    $('#cbSemanaNum').val(weekDb);
                    $('#cbSemanaNum').selectmenu("refresh");
                    showPlanSemana(weekDb, getYMD(0).toString().substr(0,6));
                });
            });
            },800);
            hide_pags();
            $("#dvPlanningDMS").show();
        break;
        case 6:
            hide_pags();
            $.mobile.loading('show');
            $("#dvRptG").show();
            setTimeout(function(){
            var aniomes_cb1 = getYMD(0).substr(0,6);
            $('#cbAnomesSucs').empty();
            $('#cbAnomesSucs').append('<option value="' + aniomes_cb1 + '">'+ aniomes_cb1 +'</option>');
            db.transaction(function(cmd){ 
                cmd.executeSql('SELECT distinct anomes FROM tbl_ejec_sucursales order by anomes desc', [], function (cmd, results) {
                    var len = results.rows.length;
                    if(len>0){ $("#cbAnomesSucs").empty(); $('#cbAnomesSucs').append('<option value="' + aniomes_cb1 + '" selected="selected">'+ aniomes_cb1 +'</option>'); }
                    for(j=0;j<len;j++){
                        if(results.rows[j].anomes!=aniomes_cb1){
                            $('#cbAnomesSucs').append('<option value="' + results.rows[j].anomes + '">'+ results.rows[j].anomes +'</option>');
                        }
                    }
                    $('#cbAnomesSucs').val(aniomes_cb1);
                    $('#cbAnomesSucs').selectmenu("refresh");                    

                    $("#dvDetSucursal").html('');
                    $("#dvDetSucursalDiario").html('');
                    showDatosSucursales(vDatosUsuario.id_pdv_dlr, $("#cbAnomesSucs").val(), $("#cbProductoDashG").val());
                    $.mobile.loading('hide');
                });
            });
            },800);
        break;
        case 100:
            hide_pags();
            $("#dv_forms_template").show();
            $('#lbl_title').html('DOCUMENTOS DMS');
            $("#dvHead").show();
        break
    }
    $("#dvMenu").panel('close');
}

function saveGPS(vFecha, vLat, vLng, vUser){

    //navigator.vibrate(25); 
    $.ajax({
        type: 'POST',
        data: {m:201,vx:userWS, vy:pdwWS, f:vFecha, lat:vLat, lng:vLng, ui:vUser},        
        dataType:'text',
        url: ws_url,
        success: function(data){
            //alert(data);
            console.log('Sucess Save on Server');
        },
        error: function(data){
            console.log(data);
            //alert(data);
        }
    });
}

function getMapLocation() { 
    navigator.geolocation.getCurrentPosition(onSuccess, onErrorF, { enableHighAccuracy: true });
}

function onSuccess(position){
    d = new Date();
    h = '00';
    m = '00';
    sc = '00';

    if(d.getHours() < 10){
        h = '0' + d.getHours();
    }else{
        h = d.getHours();
    }

    if(d.getMinutes() < 10){
        m = '0' + d.getMinutes();
    }else{
        m = d.getMinutes();
    }

    if(d.getSeconds() < 10){
        sc = '0' + d.getSeconds();
    }else{
        sc = d.getSeconds();
    }

    //console.log(h +'+'+m);
    vLat = position.coords.latitude;
    vLng = position.coords.longitude;


    saveGPS(getYMD(0) + h + m + sc, position.coords.latitude, position.coords.longitude, vDatosUsuario.user); 
    setMark(position.coords.latitude, position.coords.longitude);

    vQre = 'DELETE FROM tbl_kmtrs';
    ejecutaSQL(vQre, 0);

    setTimeout(function(){

        if(lat1 != 0 && lng1 !=0){
            vD = getDistanceFromLatLonInKm(lat1, lng1, vLat,vLng);
            //console.log(vD);
            vDistance += parseFloat(vD);
        }else{
            vDistance = 0;
        }
        
        vQre = 'insert into tbl_kmtrs (user, fech, lat1, lng1, kmtr) ';
        vQre += 'values (\''+ vDatosUsuario.user +'\',' + (getYMD(0) + ''+ getHMS()) +',' + vLat +',' + vLng +','+ vDistance +')';
        ejecutaSQL(vQre, 0);

        lat1 = vLat;
        lng1 = vLng;

        setMark(position.coords.latitude, position.coords.longitude);
        if(vFechIniHorus != 0){
            $("#dvHoraini").html('<b>Hora Inicio</b><br/>' + getFechFormated(vFechIniHorus));
        }else{
            $("#dvHoraini").html('<b>Hora Inicio</b><br/>-');
        }        
        $("#kmts_num").html('<h2>' + vDistance.toFixed(2) + ' Kmts.</h2>');

    }, 100); 
    
    //$("#test").append(d.getHours() +':'+ d.getMinutes() + '<br />' + position.coords.latitude + '/' + position.coords.longitude + '<br />');
    //navigator.vibrate(100);
}
function onErrorF(error){
    window.plugins.toast.show(error, 1000, 'bottom'); 
    console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
}


function reloadkpi(){
    vUser = vDatosUsuario.user;

    var vHtml = '';
    var json_result = [];
    var pros_mbl = 0;
    var pros_mbl_meta = 0;
    var pros_mbl_prom = 0;
    var pros_home = 0;
    var pros_home_meta = 0;
    var pros_home_prom = 0;
    var vendedor = vUser;

    var anomes = getYearMoth(0);

    $.ajax({
        type: 'POST',
        data: {m:102,vx:userWS, vy:pdwWS, ui:vUser, f:anomes},        
        dataType:'json',
        url: ws_url,
        beforeSend: function(){
            $.mobile.loading( 'show', {
                text: 'Cargando...',
                textVisible: true,
                theme: 'a',
                html: ""
            });
        },
        success: function(data){
            //alert(data);
            console.log(data);
            json_result = data;
            for(i=0; i<json_result.length; i++){
                vendedor = json_result[i].vendedor;
                if(json_result[i].id_kpi == 101){
                    pros_mbl = parseInt(json_result[i].prospecciones);
                    pros_mbl_meta = parseInt(json_result[i].meta);
                    pros_mbl_prom = (pros_mbl/pros_mbl_meta)*100;

                }else if(json_result[i].id_kpi == 102){
                    pros_home = parseInt(json_result[i].prospecciones);
                    pros_home_meta = parseInt(json_result[i].meta);
                    pros_home_prom = (pros_mbl/pros_mbl_meta)*100;
                }
            }

        },
        error: function(data){
            console.log(data);
            //alert(data);
        },
        complete: function(){
            //console.log(pros_mbl);
            vHtml += '<table border="0" width="100%">'                                    
            vHtml += ' <tr><td width="50%">Prop. MBL</td>'
            vHtml += ' <td width="16%" align="center">' + pros_mbl + '</td>'
            vHtml += ' <td width="16%" align="center">'+ pros_mbl_meta +'</td>'
            vHtml += ' <td align="right">'+ pros_mbl_prom.toFixed(2) +'%</td>'
            vHtml += ' </tr><tr>'
            vHtml += ' <td>Prop. Home</td>'
            vHtml += ' <td width="16%" align="center">' + pros_home + '</td>'
            vHtml += ' <td width="16%" align="center">'+ pros_home_meta +'</td>'
            vHtml += ' <td align="right">'+ pros_home_prom.toFixed(2) +'%</td>'
            vHtml += ' </tr></table>'

            $("#lbl_p_home").html(pros_home);
            $("#lbl_p_mbl").html(pros_mbl);   
            $("#vdr_name").html(vendedor); // vDatosUsuario.user) ;
            $("#tbl_content").html(vHtml);

            setTimeout(function(){
                $.mobile.loading('hide');
            }, 400);
        }
    });
}


function tracking(){

    if(vFlagTracking ==  false){
        db.transaction(function(cmd2){
            cmd2.executeSql("SELECT * FROM tbl_kmtrs", [], function (cmd2, results) {
                var len = results.rows.length;
                if(len>0){
                    lat1 = results.rows.item(0).lat1;
                    lng1 = results.rows.item(0).lng1;
                    vDistance = results.rows.item(0).kmtr;
                    vFechIniHorus = results.rows.item(0).fech;
                }else{
                    lat1 = 0;
                    lng1 = 0;
                    vDistance = 0;
                    vFechIniHorus = getYMD(0) +''+ getHMS();
                }
            });
        });

        cordova.plugins.backgroundMode.setEnabled(true); 
        clearInterval(vIntervalGeo);
        console.log('starting..');
        $("#startGPS").hide();
        $("#stopGPS").show();

        vFlagTracking = true;
        getMapLocation();
        vIntervalGeo = setInterval(function(){ getMapLocation(); }, vTimerGPS);

    }else{
        $("#startGPS").show();
        $("#stopGPS").hide();
        clearInterval(vIntervalGeo);
        vFlagTracking = false;
        cordova.plugins.backgroundMode.setEnabled(false); 
        vQre = 'DELETE FROM tbl_kmtrs';
        ejecutaSQL(vQre, 0);
    }
}

function logout(){
    //console.log(vDatosUsuario.user);
    logInOut(vDatosUsuario.user, 0);
    setTimeout(function(){ window.location.replace('index.html?user=0&login=0'); }, 800);
}

//Sleep 
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function getParams(param) {
    var vars = {};
    window.location.href.replace( location.hash, '' ).replace( 
        /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
        function( m, key, value ) { // callback
            vars[key] = value !== undefined ? value : '';
        }
    );

    if ( param ) {
        return vars[param] ? vars[param] : null;    
    }
    return vars;
}

function getYearMoth(vM){
    var vResult = '';
    var year = 0;
    var mes = 0;
    year = parseInt(getYMD(0).substring(0,4));
    mes = parseInt(getYMD(0).substring(4,6));

    mes = mes + vM
    if(mes < 1){
        mes = 12 + mes;
        year = year - 1
    }
    if(mes <10){
        vResult = year + "0" + mes;
    }else{
        vResult = year + "" + mes;
    }

    return vResult;
}

function getYMD(vDays){
    var vToday = new Date();
    var time = vToday.getTime();
    var milsecs = parseInt(vDays*24*60*60*1000);
    vToday.setTime(time + milsecs);

    var strDate = '';
    strDate = vToday.getFullYear();

    if(parseInt(vToday.getMonth() + 1) < 10 ){
        strDate += '0' + (vToday.getMonth()+1);
    }else{
        strDate += '' + (vToday.getMonth()+1);
    }
    if(parseInt(vToday.getDate()) < 10 ){
        strDate += '0' + vToday.getDate();
    }else{
        strDate += '' + vToday.getDate();
    }
    return strDate;
}

function getHMS(){
    var vToday = new Date();
    var time = vToday.getTime();
    //var milsecs = parseInt(vDays*24*60*60*1000);
    vToday.setTime(time);
    var strDate = '';

    if(parseInt(vToday.getHours()) < 10 ){
        strDate += '0' + (vToday.getHours());
    }else{
        strDate += '' + (vToday.getHours());
    }
    if(parseInt(vToday.getMinutes()) < 10 ){
        strDate += '0' + vToday.getMinutes();
    }else{
        strDate += '' + vToday.getMinutes();
    }
    if(parseInt(vToday.getSeconds()) < 10 ){
        strDate += '0' + vToday.getSeconds();
    }else{
        strDate += '' + vToday.getSeconds();
    }

    return strDate;
}



function getMonthName(vMonth){
    var ArrNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul','Ago','Sep','Oct', 'Nov', 'Dic'];
    return ArrNames[parseInt(vMonth)-1];
}
  


//Decodificador de datos
function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}


//Codificador de datos
function str2Hex(strVar) {
    var hex = '';//force conversion
    var str = '';
    for (var i = 0; i < strVar.length; i ++)
        hex += '' + strVar.charCodeAt(i).toString(16); //  String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return hex;
}

//Decodificador Base64
function b64_to_str(vStr){
	return decodeURIComponent(escape(window.atob(vStr)));
}


function setMark(latitude, longitude) {
    var latLong = new google.maps.LatLng(latitude, longitude);
    markHorus.setPosition(latLong);
    map.setZoom(12);
    map.setCenter(markHorus.getPosition());
}


function getBase64(file) {
   var reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = function () {
     //console.log(reader.result);
   };
   reader.onerror = function (error) {
     //console.log('Error: ', error);
   };
}


function resize_img(){

    setTimeout(function(){ 
        wuser = $("#imgUser").width()*1.02; 
        //console.log('Resizin img - ' + wuser);
        $("#imgUser").css('height', 
        wuser); }, 
    200);
}

function desplegarForm(vIdForm, callback){
    var vStrFrom = '';
    var vItems;
    var vFlag = 0;

    //console.log(vIdForm);
    db.transaction(function(cmd){   
        cmd.executeSql('SELECT * FROM tbl_forms where id =?', [vIdForm], function (cmd, results) {
            var len = results.rows.length;

            for(i=0; i<len; i++){
               vItems = JSON.parse(results.rows.item(i).dtos);
               //console.log(vItems);
               drawForm(vItems, vIdForm, results.rows.item(i).scripts);
               vFormData = {id_form:vIdForm + '_' + getYMD(0) + getHMS(), vdata:vItems};
               //console.log(vFormData);
            }   
        });
    });
}

function drawForm(vItems, vtittle, vScript){
    //console.log(vItems);
    vStrForm = '';
    vStrForm += '<div class="custom-corners"><div class="ui-bar ui-bar-a"><h3>'+ vtittle +'</h3></div>';
    vStrForm += '<div class="ui-body ui-body-a">';
    var temp = [];
    for (j=0; j<vItems.length; j++){
        //console.log(vStrForm);
        temp.push(drawObject(parseInt(vItems[j].tipo), vItems[j].id, vItems[j].name, eval(vItems[j].ops), vItems[j].func));
        vStrForm += temp[j];
    }
    
    vStrForm +=  drawObject(201, 'btn1', 'Continuar', [], 'null');
    vStrForm += '<script type="text/javascript">';
    vStrForm += vScript; //'setTimeout(function(){ $("#Q3").parent().hide();  $(\'label[for="Q3"]\').hide();}, 500);';
    //vStrForm += '$("#btn1").on("click", function(){ alert("0"); setTimeout(function(){continuarForms();},500)});';
    /*vStrForm += 'function show(){ alert(\'hello \' + $("#txt1").val() + \'-\'+ $("#txt8").val());  } ';
    vStrForm += 'function chngOp1(){ if($("#op1").val()=="1001"){ $("#txt8").parent().hide(); $(\'label[for="txt8"]\').hide();}else{ $("#txt8").parent().show(); $(\'label[for="txt8"]\').show(); } }'; 
    */
    vStrForm += '</script>';
    vStrForm += "</div></div>";
    //console.log(vStrForm)
    
    switchMenu(3, 100);

    $('#dv_forms_template_content').html(vStrForm);
    $('#dv_forms_template_content').trigger('create');
}



function drawObject(vTipo, vId, vNombre, vOptions, vfunc){
    var vStr = '';
    
    switch(vTipo)
    {
        case 101:
            vStr += '<div id="dv'+ vId +'" style="margin-bottom="18px"><label for="'+ vId +'">'+ vNombre +'</label><input type="text" id="'+ vId +'" /></div>';
        break;
        case 111:
            vStr += '<div id="dv'+ vId +'" style="margin-bottom:18px"><label for="'+ vId +'">'+ vNombre +'</label><input type="number" id="'+ vId +'" /></div>';
        break; 
        case 112:
            vStr += '<input type="hidden" id="'+ vId +'" />';
        break;     
        case 102:
            vStr += '<div id="dv'+ vId +'" style="margin-bottom:18px"><label for="'+ vId +'">'+ vNombre +'</label><textarea id="'+ vId +'"></textarea></div>';
        break;
        case 103:
            vStr += '<div id="dv'+ vId +'" style="margin-bottom:18px"><label for="'+ vId +'">'+ vNombre +'</label>';
            vStr += '<select id="'+ vId +'" onchange="'+ vfunc +'">';
            for(i=0; i<vOptions.length; i++){
                vStr += '<option value="'+ vOptions[i] +'">'+ vOptions[i] +'</option>';
            }
            vStr += '</select></div>';
        break;
        case 104:
            vStr += '<fieldset data-role="controlgroup" id="dv'+ vId +'" style="margin-bottom:18px"><legend>'+ vNombre +'</legend>';
            for(i=0; i<vOptions.length; i++){
                vStr += '<input type="radio" name="'+ vId + '" id="' + vId + vOptions[i] +'" value="'+ vOptions[i] +'">';
                vStr += '<label for="'+  vId + vOptions[i] +'">'+ vOptions[i] +'</label>';
            }
            vStr += '</fieldset><br />';
        break;
        case 105:
            vStr += '<fieldset data-role="controlgroup" id="dv'+ vId +'" style="margin-bottom:18px"><legend>'+ vNombre +'</legend>';
            for(i=0; i<vOptions.length; i++){
                vStr += '<input type="checkbox" name="'+ vId + '" id="'+ vId + vOptions[i] +'" value="'+ vOptions[i] +'">';
                vStr += '<label for="'+ vId + vOptions[i] +'">'+ vOptions[i] +'</label>';
            }
            vStr += '</fieldset><br />';
        break;
        case 201:
            vStr += '<br /><center><button id="'+ vId +'" onclick="'+ vfunc + '" data-theme="b" style="width:60%">'+ vNombre +'</button></center>';
        break;
    }    
    return vStr;
}

// Fumcion para obtener formularios del servidor
function updateForms(){
    $.ajax({
        type: 'POST',
        data: {m:301,vx:userWS, vy:pdwWS, ui:vDatosUsuario.user},        
        dataType:'json',
        url: ws_url,
        beforeSend: function(){
            $.mobile.loading( 'show', {
                text: 'Cargando...',
                textVisible: true,
                theme: 'a',
                html: ""
            });
        },
        success: function(data){
            //console.log(data);
            vQry = '';
            vQry = 'DELETE FROM tbl_forms';
            ejecutaSQL(vQry, 0); 

            for(i=0;i<data.length; i++){
                vQry = 'INSERT INTO tbl_forms (id, desc, type, version, dtos, scripts, udt_dt) VALUES(';
                vQry += '\'' + data[i].id + '\',\'' + data[i].desc + '\','  + data[i].tipo + ',' + data[i].ver + ',\'' + JSON.stringify(data[i].data) + '\',\''+ data[i].vscript +'\',\'' + data[i].udt_dt + '\')';                
                //console.log(vQry);
                ejecutaSQL(vQry, 0); 
            }
        }, 
        error: function(e){
            console.log(e);
            $.mobile.loading( 'show', {
                text: 'Servidor no responde.',
                textVisible: true,
                theme: 'a',
                html: ""
            });
        },
        complete: function(e){
            //console.log(e);
            show_Forms();
            setTimeout(function(){
                $.mobile.loading('hide');
            }, 1000);
        }
    });

}


function formsList(){
    show_Forms();
    $("#forms_list").show();
    $("#forms_enviados").hide();
    $("#forms_pendientes").hide();
    $("#formsRPT").hide();
}


function formsEnviados(){    

    vIni = $("#fechIniForm").val().replace('-', '').replace('-', '');
    vFin = $("#fechFinForm").val().replace('-', '').replace('-', '');

    $.mobile.loading('show');

    db.transaction(function(cmd){   
        cmd.executeSql('SELECT * FROM tbl_forms_filled where status =? and substr(date,1,8) between ? and ?', [1, vIni, vFin], function (cmd, results) {
            var len = results.rows.length;
            vStrHtml = '';
            vStrHtml += '<table data-role="table" data-mode="columntoggle" class="table-stripe ui-responsive">';
            vStrHtml +=  '<thead><tr><th data-priority="2">ID</th><th data-priority="0">Formulario</th><th data-priority="1">fecha</th></tr></thead>';
            vStrHtml +=  '<tbody>';
            //console.log(len);
            for(i=0; i<len; i++){
                vName = results.rows[i].id_form.split('_')
                vStrHtml +=  '<tr>';
                vStrHtml +=  '<td>'+ results.rows[i].id_form +'</td>';
                vStrHtml +=  '<td><a href="#" onclick="prevForm(\''+ results.rows[i].id_form  +'\', 0)">'+ vName[0] +' </a></td>';
                vStrHtml +=  '<td>'+ results.rows[i].date.toString().substr(0,8) + ' '
                vStrHtml +=  results.rows[i].date.toString().substr(8,2) +':'+ results.rows[i].date.toString().substr(10,2) + '</td>';
                vStrHtml +=  '</tr>';
            }   
            vStrHtml +=  '</tbody>';
            vStrHtml +=  '</table>';
            //console.log(vStrHtml);
            $("#tbl_forms_enviados").html(vStrHtml);
            $("#tbl_forms_enviados").trigger('create');
            $.mobile.loading('hide');
        });
    });
    $("#formsRPT").hide();
    $("#forms_list").hide();
    $("#forms_pendientes").hide();
    $("#forms_enviados").show();
}

function formsPendientes(){
    vFormsPendientes = [];

    $.mobile.loading('show');

    db.transaction(function(cmd){   
        cmd.executeSql('SELECT * FROM tbl_forms_filled where status =?', [0], function (cmd, results) {
            var len = results.rows.length;
            vStrHtml = '';
            vStrHtml += '<table data-role="table" data-mode="columntoggle" class="table-stripe">';
            vStrHtml +=  '<thead><tr><th data-priority="1">ID</th><th data-priority="0">Formulario</th><th>fecha</th></tr></thead>';
            vStrHtml +=  '<tbody>';
            for(i=0; i<len; i++){
                vFormsPendientes.push({id_form:results.rows[i].id_form, vdata:results.rows[i].dtos, fech:results.rows[i].date, lat:results.rows[i].lat, lng:results.rows[i].lng});
                vName = results.rows[i].id_form.split('_')
                vStrHtml +=  '<tr>';
                vStrHtml +=  '<td>'+ results.rows[i].id_form +'</td>';
                vStrHtml +=  '<td><a href="#" onclick="prevForm(\''+ results.rows[i].id_form  +'\', 0)">'+ vName[0] +'</a></td>';
                vStrHtml +=  '<td>'+ results.rows[i].date.toString().substr(0,8) + ' '
                vStrHtml +=  results.rows[i].date.toString().substr(8,2) +':'+ results.rows[i].date.toString().substr(10,2) + '</td>';
                vStrHtml +=  '</tr>';
            }   
            vStrHtml +=  '</tbody>';
            vStrHtml +=  '</table>';
            //console.log(vStrHtml);
            $("#tbl_forms_pendientes").html(vStrHtml);
            $("#tbl_forms_pendientes").trigger('create');
            $.mobile.loading('hide');
        });
    });
    
    $("#formsRPT").hide();
    $("#forms_list").hide();
    $("#forms_pendientes").show();
    $("#forms_enviados").hide();


}

function envioFormsPend(){
    var contForms = 0;
    var contRegs = 0;
    for(i=0; i<vFormsPendientes.length; i++){
        $.mobile.loading('show');
        //console.log(vFormsPendientes); 

        $.ajax({
            url:ws_url,
            type:'POST',
            data:{m:302,vx:userWS, vy:pdwWS, ui:vDatosUsuario.user, forms:vFormsPendientes[i]},        
            dataType:'text',
            success: function(data){
                //console.log(i);
                var vflag = data.split('/');
                if(vflag[0] == 'SUCCESS'){
                    vQuery = 'UPDATE tbl_forms_filled SET status=1 where id_form=\'' + vflag[1] + '\'';
                    ejecutaSQL(vQuery, 0);                        
                    contForms ++;
                }else{
                    console.log(data);
                }           
            }, 
            error: function(error){
                //console.log('error');
                $.mobile.loading( 'show', {
                    text: '',
                    textVisible: true,
                    textonly:true,
                    theme: 'a',
                    html: '<span><center><img src="img/noconection.png" width="60px" /></center><br />Servidor no responde.</span>'
                });
                setTimeout(function(){  $.mobile.loading('hide'); }, 2000);
            },
            complete: function(e){
                //console.log(e);
                contRegs++;                
                if(contRegs==vFormsPendientes.length){
                    $.mobile.loading( 'show', {
                        text: ' [' + contForms + '] Forms Enviados Correctamente',
                        textVisible: true,
                        textonly:true,
                        theme: 'a',
                        html: ''
                    });
                    setTimeout(function(){  $.mobile.loading('hide'); 
                    formsPendientes(); }, 2000);
                }
            }
        });
    }   
}

function continuarForms(){   

    var tempForm = [];
    var temArr = [];
    tempForm.push({id_form:'', vdata:[], fech:'', lat:0, lng:0});
    tempForm[0].id_form = vFormData.id_form;

    $.mobile.loading('show');
    try{
        getMapLocation();
    }catch(e){
        console.log(e);
    }

    try{
    setTimeout(function(){
        var vItem;
        var x1;

        for(i=0; i<vFormData.vdata.length; i++){
            //console.log(vFormData.vdata);
            switch(parseInt(vFormData.vdata[i].tipo)){
                case 104:
                    vItem = document.getElementsByName(vFormData.vdata[i].id);
                    //console.log(vItem);
                    for(j=0; j<vItem.length; j++){
                        //console.log(vItem[j]);
                        if(vItem[j].checked == true){
                            x1 = vItem[j].value;
                        }
                    }
                break;
                case 105:
                    var contT = 0;
                    vItem = document.getElementsByName(vFormData.vdata[i].id);
                    //console.log(vItem);
                    for(j=0; j<vItem.length; j++){
                        console.log(vItem[j]);
                        if(vItem[j].checked == true){
                            if(contT==0){                                     
                                x1 = vItem[j].value;
                                contT = 1;
                            }else{     
                                x1 += ';' + vItem[j].value;
                            }                      
                        }
                    }
                break;
                default:
                    x1 = document.getElementById(vFormData.vdata[i].id).value;        
            }
            temArr.push({q:vFormData.vdata[i].name, r:x1});
            
        }

        tempForm[0].vdata = JSON.stringify(temArr);
        tempForm[0].fech = getYMD(0) + getHMS();
        tempForm[0].lat = vLat;
        tempForm[0].lng = vLng;
        
        vFormData = tempForm;
        //console.log(vFormData[0].id_form);
        prevForm(vFormData[0].id_form, 1);

    }, 4000);
    }catch(e){
        console.log(e);
        alert('Error Generando Formulario');
    }
}

function envioForm(){

    $.ajax({
            url:ws_url,
            type:'POST',
            data:{m:302,vx:userWS, vy:pdwWS, ui:vDatosUsuario.user, forms:vFormData[0]},        
            dataType:'text',
            success: function(data){
                //console.log(data);
                var vflag = data.split('/');
                if(vflag[0] == 'SUCCESS'){
                    vQuery = 'INSERT INTO tbl_forms_filled (id_form, dtos, date, status, lat, lng) ';
                    vQuery += 'VALUES(\'' +  vFormData[0].id_form + '\',\'' + (vFormData[0].vdata).toString() + '\',' + vFormData[0].fech + ',1,';
                    vQuery += vFormData[0].lat + ','+ vFormData[0].lng  +')';
                    ejecutaSQL(vQuery, 0);        

                    $.mobile.loading( 'show', {
                        text: 'Formulario enviado correctamente.',
                        textVisible: true,
                        textonly:true,
                        theme: 'a',
                        html: ''
                    });
                    setTimeout(function(){  $.mobile.loading('hide'); backButton(); }, 1200);
                }else{
                    $.mobile.loading( 'show', {
                        text: 'Error al intentar salvar formulario.',
                        textVisible: true,
                        textonly:true,
                        theme: 'a',
                        html: ''
                    });
                    setTimeout(function(){  $.mobile.loading('hide'); backButton(); }, 1200);
                }
                

            }, 
            error: function(error){
                $.mobile.loading( 'show', {
                    text: '',
                    textVisible: true,
                    textonly:true,
                    theme: 'a',
                    html: '<span><center><img src="img/noconection.png" width="60px" /></center><br />Servidor no responde.<br />Guardando Localmente</span>'
                });
                vQuery = 'INSERT INTO tbl_forms_filled (id_form, dtos, date, status, lat, lng) ';
                vQuery += 'VALUES(\'' +  vFormData[0].id_form + '\',\'' + (vFormData[0].vdata).toString() + '\',' + vFormData[0].fech + ',0,';
                vQuery += vFormData[0].lat + ','+ vFormData[0].lng  +')';
                ejecutaSQL(vQuery, 0);

                setTimeout(function(){  
                    $.mobile.loading('hide'); 
                    backButton();
                }, 2000);
            }
        });  
    //}, 4000);       
}

function guardarForm(){

    $.mobile.loading( 'show', {
        text: '',
        textVisible: true,
        textonly:true,
        theme: 'a',
        html: '<span>Guardando Localmente</span>'
    });

    try{
    
    vQuery = 'INSERT INTO tbl_forms_filled (id_form, dtos, date, status, lat, lng) ';
    vQuery += 'VALUES(\'' +  vFormData[0].id_form + '\',\'' + (vFormData[0].vdata).toString() + '\',' + vFormData[0].fech + ',0,';
    vQuery += vFormData[0].lat + ','+ vFormData[0].lng  +')';
    ejecutaSQL(vQuery, 0);

    $.mobile.loading( 'show', {
        text: 'Guardado Exitosamente',
        textVisible: true,
        textonly:true,
        theme: 'a',
        html: ''
    });

      
    }catch(e){
        console.log(e);
        $.mobile.loading( 'show', {
        text: 'No se pudo guardar el formulario',
        textVisible: true,
        textonly:true,
        theme: 'a',
        html: ''
    });        
    } 
    setTimeout(function(){  
        $.mobile.loading('hide'); 
        backButton();
    }, 2000); 
}


function prevForm(vIdForm, vFlag){
    //console.log(vIdForm);
    pgActual = 101;
    var StrHtml = '';
    var arrItems = [];
    try{
        if(vFlag == 0){
            db.transaction(function(cmd){   
                cmd.executeSql('SELECT * FROM tbl_forms_filled where id_form =?', [vIdForm], function (cmd, results) {
                    var len = results.rows.length;
                    if(len>0){
                        //console.log(results.rows[0].id_form);
                        StrHtml += '<p><b>Id Formulario:</b> <br />'+ results.rows[0].id_form +'</p>';
                        StrHtml += '<p><b>Fecha:</b> <br />'+ results.rows[0].date +'</p>';
                        if(parseInt(results.rows[0].status) == 1){
                            StrHtml += '<p><b>Estado:</b> <br />Enviado</p>';
                        }else{                    
                            StrHtml += '<p><b>Estado:</b> <br />Pendiente</p>';
                        }
                        StrHtml += '<p><b>Lat/Lng:</b> <br />'+ results.rows[0].lat +' / '+ results.rows[0].lng +'</p>';
                        StrHtml += '<hr />';
                        arrItems = eval(results.rows[0].dtos);
                        //console.log(arrItems);
                        for(i=0; i<arrItems.length; i++){
                            StrHtml += '<p><b>'+arrItems[i].q +'</b> <br />&nbsp;&nbsp;'+ arrItems[i].r +'</p>';
                        }
                        StrHtml += '<hr /><br />';

                        $("#formRPT_Det").html(StrHtml);
                        $("#formsRPT").show();
                        $("#forms_list").hide();
                        $("#forms_pendientes").hide();
                        $("#forms_enviados").hide();
                        $.mobile.loading('hide');
                    }
                });
            });
        }
        else{
            StrHtml += '<p><b>Id Formulario:</b> <br />'+ vFormData[0].id_form +'</p>';
            StrHtml += '<p><b>Fecha:</b> <br />'+ vFormData[0].fech +'</p>';                  
            StrHtml += '<p><b>Estado:</b> <br />Pendiente</p>';
            StrHtml += '<p><b>Lat/Lng:</b> <br />'+ vFormData[0].lat +' / '+ vFormData[0].lng +'</p>';
            StrHtml += '<hr />';
            arrItems = eval(vFormData[0].vdata);
            //console.log(arrItems);
            for(i=0; i<arrItems.length; i++){
                StrHtml += '<p><b>'+arrItems[i].q +'</b> <br />&nbsp;&nbsp;'+ arrItems[i].r +'</p>';
            }
            StrHtml += '<hr /><table width="100%"><tr><td width="50%"><button id=\'sendForm\' onclick="envioForm()" data-theme="b">Enviar</button></td>';
            StrHtml += '<td><button id=\'saveForm\' onclick="guardarForm()" data-theme="a">Guardar</button></td></tr></table><br />';

            $("#formRPT_Det").html(StrHtml);

            $("#formRPT_Det").trigger('create');
            $("#formsRPT").show();
            $("#pagDMS_forms").show();
            $("#forms_list").hide();
            $("#forms_pendientes").hide();
            $("#forms_enviados").hide();  
            $("#dv_forms_template").hide();
            $.mobile.loading('hide');
            
        }
    }catch(e){
        console.log(e);
    }
}


function validaCampo(vDato, vTipo){
    var result;

    switch(vTipo){
        //Numerico
        case 0:
            if (/^\s*$/.test(vDato)){
                result = 0;
            }else{
                if(/[0-9]/.test(vDato)){
                    result = vDato;
                }else{
                    result = 0;
                }
            }
        break;
        //Alfanumerico
        case 1:
            if (/^\s*$/.test(vDato)){
                result ='-';
            }else{
                result = vDato;                
            }
        break;
        default:
            result = 0;
        break;
    }
    return result;
}


function sendFileToServer(vArrFile){
    $.ajax({
        url:ws_url,
        type:'POST',
        data:{m:303,vx:userWS, vy:pdwWS, arrFile:vArrFile},        
        dataType:'text',
        success: function(data){
            console.log(data);
        }, 
        error: function(error){
            console.log(error);
        }
    });  
}

function getFileToServer(vFileId){

    var result;
    var strImg = '';
    $.ajax({
        url:ws_url,
        type:'POST',
        data:{m:304,vx:userWS, vy:pdwWS, idFile:vFileId},        
        dataType:'text',
        success: function(data){
            result = eval(data);
            //console.log(result);
            ejecutaSQL('DELETE FROM tbl_files where id_file=\'' + result[0].id_file + '\'', 0)
            setTimeout(function(){
                for(i=0;i<result.length; i++){
                    strImg += result[i].dtos;
                    vQry = 'INSERT INTO tbl_files (id_file, correl, name, type, strdtos) VALUES(';
                    vQry += '\'' + result[i].id_file + '\',' + result[i].corel + ',\''  + result[i].name + '\',\'' + result[i].tipo + '\',\'' + result[i].dtos + '\')';                
                    //console.log(vQry);
                    ejecutaSQL(vQry, 0); 
                }
                //console.log('Img Saved Done');
                if(strImg.length>=10){
                    displayImage(strImg);                    
                }else{
                    displayImage('img/salesman.png');
                }
            }, 1000);
        }, 
        error: function(error){
            console.log(error);
        }
    });  
}



function reporteVentas(vaniomes){

    var vSeries = [];
    var vCats= [];
    var vMetas = [];
    var vEjecucion = [];
    var vResult;
    var query = '';
    var temp1=0;

    if(vaniomes==0){
        vaniomes =  getYMD(0).substr(0,6);
    }

    $("#epin_eje").html(0);
    $("#epin_met").html(0);
    $("#epin_res").html(0);
    $("#tmy_eje").html(0);
    $("#tmy_met").html(0);
    $("#tmy_res").html(0);
    $("#tar_eje").html(0);
    $("#tar_met").html(0);
    $("#tar_res").html(0);
    $("#tvs_eje").html(0);
    $("#tvs_met").html(0);
    $("#tvs_res").html(0);
    $("#smt_eje").html(0);
    $("#smt_met").html(0);
    $("#smt_res").html(0);
    $("#sim_eje").html(0);
    $("#sim_met").html(0);
    $("#sim_res").html(0);

    //console.log(vaniomes);
    db.transaction(function(cmd){   
        cmd.executeSql('SELECT anomes, producto, unidad, sum(meta) as meta, sum(monto) as monto FROM tbl_ventas where id_dms=? and anomes=? group by anomes, producto, unidad', [parseInt(vDatosUsuario.id_dms), parseInt(vaniomes)], function (cmd, results) {
            var len = results.rows.length;
            if(len>0){
                for(i=0; i<len; i++){
                    //console.log(results.rows[0].producto);
                    vCats.push(results.rows[i].producto);
                    vMetas.push(parseInt(results.rows[i].meta));
                    if(parseInt(results.rows[i].meta)>0){
                        temp1 = (parseFloat(results.rows[i].monto)/parseFloat(results.rows[i].meta))*100;
                    }else{
                        temp1 = 100;
                    }
                    vEjecucion.push(parseInt(temp1.toFixed(0)));

                    if(results.rows[i].producto.toUpperCase() == 'EPIN'){
                        $("#epin_eje").html((results.rows[i].monto).toLocaleString('en'));
                        $("#epin_met").html((results.rows[i].meta).toLocaleString('en'));
                        $("#epin_res").html(temp1.toFixed(0));

                    }else if(results.rows[i].producto.toUpperCase() == 'TIGO MONEY'){
                        $("#tmy_eje").html((results.rows[i].monto).toLocaleString('en'));
                        $("#tmy_met").html((results.rows[i].meta).toLocaleString('en'));
                        $("#tmy_res").html(temp1.toFixed(0));
                    }else if(results.rows[i].producto.toUpperCase() == 'TARJETA'){
                        $("#tar_eje").html((results.rows[i].monto).toLocaleString('en'));
                        $("#tar_met").html((results.rows[i].meta).toLocaleString('en'));
                        $("#tar_res").html(temp1.toFixed(0));
                    }else if(results.rows[i].producto.toUpperCase() == 'TARJETA_VAS'){
                        $("#tvs_eje").html((results.rows[i].monto).toLocaleString('en'));
                        $("#tvs_met").html((results.rows[i].meta).toLocaleString('en'));
                        $("#tvs_res").html(temp1.toFixed(0));
                    }else if(results.rows[i].producto.toUpperCase() == 'SMARTPHONES'){
                        $("#smt_eje").html((results.rows[i].monto).toLocaleString('en'));
                        $("#smt_met").html((results.rows[i].meta).toLocaleString('en'));
                        $("#smt_res").html(temp1.toFixed(0));
                    }else if(results.rows[i].producto.toUpperCase() == 'SIMCARDS'){
                        $("#sim_eje").html((results.rows[i].monto).toLocaleString('en'));
                        $("#sim_met").html((results.rows[i].meta).toLocaleString('en'));
                        $("#sim_res").html(temp1.toFixed(0));
                    }
                }               
            }

            vSeries = [{name:'meta', data:vMetas}, {name:'ejecutado', data:vEjecucion}];
            //console.log(vSeries);

            $("#sbRtpGlobal").show();    
            $("#sbCierreD").hide();

            drawChart1('chart1', 'Resultado Mensual', '201809', '%', vSeries,  vCats);

            setTimeout(function(){  
                $.mobile.loading('hide'); 
            }, 2000);
        });
    });
}

function cierresDiarios(vFecha){
    var vSeries = [];
    var vCats= [];
    var vMetas = [];
    var vEjecucion = [];
    var vResult;
    var query = '';
    var temp1=0;
    var tot_cierre = 0;

    if(vFecha==0){
        vaniomes = getYMD(0);
        $("#fechRCierreD").val(vaniomes.substr(0,4)+'-'+vaniomes.substr(4,2)+'-'+vaniomes.substr(6,2));
    }else{      
        vaniomes=vFecha;
    }
    //console.log(vaniomes);
    $("#epin2_eje").html(0);
    $("#tmy2_eje").html(0);
    $("#tar2_eje").html(0);
    $("#tvs2_eje").html(0);
    $("#smt2_eje").html(0);
    $("#sim2_eje").html(0);

    //console.log(vaniomes);
    db.transaction(function(cmd){   
        cmd.executeSql('SELECT particion, producto, unidad, sum(meta) as meta, sum(monto) as monto FROM tbl_ventas where id_dms=? and particion=? group by anomes, producto, unidad', [parseInt(vDatosUsuario.id_dms), parseInt(vaniomes)], function (cmd, results) {
            var len = results.rows.length;
            if(len>0){
                for(i=0; i<len; i++){
                    //console.log(results.rows[0].producto);
                    vCats.push(results.rows[i].producto);
                    /*vMetas.push(parseInt(results.rows[i].meta));
                    if(parseInt(results.rows[i].meta)>0){
                        temp1 = (parseFloat(results.rows[i].monto)/parseFloat(results.rows[i].meta))*100;
                    }else{
                        temp1 = 100;
                    }*/
                    vEjecucion.push(parseFloat((results.rows[i].monto/1000).toFixed(2)));

                    if(results.rows[i].producto.toUpperCase() == 'EPIN'){
                        tot_cierre += parseFloat(results.rows[i].monto);
                        $("#epin2_eje").html((results.rows[i].monto).toLocaleString('en'));
                    }else if(results.rows[i].producto.toUpperCase() == 'TIGO MONEY'){
                        tot_cierre += parseFloat(results.rows[i].monto);
                        $("#tmy2_eje").html((results.rows[i].monto).toLocaleString('en'));
                    }else if(results.rows[i].producto.toUpperCase() == 'TARJETA'){
                        tot_cierre += parseFloat(results.rows[i].monto);
                        $("#tar2_eje").html((results.rows[i].monto).toLocaleString('en'));
                    }else if(results.rows[i].producto.toUpperCase() == 'TARJETA_VAS'){
                        tot_cierre += parseFloat(results.rows[i].monto);
                        $("#tvs2_eje").html((results.rows[i].monto).toLocaleString('en'));
                    }else if(results.rows[i].producto.toUpperCase() == 'SMARTPHONES'){
                        $("#smt2_eje").html((results.rows[i].monto).toLocaleString('en'));
                    }else if(results.rows[i].producto.toUpperCase() == 'SIMCARDS'){
                        $("#sim2_eje").html((results.rows[i].monto).toLocaleString('en'));
                    }
                }               
            }
            $("#cierr_tot").html(tot_cierre.toLocaleString('en'));

            vSeries = [{name:'ejecutado', data:vEjecucion}];
            //console.log(vSeries);
            drawChart1('dvChartVtas', 'Ejecución Diaria', vFecha, 'HNL', vSeries, vCats);
            $("#sbRtpGlobal").hide();    
            $("#sbCierreD").show();
                   

            setTimeout(function(){  
                $.mobile.loading('hide'); 
            }, 2000);
        });
    });
}


function reloadVentas(vaniomes, vFlag){
    var vFech;
    var aniomes_cb=0;
    var flag_mes_ac=0;
    var aniomesact = getYMD(0).toString().substr(0,6);
    //console.log($("#anomesRVtas").val());
    if(vaniomes==0){
        vaniomes =  getYMD(0).substr(0,6);
    }else{
        if(vFlag==0){
            vaniomes =  $("#anomesRVtas").val();
        }else{            
            vFech = $("#fechRCierreD").val().replace('-','').replace('-','');
            vaniomes = vFech.substr(0,6) ;
        }
    }
    if(vDatosUsuario.id_dms == 0){
        alert('ID DMS no Establecido');
    }else{
        $.mobile.loading('show'); 
        //console.log(vaniomes);
        $.ajax({
            url:ws_url,
            type:'POST',
            data:{m:305,vx:userWS, vy:pdwWS, id_dms:vDatosUsuario.id_dms, aniomes:vaniomes},        
            dataType:'text',
            success: function(data){
                vResult = eval(data);
                //console.log(vResult);
                query = 'delete from tbl_ventas where anomes =' + vaniomes +' and id_dms=' + vDatosUsuario.id_dms;
                if(vResult.length>0){                    
                    /*$("#anomesRVtas").empty();
                    for(j=0;j<vResult.length; j++){
                        if (aniomes_cb != parseInt(vResult[j].aniomes))
                        {   
                            aniomes_cb = parseInt(vResult[j].aniomes);
                            if (j==0){
                                $('#anomesRVtas').append('<option value="' + vResult[j].aniomes + '" selected="selected">'+ vResult[j].aniomes +'</option>');
                            }else{
                                $('#anomesRVtas').append('<option value="' + vResult[j].aniomes + '">'+ vResult[j].aniomes +'</option>');
                            }
                        }
                    }
                    $('#anomesRVtas').val(vaniomes);
                    $('#anomesRVtas').selectmenu("refresh"); */

                    ejecutaSQL(query, 0);                    
                    setTimeout(function(){
                        for(i=0; i<vResult.length; i++){
                            query = 'insert into tbl_ventas(particion, anomes, id_dms, producto, unidad, meta, monto) values(';
                            query += vResult[i].particion + ',';
                            query += vResult[i].aniomes + ',';
                            query += vResult[i].id_dms + ',\'';
                            query += vResult[i].producto + '\',\'';
                            query += vResult[i].unidad + '\',';
                            query += vResult[i].meta + ',';
                            query += vResult[i].monto + ')';
                            //console.log(query);
                            ejecutaSQL(query, 0);
                        }
                        setTimeout(function(){ if(vFlag==0) {reporteVentas(vaniomes)}else{cierresDiarios(vFech)};}, 3000);
                        setTimeout(function(){
                            db.transaction(function(cmd){ 
                                cmd.executeSql('SELECT distinct anomes FROM tbl_ventas order by anomes asc', [], function (cmd, results) {
                                    var len = results.rows.length;
                                    if(len>0){ $("#anomesRVtas").empty(); $('#anomesRVtas').append('<option value="' + 0 + '" selected="selected">-</option>'); }
                                    for(j=0;j<len;j++){
                                        aniomes_cb=results.rows[j].anomes;
                                        if(parseInt(aniomes_cb)==parseInt(aniomesact)){
                                            flag_mes_ac = 1;
                                        }
                                        $('#anomesRVtas').append('<option value="' + results.rows[j].anomes + '">'+ results.rows[j].anomes +'</option>');
                                    }  
                                    if(flag_mes_ac==0){ 
                                        $('#anomesRVtas').append('<option value="' + aniomesact + '" selected="selected">'+ aniomesact +'</option>');
                                    }                  
                                    $("#anomesRVtas").val(aniomes_cb);
                                    $("#anomesRVtas").selectmenu('refresh');
                                });
                            });
                        },800);
                    }, 1000);
                }
            }, 
            error: function(error){
                $.mobile.loading( 'show', {
                    text: '',
                    textVisible: true,
                    textonly:true,
                    theme: 'a',
                    html: '<span><center><img src="img/noconection.png" width="60px" /></center><br />Servidor no responde.<br />Error de Coneccion</span>'
                });


                setTimeout(function(){ $.mobile.loading('hide'); }, 1500);
            },
            complete: function(e){
                
            }
        });  
    }
}

function drawChart1(dvChart, vTitle, vStitle, vUnit, vSeries, vCats){

    var str = '';
    str += 'Highcharts.chart(dvChart, {';
    str += '    chart: {';
    str += '        polar: true,';
    str += '        type: \'line\'';
    str += '    },';
    str += '    title: {';
    str += '        text: vTitle,';
    str += '        x: -80';
    str += '    },';
    str += '    pane: {';
    str += '        size: \'75%\'';
    str += '    },';
    str += '    xAxis: {';
    str += '        categories: vCats,';
    str += '        tickmarkPlacement: \'on\',';
    str += '        lineWidth: 0';
    str += '    },';
    str += '    yAxis: {';
    str += '        gridLineInterpolation: \'polygon\',';
    str += '        lineWidth: 0,';
    str += '        min: 0';
    str += '    },';
    str += '    tooltip: {formatter: function () {';
    str += '                    var vUnit2 = \'\';';
    str += '                    var strn = \'\';';
    str += '                    if(dvChart == \'dvChartVtas\'){';
    str += '                    if(this.key.toUpperCase()==\'SIMCARDS\' || this.key.toUpperCase()==\'SMARTHPONES\'){';
    str += '                        vUnit2 = \'UND\';';
    str += '                    }else{';
    str += '                        vUnit2 = vUnit;';
    str += '                    }}else{ vUnit2 = vUnit; }';
    str += '                    strn = \'<span style="color:\' + this.color +\'">\' + this.key +\': <b>\' + this.y + \'</b> \'+ vUnit2 + \'<br/>\';';
    str += '                    return strn;';
    str += '                } },';

    /*{';
    str += '        shared: true,';
    str += '        pointFormat: \'<span style="color:{series.color}">{series.name}: <b>\' + vUnit + \' {point.y:,.0f}</b><br/>\'';
    str += '    },';*/
    str += '    series: vSeries';
    str += '});';


    eval(str);
}

function initMap(lat, lng){
    var mapOptions = {
        center: new google.maps.LatLng(lat, lng),
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("mapHorus"), mapOptions); 

    var latLong = new google.maps.LatLng(lat, lng);
    markHorus = new google.maps.Marker({
        position: latLong,
        map:map
    });

    setMark(lat, lng);
}


/* calcular distancia entre 2 coordenadas en Kmts*/
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deltaphi
  var dLon = deg2rad(lon2-lon1);  // deltalambda

  var phi1 = deg2rad(lat1);
  var phi2 = deg2rad(lat2)
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(phi1) * Math.cos(phi2) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km

  return d.toFixed(2);
}


function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function getFechFormated(vNumFech){
    var vReturn;
    var vAnio = vNumFech.toString().substr(0,4);
    var vMesNum = vNumFech.toString().substr(4,2);
    var vDia = vNumFech.toString().substr(6,2);
    var vHh = vNumFech.toString().substr(8,2);
    var vMn = vNumFech.toString().substr(10,2);

    vStrMes = getMonthName(parseInt(vMesNum));

    vReturn = vAnio + '-' + vStrMes + '-'+ vDia + ' ' + vHh +':'+ vMn;

    return  vReturn;
}

function cierreVtasDiaria(vFlagCierre, vFlagRes){
    if(vFlagCierre==0){
        strHtml = '<div style="border:solid 1px gray; padding:20px; border-radius:15px"><lable>Seguro quieres efectuar cierre de ventas diario ?</label>';
        strHtml += '<table width="100%">';
        strHtml += '<tr><td><button class="ui-btn ui-corner-all ui-btn-b" onclick="cierreVtasDiaria(1,1)">Si</button></td>';
        strHtml += '<td><button class="ui-btn ui-corner-all ui-btn-a" onclick="cierreVtasDiaria(1,0)">No</button></td>';
        strHtml += '</tr></table></div>';

        $.mobile.loading( 'show', {
                    text: '',
                    textVisible: true,
                    textonly:true,
                    theme: 'a',
                    html: strHtml
                });
    }else{
        if(vFlagRes==1){
            sendCierreVtas();
        }else{            
            $.mobile.loading('hide');
        }

    }
}

function sendCierreVtas(){
    $.mobile.loading('show');
    console.log('enviando cierre');
    $.ajax({
            url:ws_url,
            type:'POST',
            data:{m:306,vx:userWS, vy:pdwWS, ui:vDatosUsuario.user},        
            dataType:'text',
            success: function(data){
                vResult = data;
                if(vResult!=='SUCCESS'){
                    $.mobile.loading( 'show', {
                        text: '',
                        textVisible: true,
                        textonly:true,
                        theme: 'a',
                        html: '<span><center><img src="img/noconection.png" width="60px" /></center><br />Error al intentar guardar informacion.</span>'
                    });
                }else{
                    $.mobile.loading( 'show', {
                        text: '',
                        textVisible: true,
                        textonly:true,
                        theme: 'a',
                        html: '<span><center>Guardado Exitosamente</center></span>'
                    });
                }
                //console.log(vResult);                
            }, 
            error: function(error){
                $.mobile.loading( 'show', {
                    text: '',
                    textVisible: true,
                    textonly:true,
                    theme: 'a',
                    html: '<span><center><img src="img/noconection.png" width="60px" /></center><br />Servidor no responde.<br />Error de Coneccion</span>'
                });
            },
            complete: function(e){                
                setTimeout(function(){ $.mobile.loading('hide'); }, 1500);
            }
        });  
}

function getPlanningDMS(){
    var vResult;
    var weekNum;
    var fech = new Date();
    var vQry= '';

    weekNum = getWeekNumber(fech);

    $.mobile.loading('show');
    $.ajax({
            url:ws_url,
            type:'POST',
            data:{m:310,vx:userWS, vy:pdwWS, ui:vDatosUsuario.user.toUpperCase()},        
            dataType:'text',
            success: function(data){
                vResult = eval('(' +data+')');                
                //console.log(vResult);
                if(vResult.plan.length>0){
                    vQry = 'delete from tbl_plan_dms where aniomes='+ getYMD(0).substr(0,6) +' and upper(usuario)=\'' + vDatosUsuario.user.toUpperCase() + '\' and semana_anio=' + weekNum[1] ;
                    //console.log(vQry);
                    ejecutaSQL(vQry, 0);
                    setTimeout(function(){
                        //console.log(vResult.length);
                        for(i=0; i<vResult.plan.length; i++){
                            query = 'insert into tbl_plan_dms(aniomes, semana_anio, usuario, cod_empleado_dms, circuit, nombre_circuito, id_pdv, nombre_pdv, dias_semana, ymd_dia) values(';
                            query += vResult.plan[i].aniomes + ',';
                            query += vResult.plan[i].semana_anio + ',';
                            query += '\'' + vResult.plan[i].usuario + '\',';
                            query += vResult.plan[i].cod_empleado_dms + ',';
                            query += vResult.plan[i].circuit + ',';
                            query += '\'' + vResult.plan[i].nombre_circuito + '\',';
                            query += vResult.plan[i].id_pdv + ',';
                            query += '\'' + vResult.plan[i].nombre_pdv + '\',';
                            query += '\'' + vResult.plan[i].dias_semana + '\',';
                            query += vResult.plan[i].ymd_dia + ')';
                            ejecutaSQL(query, 0);
                        }

                        //Insert Fichas PDVs
                        for(i=0; i<vResult.fichas.length; i++){
                            ejecutaSQL('delete from tbl_ficha_pdv where id_pdv =' + vResult.fichas[i].id_pdv , 0);
                        }
                        
                        setTimeout(function(){
                            for(i=0; i<vResult.fichas.length; i++){
                                query = 'INSERT INTO tbl_ficha_pdv(id_pdv, nombre_pdv, duenio, dir, mbl_epin, mbl_tmy, segmento_pop) values(';
                                query += vResult.fichas[i].id_pdv + ',';
                                query += '\'' + vResult.fichas[i].nombre + '\',';
                                query += '\'' + vResult.fichas[i].duenio + '\',';
                                query += '\'' + vResult.fichas[i].dir + '\',';
                                query += '\'' + vResult.fichas[i].epin + '\',';
                                query += '\'' + vResult.fichas[i].tmy + '\',';
                                query += '\'' + vResult.fichas[i].segmento + '\')';
                                ejecutaSQL(query, 0);
                            }
                        }, 3000);
                            
                        
                        showPlanSemana(weekNum[1], getYMD(0).toString().substr(0,6));
                    }, 800);
                    
                } else{
                    setTimeout(function(){ $.mobile.loading('hide'); }, 1500);
                }              
            }, 
            error: function(error){
                $.mobile.loading( 'show', {
                    text: '',
                    textVisible: true,
                    textonly:true,
                    theme: 'a',
                    html: '<span><center><img src="img/noconection.png" width="60px" /></center><br />Error Consultando al Server</span>'
                });

                setTimeout(function(){$.mobile.loading('hide');},1500);
            },
            complete: function(e){    
                //console.log(e);            
                //setTimeout(function(){ $.mobile.loading('hide'); }, 1500);
                    var anioCb = getYMD(0).toString().substr(0,4);
                    setTimeout(function(){
                    db.transaction(function(cmd){ 
                        cmd.executeSql('SELECT distinct semana_anio FROM tbl_plan_dms where substr(aniomes,1,4)=?', [anioCb], function (cmd, results) {
                            var len = results.rows.length;
                            if(len>0){ $("#cbSemanaNum").empty(); $('#cbSemanaNum').append('<option value="' + 0 + '" selected="selected">-</option>'); }
                            for(j=0;j<len;j++){
                                //console.log(results.rows[i].semana_anio);
                                $('#cbSemanaNum').append('<option value="' + results.rows[j].semana_anio + '" selected="selected">'+ results.rows[j].semana_anio +'</option>');
                            }
                            //console.log('Cb Done');
                            $('#cbSemanaNum').selectmenu("refresh");
                        });
                        });
                    },5000);
                }
            }); 
}

function showPlanSemana(vNumSemana,vAniomes){

    var vStrHtml='';
    setTimeout(function(){$.mobile.loading('show');},100);

    db.transaction(function(cmd){ 
        cmd.executeSql('SELECT semana_anio, dias_semana, ymd_dia, count(id_pdv) as cant_pdvs FROM tbl_plan_dms where semana_anio=? and aniomes=? group by semana_anio, dias_semana, ymd_dia order by ymd_dia', [parseInt(vNumSemana), parseInt(vAniomes)], function (cmd, results) {
            var len = results.rows.length;
            vStrHtml = '<table style="font-size:0.85em" width="100%" data-role="table" data-mode="columntoggle" class="table-stripe ui-responsive">';
            vStrHtml += '<thead><tr><th width="35%">Dia</th><th width="30%">Fecha</th><th>Cant PDVs.</th></tr></thead>';
            vStrHtml += '<tbody>';

            //console.log('Getting Data ' + len);
            if(len>0){                    
                for(i=0; i<len; i++){                    
                    vStrHtml += '<tr><td>'+ results.rows[i].dias_semana +'</td><td style="text-align:center">'+ results.rows[i].ymd_dia +'</td><td style="text-align:center"><a href="#" onclick="showPdvs('+results.rows[i].ymd_dia+')">'+ results.rows[i].cant_pdvs +'</a></td></tr>';
                    //console.log(i);
                }                
            }
            vStrHtml += '</tbody> </table>';
            $("#dvPlanSemanal").html(vStrHtml);
            $("#dvPlanSemanal").trigger('create');
            //console.log('Sowing Table');
            $("#dvPlanPDVs").html('');
            $("#dvPlanPDVs").trigger('create');
            setTimeout(function(){ $.mobile.loading('hide'); }, 1500);
        });
    });
}

function showPdvs(ymd){
    var vStrHtml='';
    setTimeout(function(){$.mobile.loading('show');},100);

    db.transaction(function(cmd){   
        cmd.executeSql('SELECT id_pdv, nombre_pdv, nombre_circuito FROM tbl_plan_dms where ymd_dia=? order by nombre_pdv', [parseInt(ymd)], function (cmd, results) {
            var len = results.rows.length;
            vStrHtml = '<h3>PDVs Plan '+ getFechFormated(ymd) +'</h3>'
            vStrHtml += '<input type="search" id="finderPDv1" onkeyup="funcTblFindPdv()" placeholder="nombre pdv"/>'
            vStrHtml += '<table id="pdvsTble1" style="font-size:0.85em" width="100%" data-role="table" data-mode="columntoggle" class="table-stripe ui-responsive">';
            vStrHtml += '<thead><tr><th width="5%">#</th><th width="10%">Id Pdv</th><th data-priority="2" width="10%">Circuito</th><th width="30%">Nombre</th></tr></thead>';
            vStrHtml += '<tbody>';

            
            if(len>0){                    
                for(i=0; i<len; i++){                    
                    vStrHtml += '<tr><td>'+ (i+1) +'</td><td><a href="#" onclick="fichaPDV('+ results.rows[i].id_pdv +')">'+ results.rows[i].id_pdv +'</a></td><td>'+ results.rows[i].nombre_circuito +'</td><td>'+ results.rows[i].nombre_pdv +'</td></tr>';
                }                
            }
            vStrHtml += '</tbody> </table>';
            $("#dvPlanPDVs").html(vStrHtml);
            $("#dvPlanPDVs").trigger('create');

            $('html, body').animate({
                scrollTop: $("#dvPlanPDVs").offset().top - 130
            }, 1000);

            setTimeout(function(){ $.mobile.loading('hide'); }, 1500);
        });
    });
}


function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return [d.getUTCFullYear(), weekNo];
}

function funcTblFindPdv() {
  var input, filter, table, tr, td, i;
  input = document.getElementById("finderPDv1");
  filter = input.value.toUpperCase();
  table = document.getElementById("pdvsTble1");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[3];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }       
  }
}

function funcTblFindPdv2() {
  var input, filter, table, tr, td, i;
  input = document.getElementById("finderPDv2");
  filter = input.value.toUpperCase();
  table = document.getElementById("pdvsTble2");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[3];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }       
  }
}

function findPDVFordis(vFlag){
    var vHtml = '';
    var fech_dtos = getYMD(0).substr(0,6);
    var vCircuitos = [];
    if(vFlag==0){        
        try{
        var dvListx= document.getElementById('dvListPDVs');
        document.getElementById('dv_forms_template').removeChild(dvListx);
        }catch(e){null};
        var h = $(window).height();
        var dvList = document.createElement('div');
        dvList.id = 'dvListPDVs';

        setTimeout(function(){$.mobile.loading('show');},100);

        db.transaction(function(cmd){   
            cmd.executeSql('SELECT distinct id_pdv, nombre_pdv, nombre_circuito FROM tbl_plan_dms where aniomes=? order by nombre_circuito,nombre_pdv', [parseInt(fech_dtos)], function (cmd, results) {
                var len = results.rows.length;
                
                if(len>0){  
                    for(k=0;k<len;k++){
                        if(vCircuitos.indexOf(results.rows[k].nombre_circuito)==-1){
                            vCircuitos.push(results.rows[k].nombre_circuito);
                        }
                    }

                    vStrHtml = '<br /><br /><button style="width:100px; height:30px; padding:0px" onclick="findPDVFordis(1)">Cerrar</button><h3>PDVs Planning</h3>';
                    vStrHtml += '<input type="search" id="finderPDv2" onkeyup="funcTblFindPdv2()" placeholder="nombre pdv"/>';
                    vStrHtml += '<label>Circuito</label><select id="cbCirPlanPDV" onchange="changCircSearchPlan(this)" data-mini="true">';
                    vStrHtml += '<option value="">-</option>'
                    for(k=0;k<vCircuitos.length;k++){
                        vStrHtml += '<option value="'+ vCircuitos[k] +'">'+vCircuitos[k]+'</option>';
                    }
                    vStrHtml += '</select>';
                    vStrHtml += '<table id="pdvsTble2" style="font-size:0.85em" width="100%" data-role="table" data-mode="columntoggle" class="table-stripe ui-responsive">';
                    vStrHtml += '<thead><tr><th width="5%">#</th><th width="10%">Id Pdv</th><th data-priority="2" width="10%">Circuito</th><th width="30%">Nombre</th></tr></thead>';
                    vStrHtml += '<tbody>';                  
                    for(i=0; i<len; i++){                    
                        vStrHtml += '<tr><td style="text-align:center">'+ (i+1) +'</td><td><a href="#" onclick="setPDVFordis('+ results.rows[i].id_pdv +')">'+ results.rows[i].id_pdv +'</a></td><td>'+ results.rows[i].nombre_circuito +'</td><td>'+ results.rows[i].nombre_pdv +'</td></tr>';
                    }                
                }
                vStrHtml += '</tbody> </table><br/><br/>';
                dvList.innerHTML=vStrHtml;  
                document.getElementById('dv_forms_template').appendChild(dvList);
                $("#dvListPDVs").css({"left":"-1%","padding":"3%", "width":"96%", "height":h,"background-color":"white","position":"fixed","top":10,"z-index":999,
                                        "opacity":1, "overflow":"scroll"});
                $("#dvListPDVs").trigger('create');
                setTimeout(function(){ $.mobile.loading('hide'); }, 1500);
            });
        });

        

    }else{
        try{
        var dvListx= document.getElementById('dvListPDVs');
        document.getElementById('dv_forms_template').removeChild(dvListx);
        }catch(e){null};
    }

}

function setPDVFordis(vIdPDV){
    //console.log(vIdPDV);
    obj = document.getElementById('Q2');
    obj.value = vIdPDV;
    findPDVFordis(1);
}

function changCircSearchPlan(vobj){
    var input, filter, table, tr, td, i;
    input = vobj
    filter = input.value.toUpperCase();
    //console.log(filter);
    table = document.getElementById("pdvsTble2");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[2];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }       
    }
}

function getDatosUsuario(){
    var vQry='';
    $.mobile.loading('show');
    try{
    $.ajax({
            url:ws_url,
            type:'POST',
            data:{m:204,vx:userWS, vy:pdwWS, ui:vDatosUsuario.user.toUpperCase()},        
            dataType:'text',
            success: function(data){
                vResult = eval(data);
                //console.log(vResult); 
                if(vResult.length>0){
                    vQry = 'UPDATE users ';
                    vQry += ' set name = \'' + vResult[0].name + '\',';
                    vQry += ' phone = ' + vResult[0].phone + ',';
                    vQry += ' email = \'' + vResult[0].email + '\',';
                    vQry += ' job_title = \'' + vResult[0].job + '\',';
                    vQry += ' type = ' + vResult[0].perfil + ',';
                    vQry += ' id_dms = ' + vResult[0].id_dms + ',';
                    vQry += ' license = ' + vResult[0].license;                    
                    vQry += ' ,id_pdv_dlr = ' + vResult[0].dlr_pdv_dms;
                    //console.log(vQry);
                    ejecutaSQL(vQry,0);
                    setTimeout(function(){
                        show_datos_user(vDatosUsuario.user);
                    },1000);
                }
                
            }, 
            error: function(error){
                $.mobile.loading( 'show', {
                    text: '',
                    textVisible: true,
                    textonly:true,
                    theme: 'a',
                    html: '<span><center><img src="img/noconection.png" width="60px" /></center><br />Error Consultando al Server</span>'
                });

                //setTimeout(function(){$.mobile.loading('hide');},1500);
            },
            complete: function(e){  
                setTimeout(function(){$.mobile.loading('hide');},2000);
            }
    }); 
    }catch(e){ $.mobile.loading( 'show', {
                    text: 'Error de Coneccion',
                    textVisible: true,
                    textonly:true,
                    theme: 'a'
                });}
}

function fichaPDV(vIDPdv){
    //console.log(vIDPdv);
    var vHTML = '';
    db.transaction(function(cmd){   
        cmd.executeSql('SELECT * FROM tbl_ficha_pdv where id_pdv=?', [parseInt(vIDPdv)], function (cmd, results) {
            var len = results.rows.length;            
            if(len>0){  
                vHTML ='<label style="display:block; font-size:0.9em; margin-top:10px" id="id_dms_user" >'+ results.rows[0].id_pdv +'</label> ';
                vHTML +='<label style="display:block; color:#848484; font-size:0.8em; margin-bottom:10px; margin-top:-3px">Id PDV</label>';
                vHTML +='<label style="display:block; font-size:0.9em;" id="num_tel">'+ results.rows[0].nombre_pdv +'</label> ';
                vHTML +='<label style="display:block; color:#848484; font-size:0.8em; margin-bottom:10px; margin-top:-3px">Nombre PDV</label>';
                vHTML +='<label style="display:block;font-size:0.9em;" id="name_user">'+ results.rows[0].duenio +'</label> ';
                vHTML +='<label style="display:block; color:#848484; font-size:0.8em; margin-bottom:10px; margin-top:-3px">Dueño</label> ';
                vHTML +='<label style="display:block;font-size:0.9em;" id="job_user">'+ results.rows[0].dir +'</label> ';
                vHTML +='<label style="display:block; color:#848484; font-size:0.8em; margin-bottom:10px; margin-top:-3px">Direccion</label> ';
                vHTML +='<label style="display:block;font-size:0.9em;" id="uid_user">'+ results.rows[0].mbl_epin +'</label> ';
                vHTML +='<label style="display:block; color:#848484; font-size:0.8em; margin-bottom:10px; margin-top:-3px">MBL EPIN</label>';
                vHTML +='<label style="display:block;font-size:0.9em;" id="uid_user">'+ results.rows[0].mbl_tmy +'</label> ';
                vHTML +='<label style="display:block; color:#848484; font-size:0.8em; margin-bottom:10px; margin-top:-3px">MBL TMY</label>';
                vHTML +='<label style="display:block;font-size:0.9em;" id="uid_user">'+ results.rows[0].segmento_pop +'</label> ';
                vHTML +='<label style="display:block; color:#848484; font-size:0.8em; margin-bottom:10px; margin-top:-3px">Segmento</label>';
                vHTML +='<button id="btnfds04" data-theme="b" style="margin-left:60%; width:100px; height:35px; padding:0px" onclick="makeFordis04('+results.rows[0].id_pdv+')">Fordis04</button>';
                
                $("#dvFichaPDV").html(vHTML);
                $("#dvFichaPDV").trigger('create');
                $('html, body').animate({
                    scrollTop: $("#dvFichaPDV").offset().top - 130
                }, 1000);
                //console.log(results.rows[0].nombre_pdv);
            }
        });
    });
}

function makeFordis04(vPDV){
    //console.log(vPDV);
    desplegarForm('FORDIS04');
    setTimeout(function(){
        $("#Q2").val(vPDV);
        $('html, body').animate({
            scrollTop: 0
        }, 800);
    },800);
}

function validaPerfil(){
    //console.log(vDatosUsuario.perfil);
    if(vDatosUsuario.perfil == 210){        
        $("#mnHorus").hide();
        $("#mnForms").hide();
        $("#mnRptVtas").hide();
        $("#mnDmsPlanin").hide();
        $("#dvFormsDet").hide();        
        $("#btnCvta").hide();
        $("#dvDMS").show();
        $("#mnRptG").show(); 
        //$("#dvMainGerencial").show();

    }else if(vDatosUsuario.perfil == 201){
        $("#mnHorus").show();
        $("#mnForms").show();
        $("#mnRptVtas").show();
        $("#mnDmsPlanin").show();        
        $("#mnRptG").show();    
        $("#dvDMS").show(); 
        $("#dvFormsDet").show(); 
        $("#btnCvta").show();
        $("#dvMainGerencial").hide();     
    }
    else{
        $("#mnHorus").show();
        $("#mnForms").show();
        $("#mnRptVtas").show();
        $("#mnDmsPlanin").show();
        $("#dvFormsDet").show();
        $("#btnCvta").show();
        $("#mnRptG").hide();         
        $("#dvMainGerencial").hide(); 
    }
}



//funcion para obtener ejecuion por sucirsal Reportes Gerenciales
function getDtosG(){
    var vStrHtml='';
    var vmesDtos = $("#cbAnomesSucs").val();
    $.mobile.loading('show');
    $.ajax({
            url:ws_url,
            type:'POST',
            data:{m:104,vx:userWS, vy:pdwWS, id_dealer:vDatosUsuario.id_pdv_dlr, anomes:vmesDtos},        
            dataType:'text',
            success: function(data){
                vResult = eval(data);
                //console.log(vResult); 
                if(vResult.length>0){
                    ejecutaSQL('DELETE FROM tbl_ejec_sucursales WHERe anomes=' + vmesDtos,0);
                    for(i=0; i<vResult.length; i++){ 
                        vQry = 'INSERT INTO tbl_ejec_sucursales(anomes, id_dealer, nombre_dealer, id_sucursal, nombre_sucursal, producto, ejecucion, meta, res, unidad)';
                        vQry += ' VALUES(' + vResult[i].anomes + ',';
                        vQry += vResult[i].id_dealer + ',';
                        vQry += '\'' + vResult[i].nombre_dealer + '\',';
                        vQry += vResult[i].id_sucursal + ',';
                        vQry += '\'' + vResult[i].nombre_sucursal + '\',';
                        vQry += '\'' + vResult[i].producto + '\',';
                        vQry +=  vResult[i].ejecucion + ',';
                        vQry +=  vResult[i].meta + ',';
                        vQry +=  vResult[i].res + ',';
                        vQry += '\'' + vResult[i].unidad + '\')';
                        //console.log(vQry);
                        ejecutaSQL(vQry,0);
                    }  
                    setTimeout(function(){ showDatosSucursales(vDatosUsuario.id_pdv_dlr, vmesDtos, $("#cbProductoDashG").val()) }, 3000);                  
                }
                
            }, 
            error: function(error){
                $.mobile.loading( 'show', {
                    text: '',
                    textVisible: true,
                    textonly:true,
                    theme: 'a',
                    html: '<span><center><img src="img/noconection.png" width="60px" /></center><br />Error Consultando al Server</span>'
                });

                //setTimeout(function(){$.mobile.loading('hide');},1500);
            },
            complete: function(e){  
                setTimeout(function(){$.mobile.loading('hide');},2000);
            }
    }); 
}

function showDatosSucursales(idDealer, anomes, vproduc){
    var vStrHtml='';
    //console.log(vproduc + anomes);
    vStrHtml = '<table style="font-size:0.8em" width="100%" data-role="table" data-mode="columntoggle" class="table-stripe ui-responsive">';
    vStrHtml += '<thead><tr><th width="46%">Sucursal</th><th data-priority=1>Unidad</th><th>Ejec.</th><th data-priority=2>Meta</th><th data-priority=1>Res.</th></tr></thead>';
    vStrHtml += '<tbody>';

    db.transaction(function(cmd){   
        cmd.executeSql('SELECT * FROM tbl_ejec_sucursales where anomes=? and id_dealer=? and producto=?', [parseInt(anomes), parseInt(idDealer), vproduc], function (cmd, results) {
            var len = results.rows.length;    
            //console.log(len);        
            if(len>0){                     
                for(i=0; i<len; i++){    
                    vStrHtml += '<tr style="font-size:0.9em"><td><a href="#" onclick="detallSucursal('+results.rows[i].id_sucursal+')">'+ results.rows[i].nombre_sucursal  +'</a></td><td>'+ results.rows[i].unidad +'</td><td style="text-align:right">'+ parseFloat(results.rows[i].ejecucion).toLocaleString('en') +'</td><td style="text-align:right">'+ parseFloat(results.rows[i].meta).toLocaleString('en') +'</td><td style="text-align:right">'+ results.rows[i].res +' %</td></tr>';      
                }                
            }
            vStrHtml += '</tbody> </table>';
            $("#dvTblEjeSuc").html(vStrHtml);
            $("#dvTblEjeSuc").trigger('create');

            $.mobile.loading('hide');
        });
    });
}

function changeProduct(){

    $.mobile.loading('show');
    $("#dvDetSucursal").html('');
    $("#dvDetSucursalDiario").html('');

    showDatosSucursales(vDatosUsuario.id_pdv_dlr, $("#cbAnomesSucs").val(), $("#cbProductoDashG").val());
}

function detallSucursal(vIdSucursal){
    //console.log(vIdSucursal + $("#cbAnomesSucs").val());
    var arrCats = [];
    var arrSeries = [];
    var ejec = [];
    var metas = [];

    $.mobile.loading('show');
    db.transaction(function(cmd){   
        cmd.executeSql('SELECT * FROM tbl_ejec_sucursales where anomes=? and id_sucursal=? order by producto', [parseInt($("#cbAnomesSucs").val()), parseInt(vIdSucursal)], function (cmd, results) {
            var len = results.rows.length;    
            //console.log(len);        
            if(len>0){                     
                for(i=0; i<len; i++){  
                    if(arrCats.indexOf(results.rows[i].producto)==-1){
                        arrCats.push(results.rows[i].producto);
                        ejec.push(results.rows[i].ejecucion);
                        metas.push(results.rows[i].meta);
                    }
                }                  

                //console.log(arrCats);    
                Highcharts.chart('dvDetSucursal', {
                    chart: {
                        type: 'column'
                    },
                    title: {
                        text: results.rows[0].nombre_sucursal
                    },
                    subtitle: {
                        text: 'Ejecucion vs Meta ' + $("#cbAnomesSucs").val()
                    },
                    xAxis: {
                        categories: arrCats,
                        crosshair: true
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: '' 
                        }
                    },
                    tooltip:{formatter: function () {
                        //console.log(this);
                        var vUnit2 = '';
                        var strn = '';
                        var serie_name = '';

                        strn += '<span style="font-size:1em;">'+  this.x + '</span><br/><table>';
                        for(i=0; i< this.points.length; i++){
                            if(this.points[i].key.toUpperCase()=='SIMCARDS' || this.points[i].key.toUpperCase()=='SMARTPHONES'){
                                vUnit2 = 'UND'
                            }else{
                                vUnit2 = 'HNL';
                            }
                            strn += '<tr><td style="color:' + this.points[i].color + '; padding:0;">' + this.points[i].series.name + ': </td>';
                            strn += '<td style="padding:0; text-align:right"><b>' + this.points[i].y.toLocaleString('en') +' '+ vUnit2 +'</b></td></tr>';

                        }
                        return strn;  
                    }, shared:true, useHTML:true },
                    /*{
                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                            '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
                        footerFormat: '</table>',
                        shared: true,
                        useHTML: true
                    },*/

                    plotOptions: {
                        column: {
                            pointPadding: 0.2,
                            borderWidth: 0
                        }
                    },
                    series: [{
                        name: 'Ejecucion',
                        data: ejec

                    }, {
                        name: 'Meta',
                        data: metas

                    }]
                });


                $.mobile.loading('show');
                $.ajax({
                        url:ws_url,
                        type:'POST',
                        data:{m:105,vx:userWS, vy:pdwWS, id_sucursal:vIdSucursal, anomes:$("#cbAnomesSucs").val()},        
                        dataType:'text',
                        success: function(data){
                            vResult = eval(data);
                            //console.log(vResult); 
                            if(vResult.length>0){
                                //console.log(vResult); 
                                //dasboard2
                                Highcharts.chart('dvDetSucursalDiario', {
                                    title: {
                                        text: results.rows[0].nombre_sucursal
                                    },

                                    subtitle: {
                                        text: 'Ejecucion ' + $("#cbAnomesSucs").val()
                                    },

                                    yAxis: {
                                        title: {
                                            text: ''
                                        }
                                    },
                                    legend: {
                                        layout: 'vertical',
                                        align: 'right',
                                        verticalAlign: 'middle'
                                    },

                                    plotOptions: {
                                        series: {
                                            label: {
                                                connectorAllowed: true
                                            },
                                            pointStart:1,
                                            data:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]
                                        }
                                    },

                                    series: vResult,

                                    tooltip:{formatter: function () {
                                        //console.log(this);
                                        var vUnit2 = '';
                                        var strn = '';
                                        var serie_name = '';
                                        if(this.series.name.toUpperCase()=='SIMCARDS' || this.series.name.toUpperCase()=='SMARTPHONES'){
                                            vUnit2 = 'UND'
                                        }else{
                                            vUnit2 = 'HNL';
                                        }

                                        strn += '<span style="font-size:1em;">'+  this.series.name + '</span><br/><table>';
                                        strn += '<tr><td style="color:' + this.color + '; padding:0;">' + this.x + ': </td>';
                                        strn += '<td style="padding:0; text-align:right"><b>' + this.y.toLocaleString('en') +' '+ vUnit2 +'</b></td></tr>';
                                        return strn;  

                                    }, useHTML:true },

                                    responsive: {
                                        rules: [{
                                            condition: {
                                                maxWidth: 500
                                            },
                                            chartOptions: {
                                                legend: {
                                                    layout: 'horizontal',
                                                    align: 'center',
                                                    verticalAlign: 'bottom'
                                                }
                                            }
                                        }]
                                    }

                                });                 
                            }
                            
                        }, 
                        error: function(error){
                            $.mobile.loading( 'show', {
                                text: '',
                                textVisible: true,
                                textonly:true,
                                theme: 'a',
                                html: '<span><center><img src="img/noconection.png" width="60px" /></center><br />Error Consultando al Server</span>'
                            });

                            //setTimeout(function(){$.mobile.loading('hide');},1500);
                        },
                        complete: function(e){  
                            setTimeout(function(){$.mobile.loading('hide');},2000);
                        }
                }); 
                

            }

            $.mobile.loading('hide');
        });
    });

    
}