'use strict';

/**
 * @ngdoc directive
 * @name contractualClienteApp.directive:catalogosElementos/listaSubgruposCatalogos
 * @description
 * # catalogosElementos/listaSubgruposCatalogos
 */
angular.module('contractualClienteApp')
    .directive('listaSubgruposCatalogos', function (administrativaRequest, $translate) {
        return {
            restrict: 'E',
            scope: {
                productos: '=?'
            },
            templateUrl: 'views/directives/catalogos_elementos/lista_subgrupos_catalogos.html',
            controller: function ($scope) {
                var self = this;
                $scope.productos = [];
                self.gridOptions = {
                    paginationPageSizes: [5, 10, 15],
                    paginationPageSize: 5,
                    enableRowSelection: true,
                    enableRowHeaderSelection: false,
                    enableFiltering: true,
                    enableHorizontalScrollbar: 0,
                    enableVerticalScrollbar: 0,
                    useExternalPagination: false,
                    enableSelectAll: false,
                    enablePaginationControls: true,
                    columnDefs: [{
                        field: 'ElementoCodigo',
                        displayName: $translate.instant('CODIGO'),
                        headerCellClass: $scope.highlightFilteredHeader + 'text-center text-info',
                        cellTooltip: function (row) {
                            return row.entity.Nombre;
                        }
                    },
                    {
                        field: 'ElementoNombre',
                        displayName: $translate.instant('PRODUCTOS'),
                        headerCellClass: $scope.highlightFilteredHeader + 'text-center text-info',
                        cellTooltip: function (row) {
                            return row.entity.Nombre;
                        }
                    }
                    ]
                };
                self.loadData = function () {
                    //administrativaRequest.get('catalogo_elemento',$.param({
                    administrativaRequest.get('catalogo_elemento_grupo', $.param({
                        fields: 'Id,ElementoNombre,ElementoCodigo',
                        limit: -1,
                        sortby: "ElementoCodigo",
                        order: "asc",
                    })).then(function (response) {
                        self.gridOptions.data = response.data;
                        if ((self.gridOptions.data.length <= self.gridOptions.paginationPageSize || self.gridOptions.paginationPageSize === null) && self.gridOptions.data.length > 0) {
                            $scope.gridHeight = self.gridOptions.rowHeight * 2 + (self.gridOptions.data.length * self.gridOptions.rowHeight);
                            if (self.gridOptions.data.length <= 5) {
                                self.gridOptions.enablePaginationControls = false;
                            }
                        } else {
                            $scope.gridHeight = self.gridOptions.rowHeight * 3 + (self.gridOptions.paginationPageSize * self.gridOptions.rowHeight);
                            self.gridOptions.enablePaginationControls = true;
                        }
                    });
                }
                self.loadData();
                self.gridOptions.onRegisterApi = function (gridApi) {
                    self.gridApi = gridApi;
                    gridApi.selection.on.rowSelectionChanged($scope, function () {
                        $scope.productos.length===0 ? $scope.productos = self.gridApi.selection.getSelectedRows().map(function (e) {
                            return {
                                $$hashKey: e.$$hashKey,
                                ElementoCodigo: e.ElementoCodigo,
                                ElementoNombre: e.ElementoNombre,
                                Id: e.Id,
                                Subtotal: 0,
                                Valor: 0,
                                ValorIVA: 0,
                                preciomasIVA: 0
                            }
                        }) : $scope.productos = self.gridApi.selection.getSelectedRows();
                    });

                };

                $scope.$watch('productos', function () {
                    if ($scope.productos.length === 0 || $scope.productos===[]) {
                        self.gridApi.selection.clearSelectedRows();
                    }
                }, true);





            },
            controllerAs: 'd_listaSubgruposCatalogos'
        };
    });