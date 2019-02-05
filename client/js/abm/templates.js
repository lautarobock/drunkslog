define([], function() {  	angular.module("gt.abm.templates", []).run(["$templateCache", function($templateCache) {   'use strict';

  $templateCache.put('abm/abm-combo.html',
    "<select class=\"form-control input-sm\"\n" +
    "        ng-model=\"value[header.field]\"\n" +
    "        ng-options=\"value for value in header.data\">\n" +
    "</select>"
  );


  $templateCache.put('abm/abm-filter-combo.html',
    "<div class=\"col-sm-{{filter.colSpan||config().filterColSpan||'12'}}\" style=\"margin-bottom: 1em;\">\n" +
    "    <label for=\"{{filterName}}_id\">{{filter.caption}}</label>\n" +
    "    <div class=\"input-group\">\n" +
    "        <select \n" +
    "            ng-options=\"value._id as filter.getLabel(value) group by filter.groupBy(value) for value in filter.data | orderBy:filter.orderBy\" \n" +
    "            class=\"form-control input-sm\" \n" +
    "            id=\"{{filterName}}_id\" \n" +
    "            ng-model=\"filter.value\"></select>\n" +
    "        <span class=\"input-group-btn\">\n" +
    "            <button ng-click=\"filter.value=''\" class=\"btn btn-default btn-sm\" type=\"button\">\n" +
    "                <span class=\"glyphicon glyphicon-remove\"></span>\n" +
    "            </button>\n" +
    "        </span>\n" +
    "    </div>\n" +
    "</div>"
  );


  $templateCache.put('abm/abm-input.html',
    "<input type=\"{{header.type||'text'}}\" step=\"{{header.step}}\" class=\"form-control input-sm\" ng-model=\"value[header.field]\"/>"
  );


  $templateCache.put('abm/abm-value-checkbox.html',
    "<span ng-show=\"getValue(row,header)\" class=\"glyphicon glyphicon-check\"/>\n" +
    "<span ng-hide=\"getValue(row,header)\" class=\"glyphicon glyphicon-unchecked\"/>"
  );


  $templateCache.put('abm/abm.html',
    "<div class=\"panel panel-default\">\n" +
    "    <style>\n" +
    "        .gt-sorted {\n" +
    "            cursor: pointer\n" +
    "        }\n" +
    "\n" +
    "        .gt-sorted:hover {\n" +
    "            text-decoration: underline;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <div class=\"panel-body\" ng-hide=\"hideSearch\">\n" +
    "        <div class=\"col-md-10\" style=\"padding-top: 5px;\" >\n" +
    "            <span ng-class=\"{invisible:loading}\" >\n" +
    "                <ng-pluralize count=\"(rows | textFilter:searchCriteria | advanced:filterData).length\"\n" +
    "                              when=\"{'0':'No se ha encontrado ningun resultado con su busqueda','one': '1 ' +config().singular+ ' encontrada','other':'{} '+config().name+' encontradas'}\"></ng-pluralize>\n" +
    "            </span>\n" +
    "        </div>\n" +
    "        <div class=\"col-md-2\" >\n" +
    "            <a ng-show=\"searchCriteria=='' && canAdd\" ng-click=\"addNew()\" href=\"\" type=\"button\" class=\"btn btn-default btn-sm pull-right\">\n" +
    "                <span class=\"glyphicon glyphicon-plus\"></span> nuevo\n" +
    "            </a>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <!-- ADVANCED SEARCH -->\n" +
    "    <div class=\"panel panel-default\" style=\"margin: 0 1em\" ng-hide=\"hideSearch\">\n" +
    "        <div class=\"panel-body\">\n" +
    "            <div class=\"row\">\n" +
    "                <div class=\"col-sm-{{config().filterColSpan||'12'}}\" style=\"margin-bottom: 1em;\">\n" +
    "                    <label for=\"filter.name\">{{config().filterLabel}}</label>\n" +
    "                    <div class=\"input-group\" style=\"width: 100%\">\n" +
    "                        <input ng-change=\"search()\" type=\"text\" id=\"filter.name\"  class=\"form-control input-sm\" ng-model=\"_searchCriteria\" placeholder=\"({{'side.search.fields'|translate}})\" autocomplete=\"off\" />\n" +
    "                        <span class=\"input-group-btn\">\n" +
    "                            <button ng-disabled=\"searchCriteria==''\"  ng-click=\"clearSearch()\" class=\"btn btn-default btn-sm\" type=\"button\">\n" +
    "                                <span class=\"glyphicon glyphicon-remove\"></span>\n" +
    "                            </button>\n" +
    "                        </span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div ng-repeat=\"_value in config().filterOrder\" ng-init=\"filterName=_value; filter=filterData[_value]\">\n" +
    "                    <ng-include src=\"urlTemplate(filter)\"></ng-include>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <!-- END ADVANCED SEARCH -->\n" +
    "    <div class=\"panel-body\" ng-show=\"loading\">\n" +
    "        <center><span class=\"glyphicon glyphicon-refresh\"></span></center>\n" +
    "    </div>\n" +
    "    <div class=\"panel-body\" ng-show=\"((rows | textFilter:searchCriteria | advanced:filterData).length == 0) && !loading\">\n" +
    "        <div class=\"alert alert-info\" >\n" +
    "            {{emptyResultText}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ng-show=\"((rows | textFilter:searchCriteria | advanced:filterData).length > 0) && !loading\">\n" +
    "        <table class=\"table table-striped table-hover\" >\n" +
    "            <thead>\n" +
    "                <tr>\n" +
    "                    <th ng-click=\"sort.resort(header.field, header.sort)\"\n" +
    "                        class=\"gt-sorted\"\n" +
    "                        ng-class={'hidden-xs':header.hidden.xs,'hidden-sm':header.hidden.sm}\n" +
    "                        ng-repeat=\"header in config().headers\"\n" +
    "                        ng-style=\"getHeaderStyle(header)\">\n" +
    "                        <span tooltip=\"{{header.tooltip}}\" tooltip-append-to-body=\"true\">\n" +
    "                            {{header.caption}}\n" +
    "                        </span> <span ng-class=\"sort.orderStyle[header.field]\"></span>\n" +
    "                    </th>\n" +
    "                    <th style=\"width: 1em\"></th>\n" +
    "                    <th style=\"width: 1em\"></th>\n" +
    "                </tr>\n" +
    "            </thead>\n" +
    "            <tbody>\n" +
    "                <tr ng-init=\"value=copy(row)\" ng-repeat=\"row in rows | orderBy:sort.orderBy():sort.reverse() | textFilter:searchCriteria | advanced:filterData | pageFilter:page:pageSize() \">\n" +
    "                    <td ng-repeat=\"header in config().headers\" ng-class={'hidden-xs':header.hidden.xs,'hidden-sm':header.hidden.sm} title=\"{{header.title(row)}}\">\n" +
    "                        <ng-include src=\"valueTemplate(row,header)\"></ng-include>\n" +
    "                    </td>\n" +
    "                    <!-- BUTTONS -->\n" +
    "                    <td>\n" +
    "                        <a ng-show=\"!isEditing(row) && canEdit\" ng-click=\"edit(row)\" href=\"\" type=\"button\" class=\"btn btn-primary btn-xs\">editar</a>\n" +
    "                        <a ng-show=\"isEditing(row)\" ng-click=\"save(value,row)\" href=\"\" type=\"button\" class=\"btn btn-success btn-xs\">guardar</a>\n" +
    "                    </td>\n" +
    "                    <td>\n" +
    "                        <a ng-show=\"!isEditing(row) && canRemove\" ng-click=\"remove(row)\" href=\"\" type=\"button\" class=\"btn btn-danger btn-xs\">eliminar</a>\n" +
    "                        <a ng-show=\"isEditing(row)\" ng-click=\"cancel(row,value)\" href=\"\" type=\"button\" class=\"btn btn-warning btn-xs\">cancelar</a>\n" +
    "                    </td>\n" +
    "                </tr>\n" +
    "            </tbody>\n" +
    "        </table>\n" +
    "        <div class=\"container\">\n" +
    "            <pagination boundary-links=\"true\" total-items=\"(rows | textFilter:searchCriteria | advanced:filterData).length\" items-per-page=\"pageSize()\" page=\"page\" max-size=\"10\" class=\"pagination-small\" previous-text=\"&lsaquo;\" next-text=\"&rsaquo;\" first-text=\"&laquo;\" last-text=\"&raquo;\"></pagination>\n" +
    "            <div style=\"white-space: pre-wrap;box-sizing: border-box;\">{{(page-1)*pageSize() + 1}} - <span ng-hide=\"page == getPageCount((rows | textFilter:searchCriteria | advanced:filterData).length)\">{{page*pageSize()}}</span><span ng-show=\"page == getPageCount((rows | textFilter:searchCriteria | advanced:filterData).length)\">{{(rows | textFilter:searchCriteria | advanced:filterData).length}}</span> de {{(rows | textFilter:searchCriteria | advanced:filterData).length}}</div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"panel-body\">\n" +
    "        <div class=\"col-md-12\" >\n" +
    "            <a ng-show=\"searchCriteria=='' && canAdd\" ng-click=\"rows.push({_draft:true})\" href=\"\" type=\"button\" class=\"btn btn-default btn-sm pull-right\">\n" +
    "                <span class=\"glyphicon glyphicon-plus\"></span> nuevo\n" +
    "            </a>\n" +
    "        </div>\n" +
    "    </div>    \n" +
    "</div>"
  );
	}]); });