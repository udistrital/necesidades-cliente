'use strict';

/**
 * @ngdoc service
 * @name contractualClienteApp.config
 * @description
 * # config
 * Constant in the contractualClienteApp.
 */
var conf_cloud = {
    WSO2_SERVICE: "http://jbpm.udistritaloas.edu.co:8280/services",
    ACADEMICA_SERVICE: "http://10.20.0.127/urano/index.php?data=B-7djBQWvIdLAEEycbH1n6e-3dACi5eLUOb63vMYhGq0kPBs7NGLYWFCL0RSTCu1yTlE5hH854MOgmjuVfPWyvdpaJDUOyByX-ksEPFIrrQQ7t1p4BkZcBuGD2cgJXeD",
    ADMINISTRATIVA_MID_SERVICE: "http://10.20.0.210/administrativa_mid_api/v1/",
    ADMINISTRATIVA_SERVICE: "http://10.20.0.210/administrativa_api/v1/",
    ADMINISTRATIVA_PRUEBAS_SERVICE: "http://10.20.0.210/administrativa_amazon_api/v1/",
    ARKA_SERVICE: "http://10.20.0.210/arka_api_crud/v1/",
    CONFIGURACION_SERVICE: "http://10.20.0.210/configuracion_api/v1/",
    CORE_SERVICE: "http://10.20.0.210/core_amazon_crud/v1/",
    CORE_AMAZON_SERVICE: "http://10.20.0.254/core_amazon_crud/v1/",
    FINANCIERA_MID_SERVICE: "http://10.20.0.210/financiera_mid_api/v1/",
    FINANCIERA_SERVICE: "http://10.20.0.210/financiera_api/v1/",
    MODELS_SERVICE: "scripts/models/",
    NOTIFICACION_WS: "ws://10.20.2.134:8080/ws/join",
    OIKOS_SERVICE: "http://10.20.0.210/oikos_api/v1/",
    OIKOS_AMAZON_SERVICE: "http://10.20.0.210/oikos_amazon_api/v1",
    PAGOS_SERVICE: "http://10.20.0.210/services/academicaProxyService/ingresos_concepto/",
    TITAN_SERVICE: "http://10.20.0.210/titan_api_crud/v1/",
    SICAPITAL_SERVICE: "http://10.20.0.127/sicws/ws/sicapitalAPI.php/?/",
    CONTRATO_SERVICE: "http://jbpm.udistritaloas.edu.co:8280/services/contratoSuscritoProxyService/",
    TOKEN: {
        AUTORIZATION_URL: "https://autenticacion.udistrital.edu.co/oauth2/authorize",
        URL_USER_INFO: "https://autenticacion.udistrital.edu.co/oauth2/userinfo",
        CLIENTE_ID: "XdBq4QOfEZYT0cl_8qDh3fmF5_Qa",
        REDIRECT_URL: "http://administrativa.portaloas.udistrital.edu.co/",
        RESPONSE_TYPE: "code",
        SCOPE: "openid email",
        BUTTON_CLASS: "btn btn-warning btn-sm",
        SIGN_OUT_URL: "https://autenticacion.udistrital.edu.co/oidc/logout",
        SIGN_OUT_REDIRECT_URL: "http://administrativa.portaloas.udistrital.edu.co/",
        SIGN_OUT_APPEND_TOKEN: "true",
        REFRESH_TOKEN: "https://autenticacion.udistrital.edu.co/oauth2/token",
        CLIENT_SECRET: "lrVuDATX1o8TfXxz_jrEzBA2iIoa"
    },
};
var conf_presentacion = {
    WSO2_SERVICE: "http://jbpm.udistritaloas.edu.co:8280/services",
    ACADEMICA_SERVICE: "http://10.20.0.127/urano/index.php?data=B-7djBQWvIdLAEEycbH1n6e-3dACi5eLUOb63vMYhGq0kPBs7NGLYWFCL0RSTCu1yTlE5hH854MOgmjuVfPWyvdpaJDUOyByX-ksEPFIrrQQ7t1p4BkZcBuGD2cgJXeD",
    ADMINISTRATIVA_MID_SERVICE: "http://10.20.0.210/administrativa_mid_api/v1/",
    ADMINISTRATIVA_SERVICE: "http://10.20.0.210/administrativa_api/v1/",
    ADMINISTRATIVA_PRUEBAS_SERVICE: "http://10.20.0.210/administrativa_amazon_api/v1/",
    ARKA_SERVICE: "http://10.20.0.210/arka_api_crud/v1/",
    CONFIGURACION_SERVICE: "http://10.20.0.210/configuracion_api/v1/",
    CORE_SERVICE: "http://10.20.0.210/core_api/v1/",
    CORE_AMAZON_SERVICE: "http://10.20.0.210/core_amazon_crud/v1/",
    FINANCIERA_MID_SERVICE: "http://10.20.0.210/financiera_mid_api/v1/",
    FINANCIERA_SERVICE: "http://10.20.0.210/financiera_api/v1/",
    MODELS_SERVICE: "scripts/models/",
    NOTIFICACION_WS: "ws://10.20.2.134:8080/ws/join",
    OIKOS_SERVICE: "http://10.20.0.210/oikos_api/v1/",
    OIKOS_AMAZON_SERVICE: "http://10.20.0.210/oikos_amazon_api/v1",
    PAGOS_SERVICE: "http://jbpm.udistritaloas.edu.co:8280/services/academicaProxyService/ingresos_concepto/",
    TITAN_SERVICE: "http://10.20.0.210/titan_api_crud/v1/",
    SICAPITAL_SERVICE: "http://10.20.0.127/sicws/ws/sicapitalAPI.php/?/",
    CONTRATO_SERVICE: "http://jbpm.udistritaloas.edu.co:8280/services/contratoSuscritoProxyService/",
    TOKEN: {
        AUTORIZATION_URL: "https://autenticacion.udistrital.edu.co/oauth2/authorize",
        URL_USER_INFO: "https://autenticacion.udistrital.edu.co/oauth2/userinfo",
        CLIENTE_ID: "XdBq4QOfEZYT0cl_8qDh3fmF5_Qa",
        REDIRECT_URL: "http://localhost:9000/",
        RESPONSE_TYPE: "code",
        SCOPE: "openid email",
        BUTTON_CLASS: "btn btn-warning btn-sm",
        SIGN_OUT_URL: "https://autenticacion.udistrital.edu.co/oidc/logout",
        SIGN_OUT_REDIRECT_URL: "http://localhost:9000/",
        SIGN_OUT_APPEND_TOKEN: "true",
        REFRESH_TOKEN: "https://autenticacion.udistrital.edu.co/oauth2/token",
        CLIENT_SECRET: "lrVuDATX1o8TfXxz_jrEzBA2iIoa"
    },
};

var conf_pruebas = {
    WSO2_SERVICE: "http://jbpm.udistritaloas.edu.co:8280/services",
    ACADEMICA_SERVICE: "http://10.20.0.127/urano/index.php?data=B-7djBQWvIdLAEEycbH1n6e-3dACi5eLUOb63vMYhGq0kPBs7NGLYWFCL0RSTCu1yTlE5hH854MOgmjuVfPWyvdpaJDUOyByX-ksEPFIrrQQ7t1p4BkZcBuGD2cgJXeD",
    ADMINISTRATIVA_MID_SERVICE: "http://10.20.0.254/administrativa_mid_api/v1/",
    ADMINISTRATIVA_SERVICE: "http://10.20.0.254/administrativa_api/v1/",
    ADMINISTRATIVA_PRUEBAS_SERVICE: "http://10.20.0.254/administrativa_amazon_api/v1/",
    ARKA_SERVICE: "https://autenticacion.udistrital.edu.co:8244/arka_api_crud/v1/",
    CONFIGURACION_SERVICE: "http://10.20.0.254/configuracion_crud_api/v1/",
    CORE_SERVICE: "http://10.20.0.254/core_api/v1/",
    CORE_AMAZON_SERVICE: "http://10.20.0.254/core_amazon_api/v1/",
    FINANCIERA_MID_SERVICE: "http://10.20.0.254/financiera_mid_api/v1/",
    FINANCIERA_SERVICE: "http://10.20.0.254/financiera_api/v1/",
    MODELS_SERVICE: "scripts/models/",
    NOTIFICACION_WS: "ws://10.20.2.134:8080/ws/join",
    OIKOS_SERVICE: "http://10.20.0.254/oikos_api/v1/",
    OIKOS_AMAZON_SERVICE: "http://10.20.0.254/oikos_amazon_api/v1/",
    PAGOS_SERVICE: "http://jbpm.udistritaloas.edu.co:8280/services/academicaProxyService/ingresos_concepto/",
    TITAN_SERVICE: "http://10.20.0.254/titan_api_crud/v1/",
    SICAPITAL_SERVICE: "http://10.20.0.127/sicws/ws/sicapitalAPI.php/?/",
    CONTRATO_SERVICE: "http://jbpm.udistritaloas.edu.co:8280/services/contratoSuscritoProxyService/",
    TOKEN: {
        AUTORIZATION_URL: "https://autenticacion.udistrital.edu.co/oauth2/authorize",
        URL_USER_INFO: "https://autenticacion.udistrital.edu.co/oauth2/userinfo",
        CLIENTE_ID: "iONJ2Rqghur6GOSWyWVUjs1R3Tca",
        REDIRECT_URL: "http://10.20.0.254/argo/",
        RESPONSE_TYPE: "code",
        SCOPE: "openid email",
        BUTTON_CLASS: "btn btn-warning btn-sm",
        SIGN_OUT_URL: "https://autenticacion.udistrital.edu.co/oidc/logout",
        SIGN_OUT_REDIRECT_URL: "http://10.20.0.254/argo/",
        SIGN_OUT_APPEND_TOKEN: "true",
        REFRESH_TOKEN: "https://autenticacion.udistrital.edu.co/oauth2/token",
        CLIENT_SECRET: "5srUXoy2myc4gtZfW3whfqxR5gIa"
    },
};

var conf_local = {
    WSO2_SERVICE: "http://jbpm.udistritaloas.edu.co:8280/services",
    ACADEMICA_SERVICE: "http://10.20.0.127/urano/index.php?data=B-7djBQWvIdLAEEycbH1n6e-3dACi5eLUOb63vMYhGq0kPBs7NGLYWFCL0RSTCu1yTlE5hH854MOgmjuVfPWyvdpaJDUOyByX-ksEPFIrrQQ7t1p4BkZcBuGD2cgJXeD",
    ACADEMICA_WSO_SERVICE: "https://jbpm.udistritaloas.edu.co:8243/services/academicaProxy/",
    ADMINISTRATIVA_MID_SERVICE: "http://10.20.0.254/administrativa_mid_api/v1/",
    ADMINISTRATIVA_SERVICE: "http://10.20.0.254/administrativa_api/v1/",
    ADMINISTRATIVA_PRUEBAS_SERVICE: "http://10.20.0.254/administrativa_amazon_api/v1/",
    ARKA_SERVICE: "http://10.20.0.254/arka_api_crud/v1/",
    CONFIGURACION_SERVICE: "http://10.20.0.254/configuracion_api/v1/",
    CORE_SERVICE: "http://10.20.0.254/core_api/v1/",
    CORE_AMAZON_SERVICE: "http://10.20.0.254/core_amazon_crud/v1/",
    FINANCIERA_MID_SERVICE: "http://10.20.0.254/financiera_mid_api/v1/",
    FINANCIERA_SERVICE: "http://10.20.0.254/financiera_api/v1/",
    MODELS_SERVICE: "scripts/models/",
    NOTIFICACION_WS: "ws://10.20.2.134:8080/ws/join",
    OIKOS_SERVICE: "http://10.20.0.254/oikos_api/v1/",
    OIKOS_AMAZON_SERVICE: "http://10.20.0.254/oikos_amazon_api/v1",
    PAGOS_SERVICE: "http://10.20.0.210/services/academicaProxyService/ingresos_concepto/",
    TITAN_SERVICE: "http://10.20.0.210/titan_api_crud/v1/",
    SICAPITAL_SERVICE: "http://10.20.0.127/sicws/ws/sicapitalAPI.php/?/",
    CONTRATO_SERVICE: "http://jbpm.udistritaloas.edu.co:8280/services/contratoSuscritoProxyService/",
    NUXEO_SERVICE: "https://athento.udistritaloas.edu.co/nuxeo/",
    TOKEN: {
        AUTORIZATION_URL: "https://autenticacion.udistrital.edu.co/oauth2/authorize",
        URL_USER_INFO: "https://autenticacion.udistrital.edu.co/oauth2/userinfo",
        CLIENTE_ID: "pszmROXqfec4pTShgF_fn2DAAX0a",
        REDIRECT_URL: "http://localhost:9000/",
        RESPONSE_TYPE: "code",
        SCOPE: "openid email",
        BUTTON_CLASS: "btn btn-warning btn-sm",
        SIGN_OUT_URL: "https://autenticacion.udistrital.edu.co/oidc/logout",
        SIGN_OUT_REDIRECT_URL: "http://localhost:9000/",
        SIGN_OUT_APPEND_TOKEN: "true",
        REFRESH_TOKEN: "https://autenticacion.udistrital.edu.co/oauth2/token",
        CLIENT_SECRET: "2crHq2IRkFHEVTBfpznLhKHyKVIa"
    },
};

angular.module('contractualClienteApp')
    .constant('CONF', {
        GENERAL: conf_pruebas
    });
