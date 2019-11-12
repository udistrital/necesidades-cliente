'use strict';

/**
 * @ngdoc service
 * @name contractualClienteApp.planCuentasMid
 * @description
 * # planCuentasMid
 * Service in the contractualClienteApp.
 */
angular.module('planCuentasMidService',[])
  .service('planCuentasMidRequest', function ($http, $q, token_service, CONF) {
    // Service logic
    // ...
    var path = CONF.GENERAL.PLAN_CUENTAS_MID_SERVICE;
    // Public API here
    var cancelSearch; //defer object
    return {
        get: function(tabla, params) {
            cancelSearch = $q.defer();
            if (params === undefined) {
                return $http.get(path + tabla, [{ timeout: cancelSearch.promise }, token_service.setting_bearer.headers]);
            } else {
                return $http.get(path + tabla + "/?" + params, [{ timeout: cancelSearch.promise }, token_service.setting_bearer.headers]);
            }
        },
        post: function(tabla, elemento) {
            console.info("da heds", token_service.setting_bearer.headers)
            return $http.post(path + tabla, elemento, token_service.setting_bearer.headers);
        },
        put: function(tabla, id, elemento) {
            return $http.put(path + tabla + "/" + id, elemento, token_service.setting_bearer.headers);
        },
        delete: function(tabla, id) {
            return $http.delete(path + tabla + "/" + id, token_service.setting_bearer.headers);
        },
        cancel: function() {
            return cancelSearch.resolve('search aborted');
        }
    };
  });
