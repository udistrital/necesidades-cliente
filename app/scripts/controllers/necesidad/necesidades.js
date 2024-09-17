'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:NecesidadNecesidadesCtrl
 * @description
 * # NecesidadNecesidadesCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
    .controller('NecesidadesCtrl', function ($scope, planCuentasMidRequest, agoraRequest, parametrosRequest,catalogoRequest, necesidadService, $translate, $window,$http, $mdDialog, gridApiService, necesidadesCrudRequest, terceroMidRequest, coreAmazonRequest) {
        var self = this;
        self.offset = 0;
        self.rechazada = false;
        self.buttons = {
            AprobarSolicitud: true,
            AprobarNecesidad: true,
            RechazarNecesidad: true,
            EditarNecesidad: true,
            SolicitarCDP: true,
            AprobarCDP: true,
            CrearPDF: true
        };

        self.modalidadSel = {};
        self.TipoContrato = {};
        // self.unidadE = "";
        // self.unidadE = self.area_funcional_data.filter(function(a){
        //     if(a.Id === row.entity.UnidadEjecutora){
        //         return a.Nombre;
        //     }
        // });

        //permisos de los buttons segun el rol
        /*         rolesService.buttons('NecesidadesCtrl', rolesService.roles()).then(function (data) {
                    self.buttons = data;
                }); */

        self.area_funcional_data = [{ Id: 1, Nombre: 'Rector' },
                                    { Id: 2, Nombre: 'Convenios' },
                                    { Id: 3, Nombre: 'IDEXUD' }];

        self.buscarUE = function (idUE) {
            self.area_funcional_data.filter(function (e) {
                if (idUE === e.Id) {
                    return e.Nombre;
                } else {
                    return "Rector";
                }

            });
        };
        parametrosRequest.get('parametro_periodo', $.param({ // traer datos de iva y ponerlos en productos y servivios
            limit: -1,
            query: 'ParametroId.TipoParametroId.Id:12,PeriodoId.Activo:true'
        })).then(function (response) {
            self.iva_data= self.transformIvaData(response.data.Data);
        });

        necesidadService.getParametroEstandar().then(function (response) {
            self.perfil_data = response.data;
        });

        self.gridOptions = {
            paginationPageSizes: [50, 100, 150],
            paginationPageSize: 50,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableFiltering: true,
            enableHorizontalScrollbar: 0,
            enableVerticalScrollbar: 0,
            useExternalPagination: true,
            columnDefs: [{
                field: 'Id',
                displayName: $translate.instant('NUMERO_SOLICITUD_COMPACTO'),
                type: 'number',
                headerCellClass: $scope.highlightFilteredHeader + 'text-center text-info',
                cellTooltip: function (row) {
                    return row.entity.Id;
                },
                width: '15%'
            },{
                field: 'Consecutivo',
                displayName: $translate.instant('NUMERO_NECESIDAD_COMPACTO'),
                type: 'number',
                headerCellClass: $scope.highlightFilteredHeader + 'text-center text-info',
                cellTooltip: function (row) {
                    return row.entity.Consecutivo;
                },
                width: '15%'
            },
            {
                field: 'Vigencia',
                displayName: $translate.instant('VIGENCIA'),
                type: 'number',
                headerCellClass: $scope.highlightFilteredHeader + 'text-center text-info',
                cellTooltip: function (row) {
                    return row.entity.Vigencia;
                },
                width: '15%'
            },
            {
                field: 'EstadoNecesidadId.Nombre',
                displayName: $translate.instant('ESTADO'),
                headerCellClass: $scope.highlightFilteredHeader + 'text-center text-info',
                cellTooltip: function (row) {
                    return row.entity.EstadoNecesidadId.Nombre + ".\n" + row.entity.EstadoNecesidadId.Descripcion;
                },
                width: '25%'
            },
            {
                field: 'TipoNecesidadId.Nombre',
                displayName: $translate.instant('TIPO_NECESIDAD'),
                headerCellClass: $scope.highlightFilteredHeader + 'text-center text-info',
                cellTooltip: function (row) {
                    return row.entity.Vigencia;
                },
                width: '30%'
            },
            {
                field: 'ver',
                enableFiltering: false,
                enableSorting: false,
                displayName: $translate.instant('VER'),
                cellTemplate: function () {
                    return '<div class="col-md-3"></div><div class="col-md-2"><a href="" style="border:0; text-align: center; display: inline-block;" type="button" ><span class="fa fa-check-square faa-shake animated-hover"></span></a></div><div class="col-md-3"></div>';
                },
                headerCellClass: $scope.highlightFilteredHeader + 'text-center text-info',
                cellTooltip: function (row) {
                    return row.entity.EstadoNecesidad.Nombre + ".\n" + row.entity.EstadoNecesidad.Descripcion;
                }
            }],
            onRegisterApi: function (gridApi) {
                self.gridApi = gridApi;
                self.gridApi = gridApiService.pagination(self.gridApi, self.cargarDatosNecesidades, $scope);
                self.gridApi = gridApiService.filter(self.gridApi, self.cargarDatosNecesidades, $scope);
                self.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    necesidadService.getFullNecesidad(row.entity.Id).then(function (response) {
                        if (response.status === 200) {
                            var nec =response.data.Body
                            // console.info(self.necesidad)
                            //traer data de objetos para contratacion
                            //compra
                            if (nec.ProductosCatalogoNecesidad&&nec.ProductosCatalogoNecesidad!==null) {
                                nec.ProductosCatalogoNecesidad.forEach(function(prod) {
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
                                        calculoIVA(prod)
                                    });
                                })
                            }
                            //servicio
                            if(nec.DetalleServicioNecesidad && nec.DetalleServicioNecesidad.TipoServicioId) {
                                nec.DetalleServicioNecesidad.ValorTotal=0;
                                nec.DetalleServicioNecesidad.valorIvaUnd=0;
                                nec.DetalleServicioNecesidad.TipoServicioNombre="";
                                calculoIVA(nec.DetalleServicioNecesidad);
                                $http.get("scripts/models/tipo_servicio.json")
                                .then(function (response) {
                                    nec.DetalleServicioNecesidad.TipoServicioNombre=response.data.filter(function(s){
                                        return s.ID===nec.DetalleServicioNecesidad.TipoServicioId
                                    })[0].DESCRIPCION;
                                });
                            }

                            //cps
                            if (nec.DetallePrestacionServicioNecesidad && nec.DetallePrestacionServicioNecesidad.PerfilId) {
                                nec.DetallePrestacionServicioNecesidad.PerfilNombre="";
                                nec.DetallePrestacionServicioNecesidad.PerfilNombre=self.perfil_data.filter(function(p){
                                    return p.Id===nec.DetallePrestacionServicioNecesidad.PerfilId;
                                })[0].ValorParametro;
                            }
                            if (nec.DetallePrestacionServicioNecesidad && nec.DetallePrestacionServicioNecesidad.NucleoConocimientoId) {
                                nec.DetallePrestacionServicioNecesidad.NucleoConocimientoNombre="";
                                nec.DetallePrestacionServicioNecesidad.NucleoConocimientoArea="";
                                parametrosRequest.get('parametro', $.param({
                                    query: 'TipoParametroId:4,Id:' + nec.DetallePrestacionServicioNecesidad.NucleoConocimientoId,
                                    limit: -1
                                })).then(function (response) {
                                    nec.DetallePrestacionServicioNecesidad.NucleoConocimientoNombre=response.data.Data[0].Nombre;
                                    nec.DetallePrestacionServicioNecesidad.NucleoConocimientoArea=response.data.Data[0].ParametroPadreId.Nombre;
                                })

                            }
                            self.necesidad = nec;
                            var necesidad= self.necesidad.Necesidad

                            self.g_necesidad = necesidad;
                            self.numero_el = necesidad.NumeroElaboracion;
                            self.vigencia = necesidad.Vigencia;
                            self.modalidadSel = necesidad.ModalidadSeleccion;

                            //para mostrar informacion de rechazo


                            // validaciones para los botones: (estado) && (permisos rol)
                            var aproOrRech = [necesidadService.EstadoNecesidadType.Solicitada.Id, necesidadService.EstadoNecesidadType.Modificada.Id,]
                                .includes(necesidad.EstadoNecesidadId.Id);

                            self.verBotonAprobarSolicitud = necesidadService.EstadoNecesidadType.Guardada.Id===necesidad.EstadoNecesidadId.Id&&necesidad.JustificacionRechazo!==1; // Cuando este Guardada (Borrador)
                            self.verBotonAprobarNecesidad = aproOrRech && self.buttons.AprobarNecesidad;
                            self.verBotonRechazarNecesidad = aproOrRech && self.buttons.RechazarNecesidad;
                            self.verBotonEditarNecesidad = necesidadService.EstadoNecesidadType.Rechazada.Id === necesidad.EstadoNecesidadId.Id ||  necesidadService.EstadoNecesidadType.Guardada.Id === necesidad.EstadoNecesidadId.Id ||  necesidadService.EstadoNecesidadType.Modificada.Id === necesidad.EstadoNecesidadId.Id && self.buttons.EditarNecesidad;
                            self.verBotonSolicidadCDPNecesidad = necesidadService.EstadoNecesidadType.Aprobada.Id === necesidad.EstadoNecesidadId.Id && self.buttons.SolicitarCDP;
                            self.verBotonAprobarCDPNecesidad = necesidadService.EstadoNecesidadType.CDPExpedido.Id === necesidad.EstadoNecesidadId.Id && self.buttons.AprobarCDP;
                            self.verBotonCrearPDFNecesidad = necesidadService.EstadoNecesidadType.Aprobada.Id === necesidad.EstadoNecesidadId.Id && self.buttons.CrearPDF || self.buttons.AprobarCDP || self.buttons.SolicitarCDP;
                            $("#myModal").modal();
                        }
                    });
                });
            }
        };
        self.gridOptions.multiSelect = false;

        function calculoIVA(elemento) {
            var tarifa=self.iva_data.filter(function(i) { return i.Id === elemento.IvaId})[0].Tarifa;
            elemento.valorIvaUnd=elemento.Valor*(tarifa/100);
            elemento.Cantidad ? elemento.ValorTotal=elemento.Cantidad*(elemento.Valor+elemento.valorIvaUnd) : elemento.ValorTotal= elemento.Valor+elemento.valorIvaUnd;
        }


        //Funcion para cargar los datos de las necesidades creadas y almacenadas dentro del sistema
        self.cargarDatosNecesidades = function (offset, query) {
            if (query === undefined) { query = []; }
            query = typeof (query) === "string" ? [query] : query;
            //query.push("EstadoNecesidad.Nombre__not_in:Borrador");
            var req;
            req = necesidadesCrudRequest.get('necesidad', $.param({
              query: query,
              limit: self.gridOptions.paginationPageSize,
              offset: offset,
              sortby: "Id",
              order: "desc"
            }, true));
            req.then(gridApiService.paginationFunc(self.gridOptions, offset));
            return req;
        };

        terceroMidRequest
        .get("propiedad/dependencia/" + window.localStorage.getItem("idTercero"))
          .then(function (Dependencias) {
            //trae lista dependencias
            if (Dependencias.data !== null) {
              self.dependencia_soli_data = Dependencias.data;
            } else {
              swal({
                title: "Sin dependencias",
                type: "error",
                text: "No tiene dependencias relacionadas",
                showCloseButton: true,
                confirmButtonText: $translate.instant("CERRAR"),
              });
            }
            coreAmazonRequest
            .get("ordenador_gasto",
              $.param({
                limit: -1,
                sortby: "Cargo",
                order: "asc",
              }))
              .then(function (response) {
                self.ordenador_gasto_data = response.data;
                self.cargarQuery(self.ordenador_gasto_data);
                self.cargarDatosNecesidades(self.offset, self.query);
              })
              .catch(function (err) {
                console.info(err);
              });
          });

        self.cargarQuery = function(infoDep) {
          var RolOrdenadorGastoDep;
          self.dependencia_soli_data.forEach(function(depen){
            RolOrdenadorGastoDep = infoDep
            .filter(function(rolf){
              return rolf.DependenciaId === depen.Id;
            })
            .map(function(rol){
              return rol.DependenciaId;
            })
            .join("|")
          });
          if(RolOrdenadorGastoDep){
            self.query = "DependenciaNecesidadId__RolOrdenadorGasto__in:" + RolOrdenadorGastoDep;
          } else {
            const deps = self.dependencia_soli_data.map(function(dep){
              return dep.Id;
            }).join("|");
            self.query = "DependenciaNecesidadId__DependenciaSolicitante__in:" + deps;
          }
        }

        self.transformIvaData = function(data) { // Transformar datos de IVA
            if (data) {
                return data.map(function (element) {
                    const datos = JSON.parse(element.Valor);
                    element.Tarifa = datos.Tarifa;
                    element.PorcentajeAplicacion = datos.PorcentajeAplicacion;
                    element.BaseUvt = datos.BaseUvt;
                    element.BasePesos = datos.BasePesos;
                    element.ImpuestoId = element.ParametroId;
                    return element;
                })
            } else {
                return undefined;
            }
        }

        self.aprobar_solicitud = function () {
            self.necesidad.Necesidad.EstadoNecesidadId = necesidadService.EstadoNecesidadType.Solicitada;
            necesidadesCrudRequest.put('necesidad', self.necesidad.Necesidad.Id, self.necesidad.Necesidad).then(function (l) {
                if (l.data !== undefined) {
                    swal(
                       {
                            title: 'Se ha creado la Solicitud de necesidad N° ' + self.necesidad.Necesidad.Id + ' exitosamente. ',
                            text: 'El borrador de la solicitud se ha aprobado y se ha generado la Solicitud de Necesidad N°' + self.necesidad.Necesidad.Id ,
                            type: "success",
                            width: 600,
                            showCloseButton: true,
                            confirmButtonText: $translate.instant("CERRAR")
                        }
                    );
                    self.cargarDatosNecesidades(self.offset, self.query);
                    $("#myModal").modal("hide");
                } else {
                    swal(
                        $translate.instant("ERROR"),
                        $translate.instant("NECESIDAD_NO_SOLICITADA"),
                        'error'
                    );
                }
            });
        };



        self.aprobar_necesidad = function () {
            if (!self.modalidadSel || !self.TipoContrato) {
                swal(
                    {
                        title: 'Error al aprobar necesidad. ',
                        text: 'Por favor, seleccione la modalidad de selección y el tipo de contrato antes de aprobar la necesidad.',
                        type: "error",
                        width: 600,
                        showCloseButton: true,
                        confirmButtonText: $translate.instant("CERRAR")
                    }
                )
                return
            }

            const necesidadCopia=JSON.parse(JSON.stringify(self.necesidad.Necesidad));

            necesidadCopia.EstadoNecesidadId = necesidadService.EstadoNecesidadType.Aprobada;
            necesidadCopia.ModalidadSeleccionId = self.modalidadSel;
            necesidadCopia.TipoContratoId = self.TipoContrato.Id;

            necesidadesCrudRequest.put('necesidad', necesidadCopia.Id, necesidadCopia).then(function (l) {
              console.log(l.headers());
                if (l.data !== undefined && l.data.Id !== 0 && l.status === 200) {
                    self.necesidad.Necesidad.EstadoNecesidadId = necesidadCopia.EstadoNecesidadId;
                    self.necesidad.Necesidad.ModalidadSeleccionId = necesidadCopia.ModalidadSeleccionId;
                    self.necesidad.Necesidad.TipoContratoId = necesidadCopia.TipoContratoId;
                    swal(
                        {
                          title: 'Se ha creado la Necesidad N° '+self.necesidad.Necesidad.Id +' exitosamente. ',
                          text: 'La solicitud de necesidad ha sido aprobada y se ha generado la Necesidad N°' + self.necesidad.Necesidad.Id ,
                          type: "success",
                          width: 600,
                          showCloseButton: true,
                          confirmButtonText: $translate.instant("CERRAR")
                        }
                    );
                    self.cargarDatosNecesidades(self.offset, self.query);
                    $("#myModal").modal("hide");
                } else if(l.status === 409){
                  swal(
                    {
                      title: 'No hay monto disponible en el Rubro '+self.necesidad.Rubros[0].RubroId,
                      text: 'Se recomienda cambiar el rubro con un mayor monto que cubra el valor de la necesidad',
                      type: "error",
                      width: 600,
                      showCloseButton: true,
                      confirmButtonText: $translate.instant("CERRAR")
                    }
                  );
                  $("#myModal").modal("hide");
                } else {
                    swal(
                        $translate.instant("ERROR"),
                        $translate.instant("NECESIDAD_NO_APROBADA"),
                        'error'
                    );
                }
            });
        };

        self.rechazar_necesidad = function () {
            var nec_rech = {};
            swal({
                title: 'Indica una justificación por el rechazo',
                input: 'textarea',
                showCancelButton: true,
                inputValidator: function (value) {
                    return new Promise(function (resolve, reject) {
                        if (value && value !== "") {
                            resolve();
                        } else {
                            reject('Por favor indica una justificación!');
                        }
                    });
                }
            }).then(function (text) {
                nec_rech = {
                    Justificacion: text,
                    NecesidadId: { Id: self.necesidad.Necesidad.Id },
                    FechaRechazo: new Date()
                };

            }).then(function () {
                if (self.necesidad.Necesidad.EstadoNecesidadId.Id === necesidadService.EstadoNecesidadType.Solicitada.Id) {
                    self.necesidad.Necesidad.EstadoNecesidadId = necesidadService.EstadoNecesidadType.Rechazada;
                } else if (self.necesidad.Necesidad.EstadoNecesidadId.Id === necesidadService.EstadoNecesidadType.Modificada.Id) {
                    self.necesidad.Necesidad.EstadoNecesidadId = necesidadService.EstadoNecesidadType.Anulada;
                }


            }).then(function () {
                return necesidadesCrudRequest.post('necesidad_rechazada', nec_rech);
            }).then(function (response) {
                if (response.status === 200 || response.status === 201) {
                    swal(
                        {
                             title: 'Se ha rechazado la Solicitud de Necesidad N° '+self.necesidad.Necesidad.Id,
                             text: 'La solicitud de necesidad ha sido rechazada',
                             type: "success",
                             width: 600,
                             showCloseButton: true,
                             confirmButtonText: $translate.instant("CERRAR")
                         }
                     );
                    necesidadesCrudRequest.put('necesidad', self.necesidad.Necesidad.Id, self.necesidad.Necesidad);
                } else {
                    swal(
                        $translate.instant("ERROR"),
                        $translate.instant("NECESIDAD_NO_RECHAZADA"),
                        'error'
                    );
                }
                self.cargarDatosNecesidades(self.offset, self.query);
                self.g_necesidad = undefined;
                $("#myModal").modal("hide");
            });
        };

        necesidadesCrudRequest.get('modalidad_seleccion', $.param({
            limit: -1,
            sortby: "NumeroOrden",
            order: "asc",
        })).then(function (response) {
            self.modalidad_data = response.data;

        });

        agoraRequest.get('tipo_contrato', $.param({
            limit: -1,
            sortby: "Id",
            order: "asc",
        })).then(function (response) {
            self.tipo_contrato_data = response.data;

        });

        self.editar_necesidad = function () {
            var idNecesidad = self.g_necesidad.Id;
            $("#myModal").modal("hide");
            $('#myModal').on('hidden.bs.modal', function () {
                $window.location.href = '#/necesidad/solicitud_necesidad/' + idNecesidad;
            });
        };

        self.crear_pdf_necesidad = function () {
            var idNecesidad = self.g_necesidad.Id;
            $("#myModal").modal("hide");
            $('#myModal').on('hidden.bs.modal', function () {
                $window.location.href = '#/necesidad/necesidad-pdf/' + idNecesidad;
            });
        };

        self.solicitar_cdp = function () {
            planCuentasMidRequest.post("cdp/solicitarCDP", self.necesidad.Necesidad).then(
                function (response) {
                    if (response.status === 200 || response.status === 201) {
                        self.necesidad.Necesidad.EstadoNecesidadId = necesidadService.EstadoNecesidadType.CdpSolicitado;
                        self.necesidad.Necesidad.TipoContratoId = self.necesidad.Necesidad.TipoContratoId.Id;
                        var consec_cdp = response.data.Body.consecutivo;
                        necesidadesCrudRequest.put('necesidad', self.necesidad.Necesidad.Id, self.necesidad.Necesidad).then(function (resp_nececesidad) {
                            if (resp_nececesidad.status === 200 || resp_nececesidad.status === 201) {
                                swal(

                                    {
                                        title: 'Se ha creado la solicitud de CDP N° '+consec_cdp,
                                        text: $translate.instant("CDP_SOLICITADO"),
                                        type: "success",
                                        width: 600,
                                        showCloseButton: true,
                                        confirmButtonText: $translate.instant("CERRAR")
                                    }
                                );
                                self.cargarDatosNecesidades(self.offset, self.query);
                                self.necesidad = undefined;
                                $("#myModal").modal("hide");
                            } else {
                                swal(
                                    $translate.instant("ERROR"),
                                    $translate.instant("CDP_NO_SOLICITADO"),
                                    'error'
                                );
                            }

                        });
                    } else {
                        swal(
                            $translate.instant("ERROR"),
                            $translate.instant("CDP_NO_SOLICITADO"),
                            'error'
                        );
                    }

                });
        };

        self.aprobar_cdp = function () {

            var actualizar_cdp = {
                _id: self.necesidad.documento_cdp._id,
                vigencia: self.necesidad.documento_cdp.Vigencia,
                area_funcional: self.necesidad.documento_cdp.CentroGestor,
            }
            planCuentasMidRequest.post("cdp/aprobar_cdp",actualizar_cdp ).then(
                function (response) {
                    if (response.status === 200 || response.status === 201) {
                        self.necesidad.Necesidad.EstadoNecesidadId = necesidadService.EstadoNecesidadType.CDPAprobado;
                        self.necesidad.Necesidad.TipoContratoId = self.necesidad.Necesidad.TipoContratoId.Id;
                        var consec_cdp = response.data.Body.consecutivo;
                        necesidadesCrudRequest.put('necesidad', self.necesidad.Necesidad.Id, self.necesidad.Necesidad).then(function (resp_nececesidad) {
                            if (resp_nececesidad.status === 200 || resp_nececesidad.status === 201) {
                                swal(

                                    {
                                        title: 'Se ha aprobado el CDP N° '+self.necesidad.documento_cdp.Consecutivo,
                                        text: $translate.instant("CDP_APROBADO"),
                                        type: "success",
                                        width: 600,
                                        showCloseButton: true,
                                        confirmButtonText: $translate.instant("CERRAR")
                                    }
                                );
                                self.cargarDatosNecesidades(self.offset, self.query);
                                self.necesidad = undefined;
                                $("#myModal").modal("hide");
                            } else {
                                swal(
                                    $translate.instant("ERROR"),
                                    $translate.instant("CDP_NO_APROBADO"),
                                    'error'
                                );
                            }

                        });
                    } else {
                        swal(
                            $translate.instant("ERROR"),
                            $translate.instant("CDP_NO_SOLICITADO"),
                            'error'
                        );
                    }

                });
        }

        $scope.crearPDF = function (row) {
            var IdNecesidad = row.Id;

            $mdDialog.show({
                templateUrl: 'views/necesidad/pdfnecesidad.html',
                controller: 'PdfnecesidadCtrl',
                controllerAs: 'necesidadPdf',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: true,
                scope: { IdNecesidad: IdNecesidad }
            });
        };

    });
