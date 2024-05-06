'use strict';

/**
 * @ngdoc service
 * @name contractualClienteApp.config
 * @description
 * # config
 * Constant in the contractualClienteApp.
 */

angular.module('contractualClienteApp')
    .constant('CONF', {
        APP: "kronos",
        APP_MENU: "Necesidades",
        GENERAL: {
            ADMINISTRATIVA_MID_SERVICE: "https://autenticacion.portaloas.udistrital.edu.co/apioas/administrativa_mid_api/v1/",
            ADMINISTRATIVA_SERVICE: "https://autenticacion.portaloas.udistrital.edu.co/apioas/administrativa_crud_api/v1/",
            ADMINISTRATIVA_PRUEBAS_SERVICE: "https://autenticacion.portaloas.udistrital.edu.co/apioas/administrativa_amazon_api/v1/",
            CONFIGURACION_SERVICE: "https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/",
            CORE_AMAZON_SERVICE: "https://autenticacion.portaloas.udistrital.edu.co/apioas/core_amazon_crud/v1/",
            PARAMETROS_GOBIERNO_SERVICE: "https://autenticacion.portaloas.udistrital.edu.co/apioas/parametros_gobierno/v1/",
            CATALOGO_ARKA_SERVICE: "https://autenticacion.portaloas.udistrital.edu.co/apioas/catalogo_elementos_crud/v1/",
            PLAN_CUENTAS_MID_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/plan_cuentas_mid/v1/',
            PLAN_CUENTAS_MONGO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/plan_cuentas_mongo_crud/v1/',
            PLAN_ADQUISICIONES_CRUD_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/plan_adquisiciones_crud/v1/',
            NECESIDADES_CRUD_SERVICE: "https://autenticacion.portaloas.udistrital.edu.co/apioas/necesidades_crud/v1/",
            MODELS_SERVICE: "scripts/models/",
            MOVIMIENTOS_CRUD: "https://autenticacion.portaloas.udistrital.edu.co/apioas/movimientos_crud/v1/",
            PARAMETROS_SERVICE: "https://autenticacion.portaloas.udistrital.edu.co/apioas/parametros/v1/", // PARAMETROS NUEVOS
            OIKOS_SERVICE: "https://autenticacion.portaloas.udistrital.edu.co/apioas/oikos_crud_api/v2/",
            ARGO_NOSQL_SERVICE: "http://10.20.2.43:8083/v1/", // NO ESTA URL EN PREPROD
            NOTIFICACION_WS: "wss://pruebasapi.portaloas.udistrital.edu.co:8116/ws/join",
            TERCEROS_CRUD: "https://autenticacion.portaloas.udistrital.edu.co/apioas/terceros_crud/v1/",
            TERCEROS_MID: "https://autenticacion.portaloas.udistrital.edu.co/apioas/terceros_mid/v1/",
            TOKEN: {
                AUTORIZATION_URL: "https://autenticacion.portaloas.udistrital.edu.co/oauth2/authorize",
                URL_USER_INFO: "https://autenticacion.portaloas.udistrital.edu.co/oauth2/userinfo",
                CLIENTE_ID: "sWe9_P_C76DWGOsLcOY4T7BYH6oa",
                REDIRECT_URL: "http://localhost:9000/",
                RESPONSE_TYPE: "id_token token",
                SCOPE: "openid email documento",
                BUTTON_CLASS: "btn btn-warning btn-sm",
                SIGN_OUT_URL: "https://autenticacion.portaloas.udistrital.edu.co/oidc/logout",
                SIGN_OUT_REDIRECT_URL: "http://localhost:9000/",
                SIGN_OUT_APPEND_TOKEN: "true",
            },
        },
    });
