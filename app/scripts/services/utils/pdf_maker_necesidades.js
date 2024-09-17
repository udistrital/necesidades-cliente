'use strict';

angular.module('contractualClienteApp')
    .factory('pdfMakerNecesidadesService', function ($http, $filter, $translate, necesidadService, metasRequest) {
        var self = this;

        self.docDefinition = function (trNecesidad) {

            return new Promise(function (resolve, reject) {

                var imagen = { imagen: "" }
                var dataDias = necesidadService.calculo_total_dias_rev(trNecesidad.Necesidad.DiasDuracion);
                var jefeDependenciaDestino = {};
                var jefeDependenciaSolicitante = {};
                var dependenciaData = [];
                var apropiacionesData = [];
                var perfil_data = [];
                var TiposServicios;

                trNecesidad.Rubros.map(function(r){
                  r.Metas.map(function(res){
                    metasRequest.get("Meta/"+res.MetaId).then(function(resp){
                      res.Nombre = resp.data.Nombre;
                    })
                    res.Actividades.map(function(resa){

                      metasRequest.get("Actividad/"+resa.ActividadId).then(function(resp){

                        resa.Nombre = resp.data.Nombre;
                      })
                    })
                  })
                });

                try{
                  trNecesidad.Rubros.map(function(r) {
                    var valorRubroNecesidad = 0;
                    if(trNecesidad.Necesidad.TipoFinanciacionNecesidadId.CodigoAbreviacion === "I") {
                      for(var i = 0; i < r.Metas.length; i++) {
                        for(var j = 0; j < r.Metas[i].Actividades.length ; j++) {
                          for(var k = 0; k < r.Metas[i].Actividades[j].FuentesActividad.length ; k++) {
                            valorRubroNecesidad = valorRubroNecesidad + r.Metas[i].Actividades[j].FuentesActividad[k].MontoParcial;
                          }
                        }
                      }
                    }else{
                      for(var i = 0; i < r.Fuentes.length; i++) {
                        valorRubroNecesidad = valorRubroNecesidad + r.Fuentes[i].MontoParcial;
                      }
                    }
                    r.InfoRubro.ValorNecesidad = valorRubroNecesidad;
                  });
                }catch(e){
                  swal({
                    title: 'Uy, algo salio mal',
                    text: 'Descripcion: '+ e ,
                    type: "error",
                    width: 600,
                    showCloseButton: true,
                    confirmButtonText: $translate.instant("CERRAR")
                  });
                }

                $http.get("scripts/models/imagen.json").then(function (response) {
                    imagen = response.data;

                    return necesidadService.getJefeDependencia(trNecesidad.Necesidad.DependenciaNecesidadId.JefeDepDestinoId, true);
                }).then(function (JD) {
                    jefeDependenciaDestino = JD;

                    return necesidadService.getJefeDependencia(trNecesidad.Necesidad.DependenciaNecesidadId.JefeDepSolicitanteId, true);
                }).then(function (JD) {
                    jefeDependenciaSolicitante = JD;

                    return necesidadService.getAllDependencias();
                }).then(function (Dependencias) {
                    dependenciaData = Dependencias;
                    if(trNecesidad && trNecesidad.Rubros && trNecesidad.Rubros[0]){
                      apropiacionesData = trNecesidad.Rubros;
                    }else{
                      apropiacionesData = undefined;
                    }

                    $http.get("scripts/models/tipo_servicio.json").then(function (response) {
                      TiposServicios = response.data;
                    });
                    return necesidadService.getParametroEstandar();
                }).then(function (response) {
                    perfil_data = response.data;

                    var dependenciaDestino = dependenciaData.filter(function (d) { return d.Id === jefeDependenciaDestino.JefeDependencia.DependenciaId })[0]
                    var dependenciaSolicitante = dependenciaData.filter(function (d) { return d.Id === jefeDependenciaSolicitante.JefeDependencia.DependenciaId })[0]
                    var perfil, compraBool = false, compraString = "";

                    if(trNecesidad.Necesidad &&  trNecesidad.Necesidad.TipoContratoNecesidadId && trNecesidad.Necesidad.TipoContratoNecesidadId.Nombre){
                      if(trNecesidad.Necesidad.TipoContratoNecesidadId.Nombre == "Compra"){
                        perfil = {
                          ValorParametro: trNecesidad.Necesidad.TipoContratoNecesidadId.Nombre
                        };
                        compraString = trNecesidad.Necesidad.TipoContratoNecesidadId.Nombre;
                        compraBool = true;
                      }
                    }

                    if(trNecesidad.DetalleServicioNecesidad && trNecesidad.DetalleServicioNecesidad.TipoServicioId){
                      perfil = trNecesidad.DetalleServicioNecesidad ? TiposServicios.find(function(element){
                        return element.ID == trNecesidad.DetalleServicioNecesidad.TipoServicioId
                      }): {
                        ValorParametro: ""
                      };
                      if(compraBool){
                        perfil.ValorParametro = perfil.ValorParametro + " y " +compraString;
                      }
                    }else if(trNecesidad.DetallePrestacionServicioNecesidad && trNecesidad.DetallePrestacionServicioNecesidad.PerfilId){
                      perfil = trNecesidad.DetallePrestacionServicioNecesidad ? perfil_data.filter(function (d) {
                        return d.Id === trNecesidad.DetallePrestacionServicioNecesidad.PerfilId
                      })[0] : {
                          ValorParametro: ""
                      };
                    }
                    resolve({
                        header: function (currentPage, pageCount) {
                          return {
                            style: ['header', "p"],
                            margin: [50, 15, 50, 100],
                            table: {
                              // headers are automatically repeated if the table spans over multiple pages
                              // you can declare how many rows should be treated as headers
                              headerRows: 1,
                              widths: ['12%', '*', '40%'],
                              body: [
                                [
                                  {
                                    height: 60,
                                    width: 60,
                                    image: imagen.imagen,
                                    alignment: 'center',
                                    rowSpan: 4,
                                  },
                                  { text: "Solicitud Necesidad".toUpperCase(), rowSpan: 4, margin: [0, 33, 0, 0], style: "headerTitle" },
                                  { text: "Dependencia Solicitante", style: "title1", border: [true, true, true, false] }
                                ],
                                [
                                  "",
                                  "",
                                  { text: dependenciaSolicitante.Nombre.toUpperCase(), border: [true, false, true, true] }
                                ],
                                [
                                  "",
                                  "",
                                  {
                                    alignment: 'center',
                                    columns: [
                                      { text: "Vigencia " + trNecesidad.Necesidad.Vigencia, style: "title1" },
                                      { text: "No. Solicitud "+ trNecesidad.Necesidad.Consecutivo, style: "title1" }
                                    ],
                                    columnGap: 10
                                  }
                                ],
                                [
                                  "",
                                  "",
                                  { text:"Página " + currentPage.toString() + " de " + pageCount}
                                ]
                              ]
                            }
                          }
                        },
                        content: [
                            {
                                style: "p",
                                layout: {
                                    fillColor: function (i, node) {
                                      return (i % 2 === 1) ? '#CCCCCC' : null;
                                    }
                                },
                                table: {
                                    headerRows: 0,
                                    widths: ["100%"],
                                    body: [
                                        [{ alignment: "center", text: [{ bold: true, text: "Fecha de Solicitud: " }, moment(trNecesidad.Necesidad.FechaSolicitud).format("D [de] MMMM [de] YYYY")] }],
                                        [{ style: "title1", text: "JUSTIFICACIÓN (Identifique de forma clara y conta la necesidad de la contratación)" }],
                                        [{ alignment: "justify", text: trNecesidad.Necesidad.Justificacion.toUpperCase() }],
                                        [{ style: "title2", text: "ESPECIFICACIONES TÉCNICAS: Si la compra o el servicio contempla especificaciones del orden técnico descríbalas." }],
                                        [
                                          {
                                            table: {
                                              headerRows: 1,
                                              widths: ["auto", "*", "auto", "auto"],
                                              body: [
                                                ["Descripción", "", "Cantidad", "Unidad"],
                                                [
                                                  ["Cod. 1", "Especificación:"],
                                                  [{text: perfil.ValorParametro ?
                                                    perfil.ValorParametro : perfil.DESCRIPCION ? perfil.DESCRIPCION : "", bold: true}, compraBool ? "Productos" : "Actividades:",
                                                  {
                                                    text: compraBool ? trNecesidad.ProductosCatalogoNecesidad.map(function (prod, j){ return (j + 1).toString() + '. ' + prod.ElementoNombre + '.'}).join('\n \n')
                                                    :
                                                    trNecesidad.ActividadEspecificaNecesidad ?
                                                      trNecesidad.ActividadEspecificaNecesidad.map(function (ae, i) { return (i + 1).toString() + '. ' + ae.Descripcion + '.'}).join('\n \n') : "Ninguna", alignment: "justify"
                                                  }],
                                                  [{ text: compraBool ? trNecesidad.ProductosCatalogoNecesidad.map(function (prod){ return  "\n \n" + prod.Cantidad}).join('\n \n') : 1, alignment: 'center' }],
                                                  ""
                                                ]
                                              ]
                                            }
                                          }
                                        ],
                                        [{ style: "title1", text: "Información del contacto".toUpperCase() }],
                                        [[
                                          {
                                            columnGap: 10,
                                            columns: [
                                              { style: "title2", text: "Objeto:", width: "auto" },
                                              { alignment: "justify", text: trNecesidad.Necesidad.Objeto }
                                            ]
                                          },
                                          {
                                            columnGap: 10,
                                            columns: [
                                              { style: "title2", text: "Duración:", width: "auto" },
                                              { text: (trNecesidad.Necesidad.DiasDuracion == 0) ? 'PAGO ÚNICO' : 'Años: ' + dataDias.anos + ', Meses: ' + dataDias.meses + ', Días: ' + dataDias.dias }
                                            ]
                                          },
                                          {
                                            columnGap: 10,
                                            columns: [
                                              { style: "title2", text: "Valor Estimado:", width: "auto" },
                                              { text: $filter('currency')(trNecesidad.Necesidad.Valor, '$') }
                                            ]
                                          }
                                        ]],
                                        [{ style: "title1", text: "Datos del supervisor/interventor".toUpperCase() }],
                                        [[
                                            {
                                              columnGap: 10,
                                              columns: [
                                                { style: "title2", text: "Nombre:", width: "12%" },
                                                {
                                                  text: [
                                                    jefeDependenciaDestino.Persona.PrimerNombre,
                                                    jefeDependenciaDestino.Persona.SegundoNombre,
                                                    jefeDependenciaDestino.Persona.PrimerApellido,
                                                    jefeDependenciaDestino.Persona.SegundoApellido
                                                  ].join(" ").toUpperCase()
                                                }
                                              ]
                                            },
                                            {
                                              columnGap: 10,
                                              columns: [
                                                { style: "title2", text: "Dependencia:", width: "12%" },
                                                { text: dependenciaDestino.Nombre.toUpperCase() }
                                              ]
                                            },
                                        ]],
                                        [{ style: "title1", text: "Plan de Contratación/Rubro Presupuestal y/o centro de costos".toUpperCase() }],
                                        // [//generar desde aqui curl http://10.20.0.254/financiera_api/v1/apropiacion/?query=Id:44529
                                        [
                                          Array.prototype.concat.apply([], apropiacionesData.map(function (apg, i) {
                                            if(trNecesidad.Necesidad.TipoFinanciacionNecesidadId.CodigoAbreviacion === "I") {
                                              return [{
                                                margin: [0, 0, 0, 5],
                                                columnGap: 10,
                                                columns: [
                                                  { text: apg.InfoRubro.Codigo, width: "auto" },
                                                  { text: apg.InfoRubro.Nombre.toUpperCase(), width: "*" },
                                                  { text: $filter('currency')(apg.InfoRubro.ValorNecesidad, '$'), width: "auto" }
                                                ]
                                              }].concat([
                                                {
                                                  margin: [0, 5, 0, 5],
                                                  alignment: "center",
                                                  columnGap: 10,
                                                  columns: [
                                                    { text: "", width: "5%" },
                                                    { text: "Meta".toUpperCase() },
                                                    { text: "", width: "6%" },
                                                    { text: "Descripción".toUpperCase() },
                                                    { text: "" },
                                                  ]
                                                }
                                              ]).concat(
                                                apg.Metas.map(function (m) {
                                                  return [{
                                                    columnGap: 10,
                                                    columns: [
                                                      { text: "", width: "6%" },
                                                      { text: m.MetaId,  width: "15%" },
                                                      { text: "", width: "6%" },
                                                      { text: m.Nombre },
                                                      { text: "" },
                                                    ]
                                                  }].concat([
                                                    {
                                                      margin: [0, 5, 0, 5],
                                                      alignment: "center",
                                                      columnGap: 10,
                                                      columns: [
                                                        { text: "", width: "5%" },
                                                        { text: "Actividad".toUpperCase() },
                                                        { text: "", width: "6%" },
                                                        { text: "Descripción".toUpperCase() },
                                                        { text: "" },
                                                      ]
                                                    }
                                                  ]).concat(
                                                    m.Actividades.map(function (Actividad) {
                                                      return [{
                                                        columnGap: 10,
                                                        columns: [
                                                          { text: "", width: "5%" },
                                                          { text: Actividad.ActividadId,  width: "15%"},
                                                          { text: "", width: "6%" },
                                                          { text: Actividad.Nombre },
                                                          { text: "" },
                                                        ]
                                                      }].concat([
                                                        {
                                                          margin: [0, 5, 0, 5],
                                                          alignment: "center",
                                                          columnGap: 10,
                                                          columns: [
                                                            { text: "", width: "5%" },
                                                            { text: "Fuente".toUpperCase() },
                                                            { text: "", width: "6%" },
                                                            { text: "Descripción".toUpperCase() },
                                                            { text: "" },
                                                          ]
                                                        }
                                                      ]).concat(
                                                        Actividad.FuentesActividad.map(function (f)  {
                                                          return {
                                                            columnGap: 10,
                                                            columns: [
                                                              { text: "", width: "5%" },
                                                              { text: f.InfoFuente.Codigo,  width: "15%"},
                                                              { text: "", width: "6%" },
                                                              { text: f.InfoFuente.Nombre },
                                                              { text: $filter('currency')(f.MontoParcial, '$'), width: "auto" },
                                                            ]
                                                          }
                                                        })
                                                      )
                                                   })
                                                  )
                                                })
                                              ).concat([
                                                {
                                                  margin: [0, 5, 0, 5],
                                                  alignment: "center",
                                                  columnGap: 10,
                                                  columns: [
                                                    { text: "", width: "5%" },
                                                    { text: "Producto".toUpperCase() },
                                                    { text: "", width: "6%" },
                                                    { text: "Descripción".toUpperCase() },
                                                    { text: "" },
                                                  ]
                                                }
                                              ]).concat(
                                                apg.Productos != null ? apg.Productos.map(function (p) {
                                                  if(p.InfoProducto){
                                                    return {
                                                      columnGap: 10,
                                                      columns: [
                                                        { text: "", width: "5%" },
                                                        { text: p.InfoProducto.Nombre.toUpperCase() ,  width: "35%"},
                                                        { text: "", width: "6%" },
                                                        { text: p.InfoProducto.Descripcion },
                                                        { text: "" },
                                                      ]
                                                    }
                                                  } else {
                                                    return {
                                                      columnGap: 10,
                                                      columns: [
                                                      ]
                                                    }
                                                  }
                                                }) : ""
                                              );
                                            } else {
                                              return [{
                                                margin: [0, 0, 0, 5],
                                                columnGap: 10,
                                                columns: [
                                                  { text: apg.InfoRubro.Codigo, width: "auto" },
                                                  { text: apg.InfoRubro.Nombre.toUpperCase(), width: "*" },
                                                  { text: $filter('currency')(apg.InfoRubro.ValorNecesidad, '$'), width: "auto" }
                                                ]
                                              }].concat([
                                                {
                                                  alignment: "center",
                                                  columnGap: 10,
                                                  columns: [
                                                    { text: "", width: "5%" },
                                                    { text: "Fuente".toUpperCase() },
                                                    { text: "", width: "6%" },
                                                    { text: "Descripción".toUpperCase() },
                                                    { text: "" },
                                                  ]
                                                }
                                              ]).concat(
                                                apg.Fuentes.map(function (f, i) {
                                                  return {
                                                    columnGap: 10,
                                                    columns: [
                                                      { text: "", width: "5%" },
                                                      { text: f.InfoFuente.Codigo, width: "15%" },
                                                      { text: "", width: "6%" },
                                                      { text: f.InfoFuente.Nombre },
                                                      { text: $filter('currency')(f.MontoParcial, '$'), width: "auto" },
                                                    ]
                                                  }
                                                })
                                              );
                                            }
                                          }))
                                        ],
                                        [{ style: "title1", text: "Marco Legal".toUpperCase() }],
                                        [{
                                          text: (trNecesidad.MarcoLegalNecesidad && trNecesidad.MarcoLegalNecesidad.length > 0) ?
                                            trNecesidad.MarcoLegalNecesidad.map(function (ml, i) { return (i + 1).toString() + ". " + ml.MarcoLegalId.NombreDocumento }).join("\n") : "Ninguno"
                                        }],
                                        [{ style: "title1", text: "Requisitos Mínimos".toUpperCase() }],
                                        [[
                                          {
                                            table: {
                                              headerRows: 1,
                                              widths: ["auto", "*", "*"],
                                              body: [
                                                ["Secuencia", "Requisito", "Observaciones"],
                                                [ trNecesidad.RequisitoMinimoNecesidad ? trNecesidad.RequisitoMinimoNecesidad.map(function (rmn, i) { return (i + 1).toString()}).join('\n \n') : "",
                                                  {text: trNecesidad.RequisitoMinimoNecesidad ? trNecesidad.RequisitoMinimoNecesidad.map(function (rmn, i) { return  perfil.ValorParametro ?
                                                    perfil.ValorParametro : perfil.DESCRIPCION ? perfil.DESCRIPCION:""}).join('\n \n') : "" , bold: true},
                                                  trNecesidad.RequisitoMinimoNecesidad ? trNecesidad.RequisitoMinimoNecesidad.map(function (rmn, i) { return rmn.Descripcion + '.'}).join('\n \n') : "" ]
                                              ]
                                            }
                                          }
                                        ]],
                                        [""],
                                        [{
                                          alignment: "center",
                                          margin: [10, 30, 10, 20],
                                          stack: [
                                            {
                                              text: [
                                                jefeDependenciaSolicitante.Persona.PrimerNombre,
                                                jefeDependenciaSolicitante.Persona.SegundoNombre,
                                                jefeDependenciaSolicitante.Persona.PrimerApellido,
                                                jefeDependenciaSolicitante.Persona.SegundoApellido
                                              ].join(" ").toUpperCase()
                                            },
                                            { bold: true, text: "___________________________________________________" },
                                            { bold: true, text: "Firma del Responsable de la dependencia solicitante" }
                                          ]
                                        }]
                                    ]
                                }
                            }
                        ],
                        styles: {
                          header: {
                            alignment: 'center',
                          },
                          p: {
                            fontSize: 9
                          },
                          headerTitle: {
                            fontSize: 10,
                            bold: true,
                            alignment: "center"
                          },
                          title1: {
                            fontSize: 9,
                            bold: true,
                            alignment: "center"
                          },
                          title2: {
                            fontSize: 9,
                            bold: true,
                          }
                        },
                        pageMargins: [50, 100, 50, 60],
                        // a string or { width: number, height: number }
                        pageSize: 'letter',

                        // by default we use portrait, you can change it to landscape if you wish
                        pageOrientation: 'portrait',
                    });
                });
            });
        };
        return self;
    });
