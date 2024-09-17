'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('MainCtrl', function (terceroCrudRequest) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    //Guarda el idTercero de quien ingreso al cliente
    var id_token = window.localStorage.getItem('id_token').split('.');
    var payload = JSON.parse(atob(id_token[1]));
    var tipo = payload.documento_compuesto.split(payload.documento)
    terceroCrudRequest.get("datos_identificacion",{
      limit:"-1",
      fields:"TerceroId",
      query:"Activo:true,TipoDocumentoId__CodigoAbreviacion:"+ tipo[0] +",Numero:" + payload.documento
    })
    .then(function(res){
        window.localStorage.setItem("idTercero", res.data[0].TerceroId.Id);
    })

  });
