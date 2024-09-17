"use strict";

/**
 *
 * @ngdoc function
 * @name contractualClienteApp.controller:NecesidadSolicitudNecesidadCtrl
 * @description
 * # NecesidadSolicitudNecesidadCtrl
 * Controller of the contractualClienteApp
 */
angular
  .module("contractualClienteApp")
  .controller(
    "SolicitudNecesidadCtrl",
    function (
      necesidadesCrudRequest,
      planCuentasMidRequest,
      $scope,
      $sce,
      $http,
      $filter,
      $window,
      agoraRequest,
      parametrosRequest,
      catalogoRequest,
      coreAmazonRequest,
      $translate,
      $routeParams,
      necesidadService,
      planAdquisicionRequest,
      configuracionRequest,
      terceroMidRequest
    ) {
      var self = this;
      //inicializar Necesidad
      self.Necesidad = {
        DependenciaNecesidadId: {
          InterventorId: undefined,
          JefeDepDestinoId: undefined,
          JefeDepSolicitanteId: undefined,
          SupervisorId: undefined,
        },
        Valor: 0,
      };
      //inicializar objetos necesidad
      self.DetalleServicioNecesidad = {};
      self.DetallePrestacionServicioNecesidad = {};
      self.ProductosCatalogoNecesidad = [];
      self.MarcoLegalNecesidad = [];
      self.ActividadEspecificaNecesidad = [];
      self.RequisitoMinimoNecesidad = [];
      self.ActividadEconomicaNecesidad = [];
      self.Rubros = [];
      self.tempRubros = [];
      self.movimiento = [];

      // se obtiene idnecesidad de la ruta
      self.IdNecesidad = $routeParams.IdNecesidad;
      self.iva_data = undefined;
      self.documentos = [];
      self.avance = undefined;
      self.formuIncompleto = true;
      self.meta = undefined;
      self.meta_necesidad = {
        Meta: undefined,
        Actividades: [],
        MontoPorMeta: 0,
      };
      self.actividades = undefined;
      self.apSelected = false;
      self.apSelectedOb = undefined;
      self.jefes_dep_data = undefined;
      self.producto_catalogo = {};
      self.producto_catalogo.RequisitosMinimos = [];

      // obtener vigencia, provisional
      self.fecha_actual = new Date();
      self.deepCopy = function (obj) {
        return JSON.parse(JSON.stringify(obj));
      };
      self.anos = 0;
      self.meses = 0;
      self.dias = 0;

      self.enviando = false;
      self.mostrarFinanciacion = false;

      self.DuracionEspecial = "unico_pago";
      self.fecha = new Date();
      self.ActividadEspecifica = [];
      self.especificaciones = [];
      self.requisitos_minimos = [];
      self.actividades_economicas = [];
      self.actividades_economicas_id = [];
      self.productos = [];
      self.servicio_valor = 0;
      self.valor_compra_servicio = 0;
      self.meta_valor = 0;
      self.asd = [];
      self.valorTotalEspecificaciones = 0;
      self.subtotalEspecificaciones = 0;
      self.valorIVA = 0;
      self.FormularioSeleccionado = 0;
      self.tipoInterventor = false;

      self.duracionEspecialMap = {
        duracion: [true, false, false, undefined],
        unico_pago: [true, true, false, undefined],
        agotar_presupuesto: [true, false, true, undefined],
      };

      self.elaborando_necesidad = false; //variable que se toma como cirterio para reiniciar objetos, verdadera en primer cambio de form
      self.SeccionesFormulario = {
        // control stepper
        general: {
          activo: true,
          completado: true,
        },
        financiacion: {
          activo: true,
          completado: true,
        },
        legal: {
          activo: true,
          completado: true,
        },
        contratacion: {
          activo: true,
          completado: true,
        },
      };

      //Se asigna la lista de dependencias asociados al usuario o tercero que ingreso
      terceroMidRequest
        .get(
          "propiedad/dependencia/" + window.localStorage.getItem("idTercero")
        )
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
        });

      // El tipo de solicitud de contrato
      self.duracionEspecialFunc = function (especial) {
        // calculo de unidades de tiempo
        self.Necesidad.DiasDuracion = necesidadService.calculo_total_dias(
          self.anos,
          self.meses,
          self.dias
        );
        var s = self.duracionEspecialMap[especial];
        if (!s) {
          return;
        }
        self.ver_duracion_fecha = s[0];
      };

      self.duracionEspecialReverse = function () {
        self.ver_duracion_fecha = true;
      };

      self.recibirNecesidad = function (res) {
        // recibir el objeto del mid o un nuevo objeto y realizar mapeo correspondiente
        var trNecesidad = res.data ? res.data.Body : res; // identifica si viene del mid o es nuevo
        self.Necesidad = trNecesidad.Necesidad;
        if (self.Necesidad.DependenciaNecesidadId) {
          self.Necesidad.DependenciaNecesidadId.JefeDepSolicitanteId ? necesidadService.get_info_dependencia(
            self.Necesidad.DependenciaNecesidadId.JefeDepSolicitanteId
          ).then(function (response) {
            self.dependencia_solicitante = response.dependencia.Id; // traer dependencias partiendo de jefe de dependencia almacenado en necesidad
          }) : _;
          self.Necesidad.DependenciaNecesidadId.JefeDepDestinoId ? necesidadService.get_info_dependencia(
            self.Necesidad.DependenciaNecesidadId.JefeDepDestinoId
          ).then(function (response) {
            self.dependencia_destino = response.dependencia.Id;
          }) : _;

          if (self.Necesidad.DependenciaNecesidadId.OrdenadorGastoId) {
            necesidadService
              .get_info_dependencia(self.Necesidad.DependenciaNecesidadId.OrdenadorGastoId)
              .then(function (response) {
                self.rol_ordenador_gasto = response.dependencia.Id;
              });
          }
          if (self.Necesidad.DependenciaNecesidadId.InterventorId === 0) {//verifica si es supervisor o interventor
            self.tipoInterventor = false;
            if (self.Necesidad.DependenciaNecesidadId.SupervisorId) {
              necesidadService.get_info_dependencia(
                self.Necesidad.DependenciaNecesidadId.SupervisorId
              ).then(function (response) {
                self.dependencia_supervisor = response.dependencia.Id;
              });
            }
          } else {
            self.tipoInterventor = true;
            if (self.Necesidad.DependenciaNecesidadId.InterventorId) {
              self.dependencia_supervisor = necesidadService
                .getInfoPersonaNatural(self.Necesidad.DependenciaNecesidadId.InterventorId);
            }
          }
        }
        self.DetalleServicioNecesidad =
          trNecesidad.DetalleServicioNecesidad || {};

        self.DetallePrestacionServicioNecesidad =
          trNecesidad.DetallePrestacionServicioNecesidad || {};

        // CPS Nucleo Area y Nucleo Area Conocimiento
        if (
          self.DetallePrestacionServicioNecesidad &&
          self.DetallePrestacionServicioNecesidad.NucleoConocimientoId
        ) {
          parametrosRequest
            .get(
              "parametro",
              $.param({
                query:
                  "TipoParametroId:4,Activo:true,Id:" +
                  self.DetallePrestacionServicioNecesidad.NucleoConocimientoId,
                limit: -1,
              })
            )
            .then(function (response) {
              if (response.data.Data[0] !== undefined) {
                self.DetallePrestacionServicioNecesidad.NucleoId =
                  response.data.Data[0].ParametroPadreId;
                parametrosRequest
                  .get(
                    "parametro",
                    $.param({
                      limit: -1,
                      query:
                        "TipoParametroId:4,ParametroPadreId__isnull:true,Activo:true,Id:" +
                        self.DetallePrestacionServicioNecesidad.NucleoId.Id,
                    })
                  )
                  .then(function (response2) {
                    self.nucleoarea = response2.data.Data[0].Id;
                  });
              }
              setTimeout(function () {
                // ponser el valor del servicio cuando llegue la necesidad
                self.servicio_valor = self.Necesidad.Valor;
              }, 2000);
            });
        }

        self.ProductosCatalogoNecesidad =
          trNecesidad.ProductosCatalogoNecesidad || [];

        parametrosRequest
          .get(
            "parametro_periodo",
            $.param({
              // traer datos de iva y ponerlos en productos y servivios
              limit: -1,
              query: "ParametroId.TipoParametroId.Id:12,PeriodoId.Activo:true",
            })
          )
          .then(function (response) {
            self.iva_data = self.transformIvaData(response.data.Data);
            self.ProductosCatalogoNecesidad.forEach(function (prod) {
              prod.RequisitosMinimos === null
                ? (prod.RequisitosMinimos = [])
                : _;
              catalogoRequest
                .get(
                  "elemento",
                  $.param({
                    query: "Id:" + prod.CatalogoId,
                    fields: "Id,Nombre",
                    limit: -1,
                    sortby: "Nombre",
                    order: "asc",
                  })
                )
                .then(function (response) {
                  prod.ElementoNombre = response.data[0].Nombre;
                });
              if (self.iva_data !== undefined) {
                // calculo valores iva

                var tIva = self.getPorcIVAbyId(prod.IvaId);
                prod.Subtotal = prod.Cantidad * prod.Valor;
                prod.ValorIVA = prod.Subtotal * (tIva / 100) || 0;
                prod.preciomasIVA = prod.Subtotal + prod.ValorIVA || 0;
              }
            });
            var tIva =
              self.getPorcIVAbyId(self.DetalleServicioNecesidad.IvaId) || 0;
            self.val_iva = (self.DetalleServicioNecesidad.Valor * tIva) / 100;
            self.DetalleServicioNecesidad.Valor
              ? (self.DetalleServicioNecesidad.Total =
                self.val_iva + self.DetalleServicioNecesidad.Valor)
              : _;
            self.DetalleServicioNecesidad.Total
              ? (self.servicio_valor = self.DetalleServicioNecesidad.Total)
              : _;
          });
        self.MarcoLegalNecesidad = trNecesidad.MarcoLegalNecesidad || [];
        self.ActividadEspecificaNecesidad =
          trNecesidad.ActividadEspecificaNecesidad || [];
        self.RequisitoMinimoNecesidad =
          trNecesidad.RequisitoMinimoNecesidad || [];
        self.actividades_economicas_id =
          trNecesidad.ActividadEconomicaNecesidad || [];
        self.ActividadEconomicaNecesidad = [];

        self.tempRubros = trNecesidad.Rubros || [];
        self.tempRubros.forEach(function (r) {
          r.Fuentes === null ? (r.Fuentes = []) : _;
          r.Apropiacion = r.Apropiacion || r.InfoRubro;
          if (r.Productos) {
            r.Productos.forEach(function (p) {
              if (p.InfoProducto) {
                p = _.merge(p, p.InfoProducto); // mezclar la info de productos de plan cuentas con la de necesidades
              }
            });
          }
        });

        self.documentos = trNecesidad.MarcoLegalNecesidad
          ? trNecesidad.MarcoLegalNecesidad.map(function (d) {
            return d.MarcoLegalId;
          })
          : []; //id de marcos legales para seleccionar
        self.dependencia_solicitante = trNecesidad.DependenciaNecesidad;
        self.dependencia_destino = trNecesidad.DependenciaNecesidadDestino;
        self.rol_ordenador_gasto = trNecesidad.RolOrdenadorGasto;
        self.duracionEspecialReverse();
        var data = necesidadService.calculo_total_dias_rev(
          self.Necesidad.DiasDuracion
        );
        self.anos = data.anos;
        self.meses = data.meses;
        self.dias = data.dias;
      };

      necesidadService.getFullNecesidad(self.IdNecesidad).then(function (res) {
        self.recibirNecesidad(res);
        // en caso de que haya informacion pegada en el localstorage o se acceda de forma irregular a la url
        if (!self.IdNecesidad && self.Necesidad.Id) {
          self.ResetNecesidad();
          self.dependencia_solicitante = undefined;
          self.dependencia_destino = undefined;
          self.dependencia_supervisor = undefined;
          self.rol_ordenador_gasto = undefined;
        }
      });


      //Receptor de Movimiento
      $scope.$on('pasomovimiento', function (event, args) {
        if (self.movimiento && self.movimiento.length) {
          args.forEach(function (mov){
            self.movimiento.push(mov);
          });
        } else {
          self.movimiento = args;
        }
      });

      // watchers para actualizar informacion en el localstorage
      $scope.$watch(
        "solicitudNecesidad.Necesidad",
        function () {
          localStorage.setItem("Necesidad", JSON.stringify(self.Necesidad));
        },
        true
      );
      $scope.$watch(
        "solicitudNecesidad.DetalleServicioNecesidad",
        function () {
          localStorage.setItem(
            "DetalleServicioNecesidad",
            JSON.stringify(self.DetalleServicioNecesidad)
          );
        },
        true
      );
      $scope.$watch(
        "solicitudNecesidad.DetallePrestacionServicioNecesidad",
        function () {
          localStorage.setItem(
            "DetallePrestacionServicioNecesidad",
            JSON.stringify(self.DetallePrestacionServicioNecesidad)
          );
        },
        true
      );
      $scope.$watch(
        "solicitudNecesidad.ProductosCatalogoNecesidad",
        function () {
          localStorage.setItem(
            "ProductosCatalogoNecesidad",
            JSON.stringify(self.ProductosCatalogoNecesidad)
          );
        },
        true
      );
      $scope.$watch(
        "solicitudNecesidad.MarcoLegalNecesidad",
        function () {
          localStorage.setItem(
            "MarcoLegalNecesidad",
            JSON.stringify(self.MarcoLegalNecesidad)
          );
        },
        true
      );
      $scope.$watch(
        "solicitudNecesidad.ActividadEspecificaNecesidad",
        function () {
          localStorage.setItem(
            "ActividadEspecificaNecesidad",
            JSON.stringify(self.ActividadEspecificaNecesidad)
          );
        },
        true
      );
      $scope.$watch(
        "solicitudNecesidad.RequisitoMinimoNecesidad",
        function () {
          localStorage.setItem(
            "RequisitoMinimoNecesidad",
            JSON.stringify(self.RequisitoMinimoNecesidad)
          );
        },
        true
      );
      $scope.$watch(
        "solicitudNecesidad.ActividadEconomicaNecesidad",
        function () {
          localStorage.setItem(
            "ActividadEconomicaNecesidad",
            JSON.stringify(self.ActividadEconomicaNecesidad)
          );
        },
        true
      );
      $scope.$watch(
        "solicitudNecesidad.Rubros",
        function () {
          localStorage.setItem("Rubros", JSON.stringify(self.Rubros));
        },
        true
      );

      self.emptyStorage = function () {
        // funcion para vaciar el localstorage
        var keysToRemove = [
          "Necesidad",
          "DetalleServicioNecesidad",
          "DetallePrestacionServicioNecesidad",
          "ProductosCatalogoNecesidad",
          "MarcoLegalNecesidad",
          "ActividadEspecificaNecesidad",
          "RequisitoMinimoNecesidad",
          "ActividadEconomicaNecesidad",
          "Rubros",
        ];
        keysToRemove.forEach(function (key) {
          localStorage.removeItem(key);
        });
      };

      // observa si hay cambio de ruta

      $scope.$on("$locationChangeStart", function (event) {
        if (self.enviando === true) {
          self.emptyStorage();
          return;
        }
        var answer = confirm(
          "¿Esta seguro de que desea salir de la página, los datos sin guardar podrían perderse?"
        ); //mostrar confirmacion de dejar pagina
        if (!answer) {
          event.preventDefault();
        } else {
          self.emptyStorage();
        }
      });

      $scope.$watch(
        "solicitudNecesidad.detalle_servicio_necesidad.NucleoConocimiento",
        function () {
          if (!self.detalle_servicio_necesidad) {
            return;
          }
          parametrosRequest
            .get(
              "parametro",
              $.param({
                query:
                  "TipoParametroId:4,Id:" +
                  self.detalle_servicio_necesidad.NucleoConocimiento,
                limit: -1,
              })
            )
            .then(function (response) {
              if (response.data !== null && response.data.lenght > 0) {
                self.nucleoarea = response.data.Data[0].ParametroPadreId.Id;
              }
            })
            .catch(function (err) {
              console.error(err);
            });
        },
        true
      );

      $scope.$watch(
        "solicitudNecesidad.dependencia_solicitante",
        function () {
          // observa cambios en dependencias para traer datos de jefes
          self.jefe_solicitante = null;
          self.dependencia_solicitante
            ? necesidadService
              .getJefeDependencia(self.dependencia_solicitante)
              .then(function (JD) {
                self.jefe_solicitante = JD.Persona;
                self.Necesidad.DependenciaNecesidadId.JefeDepSolicitanteId =
                  JD.JefeDependencia.Id;
                self.Necesidad.DependenciaNecesidadId.DependenciaSolicitante =
                  self.dependencia_solicitante;
                // self.dependencia_solicitante.JefeDependenciaSolicitante = JD.JefeDependencia.Id; OLD
              })
              .catch(function (err) { })
            : _;
        },
        true
      );

      $scope.$watch(
        "solicitudNecesidad.dependencia_destino",
        function () {
          self.jefe_destino = null;
          self.dependencia_destino
            ? necesidadService
              .getJefeDependencia(self.dependencia_destino)
              .then(function (JD) {
                self.jefe_destino = JD.Persona;
                self.Necesidad.DependenciaNecesidadId.JefeDepDestinoId =
                  JD.JefeDependencia.Id;
                self.Necesidad.DependenciaNecesidadId.DependenciaDestino =
                  self.dependencia_destino;
              })
              .catch(function (err) { })
            : _;
        },
        true
      );

      $scope.$watch(
        "solicitudNecesidad.dependencia_supervisor",
        function () {
          self.supervisor = null;
          self.dependencia_supervisor
            ? necesidadService
              .getJefeDependencia(self.dependencia_supervisor)
              .then(function (JD) {
                self.supervisor = JD.Persona;
                self.Necesidad.DependenciaNecesidadId.SupervisorId =
                  JD.JefeDependencia.Id;
                self.Necesidad.DependenciaNecesidadId.DependenciaSupervisor =
                self.dependencia_supervisor;
              })
              .catch(function (err) { })
            : _;
        },
        true
      );

      $scope.$watch(
        "solicitudNecesidad.rol_ordenador_gasto",
        function () {
          self.ordenador_gasto = null;
          self.rol_ordenador_gasto
            ? necesidadService
              .getJefeDependencia(self.rol_ordenador_gasto)
              .then(function (JD) {
                self.ordenador_gasto = JD.Persona;
                self.Necesidad.DependenciaNecesidadId.OrdenadorGastoId =
                  parseInt(JD.JefeDependencia.Id, 10);
                self.Necesidad.DependenciaNecesidadId.RolOrdenadorGasto =
                self.rol_ordenador_gasto;
              })
              .catch(function (err) { })
            : _;
        },
        true
      );

      self.estructura = {
        // DEFINE QUE CAMPOS SE MUESTRAN
        init: {
          forms: {
            Avances: false,
            Responsables: true,
            General: true,
            ObjetoContractual: true,
            MarcoLegal: true,
            Especificaciones: true,
            Financiamiento: true,
          },
          Responsables: {
            DependenciaSolicitante: true,
            JefeDependenciaSolicitante: true,
            DependenciaDestino: true,
            JefeDependenciaDestino: true,
            OrdenadorGasto: true,
            RolOrdenadorGasto: true,
          },
          General: {
            PlanAnualAdquisiciones: true,
            UnidadEjecutora: true,
            EstudioMercado: true,
            ModalidadSeleccion: true,
            Supervisor: true,
            AnalisisRiesgo: true,
          },
          ObjetoContractual: {
            ObjetoContrato: true,
            JustificacionContrato: true,
          },
        },
        Contratacion: {
          forms: {},
        },
        Avances: {
          forms: {
            Avances: true,
            Especificaciones: false,
          },
          General: {
            EstudioMercado: false,
            ModalidadSeleccion: false,
            Supervisor: false,
          },
        },
        ServiciosPublicos: {
          forms: {
            //Avances: false,
            Especificaciones: false,
          },
          General: {
            EstudioMercado: false,
            ModalidadSeleccion: false,
            Supervisor: false,
          },
        },
      };

      self.forms = _.extend({}, self.estructura.init.forms);
      self.fields = _.extend({}, self.estructura.init);

      var alertInfo = {
        //alert error formulario
        type: "error",
        title: "Complete todos los campos obligatorios en el formulario",
        showConfirmButton: false,
        timer: 2000,
      };

      self.validar_formu = function (form) {
        if (form.$invalid) {
          swal(alertInfo);
          return false;
        } else {
          return true;
        }
      };

      // especificar si estos watchers cumaplen funcion o eliminarlos
      $scope.$watch(
        "solicitudNecesidad.especificaciones.Valor",
        function () {
          self.valor_iva =
            (self.especificaciones.Iva / 100) *
            self.especificaciones.Valor *
            self.especificaciones.Cantidad;
        },
        true
      );

      $scope.$watch(
        "solicitudNecesidad.especificaciones.Iva",
        function () {
          self.valor_iva =
            (self.especificaciones.Iva / 100) *
            self.especificaciones.Valor *
            self.especificaciones.Cantidad;
        },
        true
      );

      $scope.$watch(
        "solicitudNecesidad.especificaciones.Cantidad",
        function () {
          self.valor_iva =
            (self.especificaciones.Iva / 100) *
            self.especificaciones.Valor *
            self.especificaciones.Cantidad;
        },
        true
      );

      $scope.$watch(
        "solicitudNecesidad.valor_iva",
        function () {
          self.valor_total =
            self.especificaciones.Valor * self.especificaciones.Cantidad +
            self.valor_iva;
        },
        true
      );

      parametrosRequest
        .get(
          "parametro",
          $.param({
            //Primer Select NAC
            limit: -1,
            query:
              "TipoParametroId:4,ParametroPadreId__isnull:true,Activo:true",
          })
        )
        .then(function (response) {
          self.nucleo_area_data = response.data.Data;
        });

      $scope.$watch(
        "solicitudNecesidad.nucleoarea",
        function () {
          // trae nucleo con dependiendo del area
          self.nucleoarea
            ? parametrosRequest
              .get(
                "parametro",
                $.param({
                  query:
                    "TipoParametroId:4,Activo:true,ParametroPadreId.Id:" +
                    self.nucleoarea,
                  limit: -1,
                })
              )
              .then(function (response) {
                self.nucleo_conocimiento_data = response.data.Data;
              })
            : _;
        },
        true
      );

      $scope.$watchGroup(
        [
          "solicitudNecesidad.Necesidad.AreaFuncional",
          "solicitudNecesidad.Necesidad.TipoFinanciacionNecesidadId",
        ],
        function () {
          // reset financiacion si se cambia de tipo finaciacion o unidad ejecutora
          if (self.elaborando_necesidad === true) {
            self.Necesidad.AreaFuncional &&
              self.Necesidad.TipoFinanciacionNecesidadId
              ? (self.Rubros = [])
              : _;
          }
        }
      );

      // Watch para traer el plan de adquisiciones según sea seleccionada el área funcional
      $scope.$watch(
        "solicitudNecesidad.Necesidad.AreaFuncional",
        function () {
          if (self.Necesidad.AreaFuncional) {
            const QUERY = "?query=Id:29";
            configuracionRequest.get("parametro", QUERY).then(function (res) {
              if (self.Necesidad.AreaFuncional === undefined) {
              } else if (self.Necesidad.AreaFuncional === 2) {
                $scope.disabledSelect = true;
                $scope.disableTipoFinanciacion = true;
                const plan_adquisiciones = JSON.parse(
                  res.data[0].Valor
                ).plan_adquisiciones_idexud;
                // Carga los planes de adquisicion desde Plan de adquisiciones y que correspondan
                // al plan de adquisición activo para el área seleccionada.
                const QUERY = '/' + plan_adquisiciones;
                planAdquisicionRequest
                  .get('Plan_adquisiciones_mongo' + QUERY)
                  .then(function (res) {
                    if (res.data !== null) {
                      self.planes_anuales = [];
                      self.planes_anuales.push(res.data);
                      $scope.solicitudNecesidad.vigencia = res.data.vigencia;
                      self.Necesidad.Vigencia = res.data.vigencia.toString();
                      self.Necesidad.PlanAnualAdquisicionesId = res.data.id;
                      $scope.solicitudNecesidad.planadquisicion = $scope.solicitudNecesidad.planes_anuales[0];
                    }
                  });
                $scope.solicitudNecesidad.Necesidad.TipoFinanciacionNecesidadId = $scope.solicitudNecesidad.tipo_financiacion_data[0];
                return JSON.parse(res.data[0].Valor).plan_adquisiciones_idexud;
              } else {
                $scope.disabledSelect = false;
                $scope.disableTipoFinanciacion = false;
                const plan_adquisiciones = JSON.parse(
                  res.data[0].Valor
                ).plan_adquisiciones_general;
                const QUERY = '/' + plan_adquisiciones;
                // Carga los planes de adquisicion desde Plan de adquisiciones y que correspondan
                // al plan de adquisición activo para el área seleccionada.
                planAdquisicionRequest
                  .get('Plan_adquisiciones_mongo' + QUERY)
                  .then(function (res) {
                    if (res.data !== null) {
                      self.planes_anuales = [];
                      self.planes_anuales.push(res.data);
                      $scope.solicitudNecesidad.vigencia = res.data.vigencia;
                      self.Necesidad.Vigencia = res.data.vigencia.toString();
                      self.Necesidad.PlanAnualAdquisicionesId = res.data.id;
                      $scope.solicitudNecesidad.planadquisicion = $scope.solicitudNecesidad.planes_anuales[0];
                    }
                  });
                return JSON.parse(res.data[0].Valor).plan_adquisiciones_general;
              }
            });
          } else {
            $scope.disableTipoFinanciacion = true;
            $scope.disabledSelect = true;
          }
        },
        true
      );

      necesidadService.getAllDependencias().then(function (Dependencias) {
        //trae lista dependencias
        self.dependencia_data = Dependencias;
      });

      coreAmazonRequest
        .get(
          "ordenador_gasto",
          $.param({
            // lista ordenadores del gasto
            limit: -1,
            sortby: "Cargo",
            order: "asc",
          })
        )
        .then(function (response) {
          self.ordenador_gasto_data = response.data;
        })
        .catch(function (err) {
          console.info(err);
        });

      necesidadesCrudRequest
        .get(
          "tipo_necesidad",
          $.param({
            // parametro desde necesidades crud
            limit: -1,
          })
        )
        .then(function (response) {
          self.tipo_necesidad_data = response.data;
        });

      necesidadesCrudRequest
        .get(
          "tipo_duracion_necesidad",
          $.param({
            // parametro desde necesidades crud
            limit: -1,
          })
        )
        .then(function (response) {
          self.tipo_duracion_necesidad_data = response.data;
        });

      parametrosRequest
        .get(
          "parametro",
          $.param({
            // parametro desde adm, unidad producto
            limit: -1,
            query: "TipoParametroId.AreaTipoId.Id:4,Activo:true",
          })
        )
        .then(function (response) {
          self.unidad_data = self.transformUnidad(response.data.Data);
        });

      coreAmazonRequest
        .get(
          "jefe_dependencia",
          $.param({
            limit: -1,
            query:
              "FechaInicio__lte:" +
              moment().format("YYYY-MM-DD") +
              ",FechaFin__gte:" +
              moment().format("YYYY-MM-DD"),
          })
        )
        .then(function (responseJD) {
          self.jefes_dep_data = responseJD;
        });
      // Se traen los jefes de dependencia actuales
      agoraRequest
        .get(
          "informacion_persona_natural",
          $.param({
            limit: -1,
          })
        )
        .then(function (response) {
          // trae los interventores, puede ser cualquier tercero TODO: cambiar de modo de carga ya que es muy pesada, implementar lazy load y busqueda
          var arrJD = [];
          self.interventor_data = response.data;
          self.persona_data = response.data.filter(function (p) {
            self.jefes_dep_data.data.forEach(function (i) {
              if (p.Id === i.TerceroId) {
                arrJD.push(p);
              }
            });
            return arrJD;
          });
        });

      necesidadService.getParametroEstandar().then(function (response) {
        // tipo perfil CPS
        self.parametro_estandar_data = response.data;
      });
      //-----

      parametrosRequest
        .get(
          "parametro",
          $.param({
            //modalidad seleccion
            limit: -1,
            sortby: "NumeroOrden",
            order: "asc",
            query: "TipoParametroId:11,Activo:true",
          })
        )
        .then(function (response) {
          self.modalidad_data = response.data.Data;
        });

      necesidadesCrudRequest
        .get(
          "tipo_financiacion_necesidad",
          $.param({
            // parametro desde necesidades crud
            limit: -1,
          })
        )
        .then(function (response) {
          self.tipo_financiacion_data = response.data;
        });

      necesidadesCrudRequest
        .get(
          "tipo_contrato_necesidad",
          $.param({
            // parametro desde necesidades crud
            limit: -1,
            query: "Activo:true",
          })
        )
        .then(function (response) {
          self.tipo_contrato_data = response.data;
        });

      $http
        .get("scripts/models/marco_legal.json") // texto info de seccion marco legal por ahora local
        .then(function (response) {
          self.MarcoLegalNecesidadText = $sce.trustAsHtml(
            response.data.common_text
          );
        });

      // Se carga JSON con los tipos de servicio local, no hay servicio
      $http.get("scripts/models/tipo_servicio.json").then(function (response) {
        self.TiposServicios = response.data;
      });

      // Se cargan las áreas funcionales desde un archivo JSON
      // TODO: usar el servicio de área funcional cuando exista
      $http
        .get("scripts/models/area_funcional_provisional.json")
        .then(function (res) {
          self.area_funcional_data = res.data;
        });

      self.agregar_ffapropiacion = function (apropiacion) {
        // agregar rubros en financiacion
        if (apropiacion === undefined) {
          return;
        }
        self.apSelected = true;
        self.apSelectedOb = apropiacion;
        var Fap = {
          Apropiacion: apropiacion,
          RubroId: apropiacion.Codigo,
          MontoPorApropiacion: 0,
          Metas: [],
          Fuentes: [],
          Productos: [],
        };
        // Busca si en Rubros ya existe el elemento que intenta agregarse, comparandolo con su id
        // si lo que devuelve filter es un arreglo mayor que 0, significa que el elemento a agregar ya existe
        // por lo tanto devuelve un mensaje de alerta
        if (
          self.Rubros.filter(function (element) {
            return element.RubroId === apropiacion.Codigo;
          }).length > 0
        ) {
          swal(
            "Apropiación ya agregada",
            "El rubro: <b>" +
            Fap.RubroId +
            ": " +
            Fap.Apropiacion.Nombre +
            "</b> ya ha sido agregado",
            "warning"
          );
          // Por el contrario, si el tamaño del arreglo que devuelve filter es menor a 0
          // significa que no encontró ningún elemento que coincida con el id y agrega el objeto al arreglo
        } else {
          self.Rubros.push(Fap);
        }
      };

      self.meta_necesidad = {
        Meta: self.meta,
        Actividades: self.actividades,
        MontoPorMeta: 0,
      };
      self.addProductoCatalogo = function () {
        // añadir productos de catalogo en compra o compra serv
        if (
          !self.producto_catalogo.Cantidad > 0 ||
          !self.producto_catalogo.Valor > 0
        ) {
          swal({
            type: "error",
            title:
              "Por favor, ingrese un valor y cantidad válidos y mayores a 0.",
            showConfirmButton: true,
          });
          return;
        }
        self.ProductosCatalogoNecesidad.filter(function (e) {
          return e.CatalogoId === self.producto_catalogo.CatalogoId;
        }).length > 0 || !self.producto_catalogo.CatalogoId
          ? swal({
            type: "error",
            title: "El producto ya fue agregado",
            showConfirmButton: true,
          })
          : self.ProductosCatalogoNecesidad.push(self.producto_catalogo);
        self.cerrarModalProducto();
        self.producto_catalogo = {};
        self.producto_catalogo.RequisitosMinimos = [];
      };

      self.cerrarModalProducto = function () {
        // cerrar form productos catalogo
        $("#modalProducto").modal("hide");
        $(".modal-backdrop").remove();
      };

      self.eliminarRubro = function (rubro) {
        //quitar producto
        for (var i = 0; i < self.Rubros.length; i += 1) {
          if (self.Rubros[i] === rubro) {
            self.Rubros.splice(i, 1);
          }
        }
      };

      self.eliminarRequisito = function (requisito) {
        // quitar requisito minimo de un producto
        for (
          var i = 0;
          i < self.producto_catalogo.RequisitosMinimos.length;
          i += 1
        ) {
          if (self.producto_catalogo.RequisitosMinimos[i] === requisito) {
            self.producto_catalogo.RequisitosMinimos.splice(i, 1);
          }
        }
      };

      self.eliminarActividad = function (actividad) {
        // quitar act especifica
        for (var i = 0; i < self.ActividadEspecificaNecesidad.length; i += 1) {
          if (self.ActividadEspecificaNecesidad[i] === actividad) {
            self.ActividadEspecificaNecesidad.splice(i, 1);
          }
        }
      };

      self.eliminarRequisitoMinimo = function (rm) {
        // quitar requisito minimo de la necesidad
        for (var i = 0; i < self.RequisitoMinimoNecesidad.length; i += 1) {
          if (self.RequisitoMinimoNecesidad[i] === rm) {
            self.RequisitoMinimoNecesidad.splice(i, 1);
          }
        }
      };

      $scope.$watch(
        "solicitudNecesidad.Rubros",
        function () {
          // se hace la sumatoria de valores hasta el rubro, desde montos parciales fuentes
          self.Necesidad.Valor = 0;

          for (var i = 0; i < self.Rubros.length; i++) {
            self.Rubros[i].MontoPorApropiacion = 0;
            self.Rubros[i].MontoFuentes = 0;
            self.Rubros[i].MontoProductos = 0;
            self.Rubros[i].MontoMeta = 0;
            // calculo valor case inversion
            if (
              self.Necesidad.TipoFinanciacionNecesidadId.CodigoAbreviacion ===
              "I"
            ) {
              if (
                self.Rubros[i].Metas.length > 0 &&
                self.Rubros[i].Metas[0].Actividades
              ) {
                self.Rubros[i].MontoPorApropiacion +=
                  self.Rubros[i].Metas[0].MontoPorMeta;
              }
            }

            // case Funcionamiento
            if (
              self.Necesidad.TipoFinanciacionNecesidadId.CodigoAbreviacion ===
              "F"
            ) {
              if (self.Rubros[i].Fuentes.length > 0) {
                for (
                  var index = 0;
                  index < self.Rubros[i].Fuentes.length;
                  index++
                ) {
                  self.Rubros[i].MontoFuentes +=
                    self.Rubros[i].Fuentes[index].MontoParcial;
                }
              }
              self.Rubros[i].MontoPorApropiacion = self.Rubros[i].MontoFuentes;
            }

            self.Necesidad.Valor += self.Rubros[i].MontoPorApropiacion;
          }
        },
        true
      );

      $scope.$watch(
        "solicitudNecesidad.servicio_valor",
        function () {
          // calculo compra y serv
          self.valor_compra_servicio =
            self.servicio_valor + self.valorTotalEspecificaciones;
        },
        true
      );

      self.getPorcIVAbyId = function (id) {
        //trae porcentaje iva con id
        if (id && self.iva_data && self.iva_data.length > 0) {
          return self.iva_data.filter(function (iva) {
            return iva.Id === id;
          })[0].Tarifa;
        } else {
          return 0;
        }
      };
      self.transformIvaData = function (data) {
        // Transformar datos de IVA
        if (data) {
          return data.map(function (element) {
            const datos = JSON.parse(element.Valor);
            element.Tarifa = datos.Tarifa;
            element.PorcentajeAplicacion = datos.PorcentajeAplicacion;
            element.BaseUvt = datos.BaseUvt;
            element.BasePesos = datos.BasePesos;
            element.ImpuestoId = element.ParametroId;
            return element;
          });
        } else {
          return undefined;
        }
      };
      self.transformUnidad = function (data) {
        // Transformar datos de IVA
        if (data) {
          return data.map(function (element) {
            element.Unidad = element.Nombre;
            return element;
          });
        } else {
          return undefined;
        }
      };

      $scope.$watch(
        "solicitudNecesidad.producto_catalogo",
        function () {
          // activar modal y preparar producto cuando se selecciona desde tabla
          if (
            self.producto_catalogo.CatalogoId &&
            self.producto_catalogo !== {}
          ) {
            $("#modalProducto").modal();
          }
          self.producto_catalogo.Subtotal =
            self.producto_catalogo.Valor * self.producto_catalogo.Cantidad || 0;
          var tIva = self.getPorcIVAbyId(self.producto_catalogo.Iva);
          self.producto_catalogo.ValorIVA =
            self.producto_catalogo.Subtotal * (tIva / 100) || 0;
          self.producto_catalogo.preciomasIVA =
            self.producto_catalogo.Subtotal + self.producto_catalogo.ValorIVA ||
            0;
        },
        true
      );

      $scope.$watch(
        "solicitudNecesidad.ProductosCatalogoNecesidad",
        function () {
          // hacer los calculos de productos catalogo para el valor
          self.valorTotalEspecificaciones = 0;
          self.subtotalEspecificaciones = 0;
          self.valorIVA = 0;
          self.ProductosCatalogoNecesidad.forEach(function (producto) {
            self.subtotalEspecificaciones += producto.Subtotal;
          });
          self.ProductosCatalogoNecesidad.forEach(function (producto) {
            self.valorIVA += producto.ValorIVA;
          });
          self.valorTotalEspecificaciones =
            self.valorIVA + self.subtotalEspecificaciones;
          self.valor_compra_servicio =
            self.servicio_valor + self.valorTotalEspecificaciones;
        },
        true
      );

      $scope.$watchGroup(
        [
          "solicitudNecesidad.DetalleServicioNecesidad.Valor",
          "solicitudNecesidad.DetalleServicioNecesidad.IvaId",
        ],
        function () {
          //solo si es serv o compra y serv
          if (
            self.Necesidad.TipoContratoNecesidadId &&
            (self.Necesidad.TipoContratoNecesidadId.Id === 5 ||
              self.Necesidad.TipoContratoNecesidadId.Id === 4)
          ) {
            var tIva =
              self.getPorcIVAbyId(self.DetalleServicioNecesidad.IvaId) || 0;
            self.val_iva = (self.DetalleServicioNecesidad.Valor * tIva) / 100;
            self.DetalleServicioNecesidad.Total =
              self.val_iva + self.DetalleServicioNecesidad.Valor;
            self.servicio_valor = self.DetalleServicioNecesidad.Total;
          }
        },
        true
      );

      $scope.$watch(
        "solicitudNecesidad.Necesidad.Valor",
        function () {
          // si es una CPS
          if (
            self.Necesidad.TipoContratoNecesidadId &&
            self.Necesidad.TipoContratoNecesidadId.Id === 2
          ) {
            self.servicio_valor = self.Necesidad.Valor;
          }
        },
        true
      );

      $scope.$watch(
        "solicitudNecesidad.Necesidad.TipoContratoNecesidadId",
        function () {
          //reiniciar objetos cuando se encuentre en curso
          self.ResetObjects();
          if (
            self.Necesidad.TipoContratoNecesidadId &&
            (self.Necesidad.TipoContratoNecesidadId.Id === 1 ||
              self.Necesidad.TipoContratoNecesidadId.Id ===
              4) /* tipo compra o compra y servicio */
          ) {
            self.MostrarTotalEspc = true;
          } else {
            self.MostrarTotalEspc = false;
          }
          //prestacion serv
          if (
            self.Necesidad.TipoContratoNecesidadId &&
            self.Necesidad.TipoContratoNecesidadId.Id === 2
          ) {
            self.Necesidad.Valor
              ? (self.servicio_valor = self.Necesidad.Valor)
              : _;
            self.DetallePrestacionServicioNecesidad.Cantidad = 1;
          }
          // serv
          if (
            self.Necesidad.TipoContratoNecesidadId &&
            self.Necesidad.TipoContratoNecesidadId.Id === 5
          ) {
            self.servicio_valor = self.Necesidad.Valor;
            //self.DetalleServicioNecesidad.Valor = self.Necesidad.Valor;
          }
          // compra y serv
          if (
            self.Necesidad.TipoContratoNecesidadId &&
            self.Necesidad.TipoContratoNecesidadId.Id === 4
          ) {
            self.servicio_valor = self.DetalleServicioNecesidad.Valor;
          }
          self.valorTotalEspecificaciones = 0;
          // self.ProductosCatalogoNecesidad = [];
          self.requisitos_minimos = [];
        },
        true
      );

      self.agregarActEsp = function (actividad) {
        var a = {};
        a.Descripcion = actividad;
        self.ActividadEspecificaNecesidad.push(a);
      };

      self.agregarReqMin = function (rm) {
        var a = {};
        a.Descripcion = rm;
        self.RequisitoMinimoNecesidad.push(a);
      };

      self.quitar_act_esp = function (i) {
        self.ActividadEspecifica.splice(i, 1);
      };

      self.submitForm = function (form, completado) {
        //enviar formulario, completado define si es guardado parcial o total

        if (form.$valid) {
          self.enviando = true;
          self.crear_solicitud(completado);
        } else {
          swal(
            "Faltan datos en el formulario",
            "Completa todos los datos obligatorios del formulario",
            "warning"
          ).then(function (event) {
            console.info(event);
            var e = angular.element(".ng-invalid-required")[2];
            e.focus(); // para que enfoque el elemento
            e.classList.add("ng-dirty"); //para que se vea rojo
          });
        }
      };

      self.crear_solicitud = function (completado) {
        if (self.Necesidad.TipoNecesidadId.Id === 2 || !completado) {
          //servicios publicos o incompleta
          self.Necesidad.TipoContratoNecesidadId = {
            Id: 3,
          };
        }
        if (!completado) {
          self.Necesidad.JustificacionRechazo = 1; //guardado parcial
        } else {
          self.Necesidad.JustificacionRechazo = 0; //guardado total
        }
        self.ActividadEconomicaNecesidad = self.actividades_economicas_id; //mapear lista de ids
        self.Necesidad.ModalidadSeleccionId = {
          Id: 8,
        }; // mod otra
        self.Necesidad.EstadoNecesidadId = {
          Id: 8,
        }; // estado guardada
        self.Necesidad.FechaSolicitud = new Date();
        self.TrNecesidad = {
          Necesidad: self.Necesidad,
          DetalleServicioNecesidad: self.DetalleServicioNecesidad,
          DetallePrestacionServicioNecesidad:
            self.DetallePrestacionServicioNecesidad,
          ProductosCatalogoNecesidad: self.ProductosCatalogoNecesidad.map(
            function (p) {
              // ajuste a estructura crud
              return {
                CatalogoId: p.CatalogoId,
                UnidadId: p.UnidadId || p.Unidad.Id,
                IvaId: p.IvaId || p.Iva,
                Cantidad: p.Cantidad,
                Valor: p.Valor,
                RequisitosMinimos: p.RequisitosMinimos || [],
              };
            }
          ),
          MarcoLegalNecesidad: self.MarcoLegalNecesidad,
          ActividadEspecificaNecesidad: self.ActividadEspecificaNecesidad,
          RequisitoMinimoNecesidad: self.RequisitoMinimoNecesidad,
          ActividadEconomicaNecesidad: self.ActividadEconomicaNecesidad,
          Rubros: self.Rubros,
        };
        delete self.Necesidad.DependenciaNecesidadId.Id; // cuando sea edicion para que no falle post

        var NecesidadHandle = function (response, type) {
          // funcion de alerta a partir de response
          var templateAlert =
            "<table class='table table-bordered'><th>" +
            $translate.instant("UNIDAD_EJECUTORA") +
            "</th><th>" +
            $translate.instant("DEPENDENCIA_DESTINO") +
            "</th><th>" +
            $translate.instant("TIPO_CONTRATO") +
            "</th><th>" +
            $translate.instant("VALOR") +
            "</th>";

          self.alerta_necesidad = response.data;

          if (response.status > 300) {
            swal({
              title: "Error Registro Necesidad",
              type: "error",
              text: JSON.stringify(self.alerta_necesidad),
              showCloseButton: true,
              confirmButtonText: $translate.instant("CERRAR"),
            });
            return;
          }

          var forEachResponse = function (response) {
            //mostrar tabla
            if (response.status > 300) {
              templateAlert += "<tr class='danger'>";
            } else {
              templateAlert += "<tr class='success'>";
            }

            var n =
              typeof response.data === "object"
                ? response.data.Necesidad
                : self.Necesidad;

            templateAlert +=
              "<td>" +
              self.area_funcional_data.filter(function (u) {
                return u.Id === n.AreaFuncional;
              })[0].Nombre +
              "</td>" +
              "<td>" +
              self.dependencia_data.filter(function (dd) {
                return dd.Id === self.dependencia_destino;
              })[0].Nombre +
              "</td>" +
              "<td>" +
              (n.TipoContratoNecesidadId.Nombre
                ? n.TipoContratoNecesidadId.Nombre
                : "") +
              "</td>" +
              "<td>" +
              $filter("currency")(n.Valor) +
              "</td>";

            templateAlert += "</tr>";
          };

          forEachResponse(self.alerta_necesidad);

          templateAlert = templateAlert + "</table>";
          swal({
            title:
              "Se ha creado el borrador de Necesidad N°" +
              response.data.Necesidad.Id,
            text: "A continuación encontrará el resumen de los datos ingresados.",
            type: "success",
            width: 800,
            html: templateAlert,
            showCloseButton: true,
            confirmButtonText: $translate.instant("CERRAR"),
          });
          if (response.status < 300) {
            // borrar los objetos y redirigir a la lista de necesidades
            self.emptyStorage();
            $window.location.href = "#/necesidades";
          }
        };

        if (
          self.IdNecesidad &&
          self.TrNecesidad.Necesidad.EstadoNecesidadId.Id !==
          necesidadService.EstadoNecesidadType.Guardada.Id
        ) {
          if (
            self.TrNecesidad.Necesidad.EstadoNecesidadId.Id ===
            necesidadService.EstadoNecesidadType.Rechazada.Id
          ) {
            swal(
              "Error",
              "La necesidad no se puede editar, estado de la necesidad: (" +
              self.TrNecesidad.Necesidad.EstadoNecesidadId.Nombre +
              ")",
              "warning"
            );
            return;
          }
          self.TrNecesidad.Necesidad.EstadoNecesidadId =
            necesidadService.EstadoNecesidadType.Modificada;
          planCuentasMidRequest
            .post("necesidad/post_full_necesidad/", self.TrNecesidad)
            .then(function (r) {
              NecesidadHandle(r); //alertar y redirigir o mostrar error
            })
            .catch(function (e) {
              console.info(e);
            });
        } else {
          self.TrNecesidad.Necesidad.EstadoNecesidadId =
            necesidadService.EstadoNecesidadType.Guardada;
          // validacion de financiacion vs especificaciones
          var especificaciones_valido = false;
          if (self.Necesidad.TipoNecesidadId.Id === 2 || !completado) {
            // serv publicos o guardada parcial
            if (self.dependencia_data !== undefined) {
              especificaciones_valido = true; // no validate
            }
            self.ValidarFinanciacion(especificaciones_valido) || !completado
              ? planCuentasMidRequest
                .post("necesidad/post_full_necesidad/", self.TrNecesidad)
                .then(function (r) {
                  NecesidadHandle(r);
                })
                .catch(function (e) {
                  console.info(e);
                })
              : _;
            return;
          } else {
            switch (self.Necesidad.TipoContratoNecesidadId.Id) {
              case 1:
                especificaciones_valido =
                  self.Necesidad.Valor === self.valorTotalEspecificaciones;
                break;
              case 2:
                especificaciones_valido =
                  self.Necesidad.Valor === self.servicio_valor &&
                  self.DetallePrestacionServicioNecesidad.PerfilId &&
                  self.DetallePrestacionServicioNecesidad.NucleoConocimientoId;
                break;
              case 4:
                especificaciones_valido =
                  self.Necesidad.Valor ===
                  self.valorTotalEspecificaciones + self.servicio_valor &&
                  self.DetalleServicioNecesidad.TipoServicioId;
                break;
              case 5:
                especificaciones_valido =
                  self.Necesidad.Valor === self.servicio_valor &&
                  self.DetalleServicioNecesidad.TipoServicioId;
                break;
            }
            if (especificaciones_valido) {
              planCuentasMidRequest
                .post("necesidad/post_full_necesidad/", self.TrNecesidad)
                .then(function (r) {
                  NecesidadHandle(r);
                })
                .catch(function (e) {
                  console.info(e);
                });
            } else {
              switch (
              self.Necesidad.TipoContratoNecesidadId.Id // alertas dependiendo de tipo contrato
              ) {
                case 1:
                  swal(necesidadService.AlertaErrorEspecificaciones.Compra);
                  break;
                case 2:
                  swal(necesidadService.AlertaErrorEspecificaciones.CPS);
                  break;
                case 4:
                  swal(
                    necesidadService.AlertaErrorEspecificaciones.CompraServicio
                  );
                  break;
                case 5:
                  swal(necesidadService.AlertaErrorEspecificaciones.Servicio);
                  break;
              }
            }
          }
        }
      };

      self.ValidarFinanciacion = function (valido) {
        var fin_valid = self.Rubros.length > 0 && self.Necesidad.Valor > 0;
        self.Rubros.forEach(function (ap) {
          // CASE INVERSION
          if (
            self.Necesidad.TipoFinanciacionNecesidadId.CodigoAbreviacion === "I"
          ) {
            fin_valid =
              fin_valid &&
              ap.MontoMeta <= ap.Apropiacion.ValorActual &&
              ap.MontoPorApropiacion > 0;
          } else {
            //CASE FUNCIONAMIENTO
            ap.Fuentes.length === 0
              ? swal(
                necesidadService.getAlertaFinanciacion(ap.Apropiacion.Codigo)
                  .agregarFuente
              )
              : _;
            fin_valid =
              fin_valid &&
              ap.MontoFuentes <= ap.Apropiacion.ValorActual &&
              ap.Fuentes.length > 0 &&
              ap.MontoPorApropiacion > 0;
          }
          ap.MontoFuentes > ap.Apropiacion.ValorActual
            ? swal(
              necesidadService.getAlertaFinanciacion(ap.Apropiacion.Codigo)
                .fuentesMayorQueRubro
            )
            : _;
        });
        if (!fin_valid && !valido) {
          swal(necesidadService.getAlertaFinanciacion(0).errorFinanciacion);
        } else {
          swal({
            title: "Financiación balanceada",
            type: "success",
            text: "Los valores de financiación están en igualdad",
            showCloseButton: true,
            confirmButtonText: $translate.instant("CERRAR"),
          });
        }
        return fin_valid;
      };

      self.ResetNecesidad = function () {
        // limpiar form
        self.emptyStorage();
        self.ResetObjects();
        necesidadService.getFullNecesidad().then(function (res) {
          var TipoNecesidad = self.Necesidad.TipoNecesidadId;
          var DuracionNecesidad = self.Necesidad.TipoDuracionNecesidadId;
          self.recibirNecesidad(res);
          self.Necesidad.TipoNecesidadId = TipoNecesidad;
          self.Necesidad.TipoDuracionNecesidadId = DuracionNecesidad;
        });
      };

      self.ResetObjects = function () {
        //limpiar variables
        if (self.elaborando_necesidad === true) {
          self.DetalleServicioNecesidad = {};
          self.DetallePrestacionServicioNecesidad = {};
          self.ProductosCatalogoNecesidad = [];
          self.ActividadEspecificaNecesidad = [];
          self.RequisitoMinimoNecesidad = [];
          self.ActividadEconomicaNecesidad = [];
          self.producto_catalogo = {};
          self.producto_catalogo.RequisitosMinimos = [];
        }
      };

      // Control de visualizacion de los campos individuales en el formulario
      self.CambiarTipoNecesidad = function (TipoNecesidad) {
        self.forms = _.merge({}, self.estructura.init.forms);
        self.fields = _.merge({}, self.estructura.init);
        self.TipoNecesidadType = [
          "",
          "Contratacion",
          "",
          "Avances",
          "",
          "",
          "ServiciosPublicos",
        ];
        _.merge(
          self.forms,
          self.estructura[self.TipoNecesidadType[TipoNecesidad]].forms
        );
        _.merge(
          self.fields,
          self.estructura[self.TipoNecesidadType[TipoNecesidad]]
        );
        self.Necesidad.TipoContratoNecesidadId = {
          Id: 3,
        }; //Tipo Contrato Necesidad: No Aplica
        if (self.f.elaborando_necesidad === true) {
          self.DetalleServicioNecesidad = {};
          self.DetallePrestacionServicioNecesidad = {};
          self.ProductosCatalogoNecesidad = [];
          self.ActividadEspecificaNecesidad = [];
          self.RequisitoMinimoNecesidad = [];
          self.ActividadEconomicaNecesidad = [];
          self.producto_catalogo = {};
          self.producto_catalogo.RequisitosMinimos = [];
        }
      };
      //control avance y retroceso en el formulario
      self.CambiarForm = function (form) {
        switch (form) {
          case "general":
            self.FormularioSeleccionado = 0;
            break;
          case "financiacion":
            if (ValidarSeccion("general")) {
              self.SeccionesFormulario.financiacion.activo = true;
              self.elaborando_necesidad = true;
              self.FormularioSeleccionado = 1;
              self.mostrarFinanciacion = true;
              break;
            } else {
              self.AlertSeccion("General");
              break;
            }
          case "legal":
            if (ValidarSeccion("financiacion")) {
              self.SeccionesFormulario.legal.activo = true;
              self.FormularioSeleccionado = 2;
              break;
            } else {
              break;
            }
          case "contratacion":
            if (ValidarSeccion("legal")) {
              self.SeccionesFormulario.contratacion.activo = true;
              self.FormularioSeleccionado = 3;
              break;
            } else {
              self.AlertSeccion("Legal");
              break;
            }
        }
      };

      $scope.$watch(
        "solicitudNecesidad.FormularioSeleccionado",
        function () {
          // animar cambio de step y ubicar en la parte superior
          $("body, html, #mainapp").animate(
            {
              scrollTop: 0,
            },
            "slow"
          );
        },
        true
      );

      function ValidarSeccion(form) {
        var n = self.solicitudNecesidad;
        switch (form) {
          case "general":
            return (
              document
                .getElementById("f_responsables")
                .classList.contains("ng-valid") &&
              document
                .getElementById("f_general")
                .classList.contains("ng-valid")
            );
          case "financiacion":
            var val = self.ValidarFinanciacion();
            if (self.IdNecesidad) {
              return val;
            }
            return (
              val &&
              document
                .getElementById("f_financiacion")
                .classList.contains("ng-valid")
            );
          case "legal":
            return !document
              .getElementById("f_legal")
              .classList.contains("ng-invalid");
          case "contratacion":
            return true;
        }
      }

      self.AlertSeccion = function (seccion) {
        swal({
          title: "Sección " + seccion + " incompleta",
          type: "error",
          text: "Por favor, complete la sección: " + seccion,
          showCloseButton: true,
          confirmButtonText: $translate.instant("CERRAR"),
        });
      };
    }
  );
