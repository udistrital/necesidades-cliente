'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:PdfnecesidadCtrl
 * @description
 * # PdfnecesidadCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('PdfnecesidadCtrl', function (pdfMakerNecesidadesService, $scope, $routeParams, necesidadService,catalogoRequest) {
    var self = this;
    $scope.IdNecesidad = $routeParams.IdNecesidad;

    self.generarNecesidad = function (IdNecesidad) {
      necesidadService.getFullNecesidad(IdNecesidad).then(function (trNecesidad) {
        trNecesidad=trNecesidad.data.Body;
        if (trNecesidad.ProductosCatalogoNecesidad && trNecesidad.ProductosCatalogoNecesidad !== null) {
          trNecesidad.ProductosCatalogoNecesidad.forEach(function(prod) {
              prod.valorIvaUnd=0;
              prod.ElementoNombre="";
              prod.ValorTotal=0;
              catalogoRequest.get('elemento', $.param({
                  query: "Id:"+prod.CatalogoId,
                  fields: 'Id,Nombre',
                  limit: -1,
                  sortby: "Nombre",
                  order: "asc",
              })).then(function (response) {
                  prod.ElementoNombre = response.data[0].Nombre;
              });
          })
        }
        $scope.trNecesidad = trNecesidad;
        pdfMakerNecesidadesService.docDefinition(trNecesidad).then(function (docDefinition) {
          var a = pdfMake.createPdf(docDefinition);
          a.getDataUrl(function (outDoc) {
            document.querySelector('#vistaPDF').src = outDoc;
          });
        });
      });
    };
    self.generarNecesidad($scope.IdNecesidad);

  });
