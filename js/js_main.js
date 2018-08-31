// JavaScript General App

var userWS = '69BA4B9D76B7C3452E2A48B7BF9790FE';
var pdwWS  = '0BAD6CE456FCFBEF59544697D43E06D1';
var vFlagTracking = false;
var vTimerGPS; // = 30000;
var vIdFormulario ='XO';
var vLat = 0;
var vLng = 0;
var ws_url = 'http://localhost/ws_so/service_so.php'; 
//var ws_url = 'https://190.4.63.207/ws_so/service_so.php';

var vDatosUsuario ={"user":"", "login":"", "name":"", "phone":0, "email":"na", "job":"na", "id_dms":0};
var vTitle ="Tracking Service Comercial Support";
var map;
var pgActual = 0;
var pgBack = 0;


var vIntersept = true;
var vIntervalGeo;
var vInteDash;
var bgGeo;
var vFormData = {};
var vFormsPendientes = [];
//var webSvrListener =  setInterval(function(){ consultSVR()}, 59000);
var pagRoot = [{id:0, back:0},
                {id:1, back:0},
                {id:2, back:0},
                {id:3, back:0},
                {id:100, back:3}];
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
        cordova.plugins.backgroundMode.overrideBackButton(); 
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
            //vInteDash = setInterval(function(){ getMapLocation(); }, vTimerGPS); 
        });

        document.addEventListener('backbutton', function(e){
            console.log('..');
       //     //window.plugins.toast.show('Back Bloq..', 1000, 'bottom');          
        });
        
        
    }

}

$(document).ready(function(e){
    setTimeout(function(){getMap(14.618086,-86.959082); }, 2000);
    hide_pags();    

    $("#dvDMS").show();
    $('#lbl_title').html('DMS EXPERIENCE');            
    $("#dvHead").show();
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
                        console.log('Loged In');
                        vDatosUsuario.user = results.rows.item(i).id;
                        vDatosUsuario.login = 1;
                        show_datos_user(vDatosUsuario.user);
                        get_forms_info();
                        logInOut(vDatosUsuario.user, 1);      
                        
                        $("#page").show();
                        $("#dvMain").show();
                        $("#bg_login").hide();
                        $("#dvUserName").html(vDatosUsuario.user);
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


                $("#id_dms_user").html(vDatosUsuario.id_dms);
                $("#uid_user").html(vDatosUsuario.user.toLowerCase());
                $("#name_user").html(vDatosUsuario.name);
                $("#email_user").html(vDatosUsuario.email);
                $("#job_user").html(vDatosUsuario.job); 
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
    $("#dvHead").hide();
    $('#dv_forms_template').hide();

    //Forms DMS    
    $("#forms_enviados").hide();
    $("#forms_pendientes").hide();
}


function subIncidente(vFlag){
    switch(vFlag)
    {
        case 0:
            $("#dvIncEnvia").show();
            $("#dvIncRep").hide();
        break;
        case 1:            
            $("#dvIncEnvia").hide();
            $("#dvIncRep").show(); 
        break;
    }

}

function enviarMensaje(){
    var number = $("#vTel").val();
    var msj = $("#wTipoIncidente").val() + '-' + $("#wDetalleIncidente").val() + ' ' + $("#vMsj").val();
    console.log($("#wTipoIncidente").val());
    sendSMS(msj, number);
}

function sendSMS(vMsj, vNumber){
    if(SMS){
        /*SMS.hasPermission(function(vPermission){
            alert(vPermission);
             if (!vPermission) {
                SMS.requestPermission(function() {
                    alert('[OK] Permission accepted');
                    SMS.sendSMS(vNumber, vMsj, function(e){ alert('MSJ Sent'); }, function(e){  alert('Error: ' + e)});
                }, function(error) {
                    console.info('[WARN] Permission not accepted')
                    // Handle permission not accepted
                });
            }
        }, function(e){ alert(e); });*/
        SMS.sendSMS(vNumber, vMsj, function(e){ 
            alert('MSJ Sent'); 
            $("#wDetalleIncidente").val('');
            $("#vTel").val('');
            $("#vMsj").val(''); }, function(e){  alert('Error: ' + e)});

    }    
}



function takePicture(){
    navigator.camera.getPicture(onSuccess, onFail, { quality: 50, sourceType:Camera.PictureSourceType.CAMERA, correctOrientation:true,
            cameraDirection: Camera.Direction.FRONT, allowEdit: true});

    function onSuccess(imageURI) {
        displayImage(imageURI)
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }
}

function displayImage(imgUri) {
    $("#imgUser").attr('src', imgUri);
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

    getMap(position.coords.latitude, position.coords.longitude);

    vQre = 'INSERT INTO records (fecha, lat, lng, user) VALUES(\'' + getYMD(0) + h + m + sc + '\',';
    vQre += position.coords.latitude + ',' + position.coords.longitude + ',\''+ vDatosUsuario.user + '\')';
    //ejecutaSQL(vQre, 0);
    saveGPS(getYMD(0) + h + m + sc, position.coords.latitude, position.coords.longitude, vDatosUsuario.user);    
    
    
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



function showdata(){

    $.ajax({
        type: 'POST',
        dataType:'text',
        data: {op:1, vx:userWS, vy:pdwWS},
        url: 'http://iteshn.hol.es/server_app/svrConsultasSO.php',
        success: function(data){
            alert(data);
            console.log('Sucess Save on Server');
        },
        error: function(data){
            console.log(data);
            alert('Error de conexion con el servidor');
        }
    });
}

function tracking(){

    if(vFlagTracking ==  false){
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
    }
}

function logout(){
    //console.log(vDatosUsuario.user);
    logInOut(vDatosUsuario.user, 0);
    setTimeout(function(){ window.location.replace('index.html?user=0&login=0'); }, 800);
}



function getDataDB2(vQry, vZn, vKpi, vTypeD){
    var dataDrill = [];

    db.transaction(function(cmd2){  
        //console.log(vQry);        
        cmd2.executeSql(vQry,[], function (cmd2, results2) {
            //console.log('Sub Cnl por Zona ' + results2.rows.length); 

            if(vTypeD==0){
                for(var j=0; j<results2.rows.length; j++){
                    dataDrill.push([results2.rows.item(j).sub_cnl, results2.rows.item(j).ejecutado]);
                } 
                dataDrill1.push({"name":"Zona " + vZn, "id": vKpi + " Zona "+vZn, "data":dataDrill});
            }else{
                for(var j=0; j<results2.rows.length; j++){
                    dataDrill.push(['Zona ' + results2.rows.item(j).zona, results2.rows.item(j).ejecutado]);
                } 
                dataDrill1.push({"name":vZn, "id": vKpi + '-' + vZn, "data":dataDrill});
            }
            

            //console.log(JSON.stringify(dataDrill1));
        });
    }, function(e){console.log(e);});
}


function consultSVR(){
    //alert('hello');
    var varJSNkpis;
    var vCountRegs = 0;
    var vQry1 = '';
    var vQry2 = '';
    var vYMD =  getYMD(-1);
    var vDataDecode = '';

    //console.log('consulting server');
    //$.post('http://localhost/proyects_amg/web/websvr/svrkpi/svrConsultas.php', {op:2, kpi:0, date:vYMD, user:userWS, pdw:pdwWS}, function(rData){    //'https://svrconsultas.appspot.com/test/', function(rData){
    $.post('http://localhost:8081/ws_so1/ws_consultas_boc/kpis/2017/09/1101', function(rData){
    //$.post('https://svrconsultas.appspot.com/test/', {user:userWS, pdw:pdwWS}, function(rData){
        //console.log(str2Hex(rData));
        alert(rData);
        //console.log(rData);
        //vDataDecode = hex2a(rData);
        vDataDecode = rData;

        varJSNkpis = JSON.parse(vDataDecode);
        vCountRegs = varJSNkpis.kpis.length;
        console.log(vCountRegs);

        vGcountRegs = vCountRegs*2;
        vGcountRegs_Flag = 0;

        for(var i=0; i<vCountRegs; i++){
            //Delete from Main Data KPI
            //vQry1 = "DELETE FROM kpi_data WHERE id="+ varJSNkpis.kpis[i].id;
            vQry1 = "DELETE FROM kpi_data WHERE id="+ varJSNkpis.kpis[i].id + " and zona=" + varJSNkpis.kpis[i].zona + " and cnl='" + varJSNkpis.kpis[i].cnl + "' and sub_cnl='" + varJSNkpis.kpis[i].sb_cnl
                    + "' and territorio=" + varJSNkpis.kpis[i].ter;
            ejecutaSQL(vQry1, 0);

            //Delete from Hist Data KPI
            vQry1 = "DELETE FROM kpi_data_hist WHERE id="+ varJSNkpis.kpis[i].id + " and zona=" + varJSNkpis.kpis[i].zona + " and cnl='" + varJSNkpis.kpis[i].cnl + "' and sub_cnl='" + varJSNkpis.kpis[i].sb_cnl
                    + "' and territorio=" + varJSNkpis.kpis[i].ter + " and fecha=" + varJSNkpis.kpis[i].fecha + '';
            ejecutaSQL(vQry1, 0);            
        }
        sleep(2000);

        for(var i=0; i<vCountRegs; i++){

            //Insert into Main Data KPI
            vQry2 = "INSERT INTO kpi_data VALUES(" + varJSNkpis.kpis[i].id + ",'" + varJSNkpis.kpis[i].kpi + "'," + varJSNkpis.kpis[i].ter + "," + varJSNkpis.kpis[i].year + "," + varJSNkpis.kpis[i].month
                    + "," + varJSNkpis.kpis[i].fecha + "," + varJSNkpis.kpis[i].zona + ",'" + varJSNkpis.kpis[i].cnl + "','" + varJSNkpis.kpis[i].sb_cnl 
                    + "'," + varJSNkpis.kpis[i].ejecutado + ',' + varJSNkpis.kpis[i].forecast +',' + varJSNkpis.kpis[i].budget + ",'" + varJSNkpis.kpis[i].unit
                     + "','" + varJSNkpis.kpis[i].bu + "')";
            //console.log(vQry2);
            ejecutaSQL(vQry2, 1);
            sleep(500);

            //Insert into Hist Data KPI
            vQry2 = "INSERT INTO kpi_data_hist VALUES(" + varJSNkpis.kpis[i].id + ",'" + varJSNkpis.kpis[i].kpi + "'," + varJSNkpis.kpis[i].ter + "," + varJSNkpis.kpis[i].year + "," + varJSNkpis.kpis[i].month
                    + "," + varJSNkpis.kpis[i].fecha + "," + varJSNkpis.kpis[i].zona + ",'" + varJSNkpis.kpis[i].cnl + "','" + varJSNkpis.kpis[i].sb_cnl 
                    + "'," + varJSNkpis.kpis[i].ejecutado + ',' + varJSNkpis.kpis[i].forecast +',' + varJSNkpis.kpis[i].budget + ",'" + varJSNkpis.kpis[i].unit
                     + "','" + varJSNkpis.kpis[i].bu + "')";
            //console.log(vQry2);
            ejecutaSQL(vQry2, 1);
        }
    });
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


function getMap(latitude, longitude) {

    var mapOptions = {
        center: new google.maps.LatLng(0, 0),
        zoom: 1,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map
    (document.getElementById("mapHorus"), mapOptions);


    var latLong = new google.maps.LatLng(latitude, longitude);

    var marker = new google.maps.Marker({
        position: latLong
    });

    marker.setMap(map);
    map.setZoom(7);
    map.setCenter(marker.getPosition());
}

function setMarkGPS(lat, lng){
    var latLong = new google.maps.LatLng(lat, lng);
    marker.setMap(null);

    marker = new google.maps.Marker({
        position: latLong
    });

    marker.setMap(map);
    map.setCenter(marker.getPosition());
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
        wuser = $("#imgUser").width(); 
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
               drawForm(vItems, vIdForm);
               vFormData = {id_form:vIdForm + '_' + getYMD(0) + getHMS(), vdata:vItems};
               //console.log(vFormData);
            }   
        });
    });


    /*[{tipo:111, id:1001, name:'Pergunta de prueba 1', ops:[], func:''},
    {tipo:101, id:1002, name:'Pergunta de prueba 2', ops:[], func:''},
    {tipo:101, id:1072, name:'Pergunta de prueba 4', ops:[], func:''},
    {tipo:101, id:1022, name:'Pergunta de prueba 5', ops:[], func:''},
    {tipo:101, id:1032, name:'Pergunta de prueba 6', ops:[], func:''},
    {tipo:101, id:1042, name:'Pergunta de prueba 7', ops:[], func:''},
    {tipo:101, id:1052, name:'Pergunta de prueba 8', ops:[], func:''},
    {tipo:101, id:1062, name:'Pergunta de prueba 9', ops:[], func:''},

    {tipo:103, id:1004, name:'Pergunta de prueba 4', ops:['Op1','Op2','Op3'], func:''},
    {tipo:101, id:1003, name:'Pergunta de prueba 3', ops:[], func:''},
    {tipo:104, id:1004, name:'Pergunta de prueba 4', ops:[{id:1010, name:'Op1'},{id:1012, name:'Op2'},{id:1013, name:'Op3'}], func:''},                    
    {tipo:105, id:1005, name:'Pergunta de prueba 5', ops:[{id:1110, name:'Op12'},{id:1112, name:'Op22'},{id:1113, name:'Op32'}], func:''}];*/

    

}

function drawForm(vItems, vtittle){
    //console.log(vItems);
    vStrFrom = '';
    vStrFrom += '<div class="custom-corners"><div class="ui-bar ui-bar-a"><h3>'+ vtittle +'</h3></div>';
    vStrFrom += '<div class="ui-body ui-body-a">';
    var temp = [];
    for (j=0; j<vItems.length; j++){
        //console.log(vStrFrom);
        temp.push(drawObject(parseInt(vItems[j].tipo), vItems[j].id, vItems[j].name, eval(vItems[j].ops), vItems[j].func));
        vStrFrom += temp[j];
    }
    
    vStrFrom +=  drawObject(201, 'btn1', 'Enviar', [], 'envioForm()');
    /*vStrFrom += '<script type="text/javascript">';
    vStrFrom += 'function show(){ alert(\'hello \' + $("#txt1").val() + \'-\'+ $("#txt8").val());  } ';
    vStrFrom += 'function chngOp1(){ if($("#op1").val()=="1001"){ $("#txt8").parent().hide(); $(\'label[for="txt8"]\').hide();}else{ $("#txt8").parent().show(); $(\'label[for="txt8"]\').show(); } }'; 
    vStrFrom += '</script>';*/
    vStrFrom += "</div></div>";
    
    switchMenu(3, 100);

    $('#dv_forms_template_content').html(vStrFrom);
    $('#dv_forms_template_content').trigger('create');
}



function drawObject(vTipo, vId, vNombre, vOptions, vfunc){
    var vStr = '';
    
    switch(vTipo)
    {
        case 101:
            vStr += '<label for="'+ vId +'">'+ vNombre +'</label><input type="text" id="'+ vId +'" /><br />';
        break;
        case 111:
            vStr += '<label for="'+ vId +'">'+ vNombre +'</label><input type="number" id="'+ vId +'" /><br />';
        break;
        case 102:
            vStr += '<label for="'+ vId +'">'+ vNombre +'</label><textarea id="'+ vId +'"></textarea><br />';
        break;
        case 103:
            vStr += '<label for="'+ vId +'">'+ vNombre +'</label>';
            vStr += '<select id="'+ vId +'" onchange="'+ vfunc +'">';
            for(i=0; i<vOptions.length; i++){
                vStr += '<option value="'+ vOptions[i]+'">'+ vOptions[i] +'</option>';
            }
            vStr += '</select><br />';
        break;
        case 104:
            vStr += '<fieldset data-role="controlgroup"><legend>'+ vNombre +'</legend>';
            for(i=0; i<vOptions.length; i++){
                vStr += '<input type="radio" name="'+ vId + '" id="'+ vOptions[i].id +'" value="'+ vOptions[i].id +'">';
                vStr += '<label for="'+ vOptions[i].id +'">'+ vOptions[i].name +'</label>';
            }
            vStr += '</fieldset><br />';
        break;
        case 105:
            vStr += '<fieldset data-role="controlgroup"><legend>'+ vNombre +'</legend>';
            for(i=0; i<vOptions.length; i++){
                vStr += '<input type="checkbox" name="'+ vOptions[i].id + '" id="'+ vOptions[i].id +'">';
                vStr += '<label for="'+ vOptions[i].id +'">'+ vOptions[i].name +'</label>';
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
            //console.log(JSON.stringify(data[1].data));
            vQry = '';

            // Borra Forms a actualizar
            /*for(i=0;i<data.length; i++){

                vQry = 'DELETE FROM tbl_forms';
                vQry += ' WHERE id = \'' + data[i].id + '\'';

                ejecutaSQL(vQry, 0); 
            }*/
            vQry = 'DELETE FROM tbl_forms';
            ejecutaSQL(vQry, 0); 


            for(i=0;i<data.length; i++){

                vQry = 'INSERT INTO tbl_forms (id, desc, type, version, dtos, udt_dt) VALUES(';
                vQry += '\'' + data[i].id + '\',\'' + data[i].desc + '\','  + data[i].tipo + ',' + data[i].ver + ',\'' + JSON.stringify(data[i].data) +'\',\'' + data[i].udt_dt + '\')';

                ejecutaSQL(vQry, 0); 
            }
        }, 
        error: function(e){
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
}


function formsEnviados(){    

    vIni = $("#fechIniForm").val().replace('-', '').replace('-', '');
    vFin = $("#fechFinForm").val().replace('-', '').replace('-', '');

    $.mobile.loading('show');

    db.transaction(function(cmd){   
        cmd.executeSql('SELECT * FROM tbl_forms_filled where status =? and substr(date,1,8) between ? and ?', [1, vIni, vFin], function (cmd, results) {
            var len = results.rows.length;
            vStrHtml = '';
            vStrHtml += '<table data-role="table" data-mode="columntoggle" class="table-stripe">';
            vStrHtml +=  '<thead><tr><th data-priority="1">ID</th><th data-priority="0">Formulario</th><th>fecha</th></tr></thead>';
            vStrHtml +=  '<tbody>';
            //console.log(len);
            for(i=0; i<len; i++){
                vName = results.rows[i].id_form.split('_')
                vStrHtml +=  '<tr>';
                vStrHtml +=  '<td>'+ results.rows[i].id_form +'</td>';
                vStrHtml +=  '<td>'+ vName[0] +'</td>';
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
                vFormsPendientes.push({id_form:results.rows[i].id_form, vdata:results.rows[i].dtos, fech:results.rows[i].date});
                vName = results.rows[i].id_form.split('_')
                vStrHtml +=  '<tr>';
                vStrHtml +=  '<td>'+ results.rows[i].id_form +'</td>';
                vStrHtml +=  '<td>'+ vName[0] +'</td>';
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
    
    $("#forms_list").hide();
    $("#forms_pendientes").show();
    $("#forms_enviados").hide();


}

function envioFormsPend(){
    var contForms = 0;
    var contRegs = 0;
    //console.log(vFormsPendientes);
    for(i=0; i<vFormsPendientes.length; i++){
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
                }            
            }, 
            error: function(error){
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
                //console.log(e.responseText);
                contRegs++;                
                if(contRegs==vFormsPendientes.length){
                    $.mobile.loading( 'show', {
                        text: ' [' + contForms + '] Forms Enviados Correctamente',
                        textVisible: true,
                        textonly:true,
                        theme: 'a',
                        html: ''
                    });
                    formsPendientes();
                    setTimeout(function(){  $.mobile.loading('hide'); }, 2000);
                }
            }
        });        
    }
    

    
}

function envioForm(){
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

    setTimeout(function(){
        for(i=0; i<vFormData.vdata.length; i++){
            //console.log(vFormData.vdata[i].id);
            x1 = document.getElementById(vFormData.vdata[i].id).value;
            temArr.push({q:vFormData.vdata[i].name, r:x1});
        }

        tempForm[0].vdata = JSON.stringify(temArr);
        tempForm[0].fech = getYMD(0) + getHMS();
        tempForm[0].lat = vLat;
        tempForm[0].lng = vLng;
        
        //console.log((temArr).toString());
        $.ajax({
                url:ws_url,
                type:'POST',
                data:{m:302,vx:userWS, vy:pdwWS, ui:vDatosUsuario.user, forms:tempForm[0]},        
                dataType:'text',
                success: function(data){
                    console.log(data);
                    var vflag = data.split('/');
                    if(vflag[0] == 'SUCCESS'){
                        vQuery = 'INSERT INTO tbl_forms_filled (id_form, dtos, date, status, lat, lng) ';
                        vQuery += 'VALUES(\'' +  tempForm[0].id_form + '\',\'' + (tempForm[0].vdata).toString() + '\',' + tempForm[0].fech + ',1,';
                        vQuery += tempForm[0].lat + ','+ tempForm[0].lng  +')';
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
                    vQuery += 'VALUES(\'' +  tempForm[0].id_form + '\',\'' + (tempForm[0].vdata).toString() + '\',' + tempForm[0].fech + ',0,';
                    vQuery += tempForm[0].lat + ','+ tempForm[0].lng  +')';
                    ejecutaSQL(vQuery, 0);

                    setTimeout(function(){  
                        $.mobile.loading('hide'); 
                        backButton();
                    }, 2000);
                }
            });  
    }, 4000);    

    
}