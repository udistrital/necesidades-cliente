'use strict';

/**
 * @ngdoc service
 * @name contractualClienteApp.terceroCrudService
 * @description
 * # terceroCrudService
 * Service in the contractualClienteApp.
 */
angular.module('terceroCrudService',[])
  .service('terceroCrudRequest', function ($http, $q, token_service, CONF) {
    // Service logic
    // ...
    var path = CONF.GENERAL.TERCEROS_CRUD;
    // Public API here
    var cancelSearch; //defer object
    return {
        get: function(tabla, params) {
            cancelSearch = $q.defer();
            if (params === undefined) {
                return $http.get(path + tabla, [{ timeout: cancelSearch.promise }, token_service.setting_bearer.headers]);
            } else {
                return $http.get(path + tabla, { timeout: cancelSearch.promise, params: params }/*[, token_service.setting_bearer.headers]*/);
            }
        },
        post: function(tabla, elemento) {
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
