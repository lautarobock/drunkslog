(function(exports) {

    function DiffHelper() {
        var ready;
        var result;
        this.excludes = [];

        function parentArray(parent) {
            return {
                parent: parent,
                wrap: function(field) {
                    return parent+"["+field+"]";
                }
            };
        }

        function parentObject(parent) {
            return {
                parent: parent,
                wrap: function(field) {
                    return parent+"."+field;
                }
            };
        }

        this.compareAll = function(obj1,obj2,parent) {
            for( var i in obj1 ) {
                if ( ready.indexOf(i) == -1 ) {
                    ready.push(i);
                    var p;
                    if ( obj1 instanceof Array ) {
                        p = parentArray("$")
                    } else {
                        p = parentObject("$");
                    }
                    this.compare(obj1,obj2,i,parent||p);
                }

            }
        };

        this.compare = function(o1,o2,field,parent) {
            var diff = [];
            if ( o1[field] instanceof Date && o2[field] instanceof Date ) {
                if ( o1[field].getTime() != o2[field].getTime() ) {
                    diff = [parent.wrap(field)];
                }
            } else if ( o1[field] instanceof Array && o2[field] instanceof Array ) {
                var helper = new DiffHelper();
                helper.excludes = this.excludes;
                diff = helper.diff(o1[field],o2[field],parentArray(parent.wrap(field)));
            } else if ( o1[field] instanceof Object && o2[field] instanceof Object ) {
                var helper = new DiffHelper();
                helper.excludes = this.excludes;
                diff = helper.diff(o1[field],o2[field],parentObject(parent.wrap(field)));
            } else if ( o1[field] != o2[field] ) {
                diff = [parent.wrap(field)];
            }
            for ( var i = 0; i<diff.length; i++ ) {
                var fail = false;
                for ( var ri=0; ri<this.excludes.length; ri++) {
                    var reg = new RegExp(this.excludes[ri]);
                    var fail = fail || reg.test(diff[i]);
                }
                if ( !fail ) {
                    result.push(diff[i]);
                }
            }
        };

        this.diff = function(obj1,obj2,parent) {
            ready = [];
            result = [];
            this.compareAll(obj1,obj2,parent);
            this.compareAll(obj2,obj1,parent);
            return result;
        };
    }

    exports.diff = function(obj1,obj2,excludes) {
        var helper = new DiffHelper();
        helper.excludes = excludes || [];
        return helper.diff(obj1,obj2);
    };

    /**
     * Heleper class to manage arrays
     */
    exports.Arrays = {
        remove: function(array,object,comparator) {
            if ( comparator ) {
                var index = -1;
                for ( var i=0; i<array.length; i++) {
                    if ( comparator(object, array[i]) == 0 ) {
                        index = i;
                        break;
                    }
                }
                if ( index !== -1 ) {
                    array.splice(index,1);
                }
                return index;
            } else {
                var index = array.indexOf(object);
                if ( index !== -1 ) {
                    array.splice(index,1);
                }
                return index;
            }
        },
        filter: function(array, comparator) {
            var result = [];
            for (var i=0; i<array.length; i++) {
                if ( comparator(array[i]) == 0 ) {
                    result.push(array[i]);
                }
            }
            return result;
        },
        indexOf: function(array, comparator) {
            var index = [];
            for (var i=0; i<array.length; i++) {
                if ( comparator(array[i]) == 0 ) {
                    return i;
                }
            }
            return -1;
        },
        cross: function(array1, array2) {
            return this.filter(array1, function(item1) {
                return exports.Arrays.filter(array2, function(item2) {
                    return item1 == item2 ? 0 : -1;
                }).length != 0 ? 0 : -1;
            });
        }
    };

    exports.formatDate = function(date,defaultFormatter) {
        date = new Date(date);
        //Fecha de hoy en segundos
        var today = new Date().getTime()/1000;
        //Fecha del comentario en segundos
        var dateSec = date.getTime()/1000;

        //Diferencia en segundos
        var diffSec = today-dateSec;

        if ( diffSec < 0 ) { //En el futuro
            if ( diffSec>-10) {
                return "Ahora";
            } else if ( diffSec>-60) {
                return "En menos de un minuto"
            } else if (diffSec > -(60*60)) { // Si es menos de una hora
                return "En " + Math.round(-diffSec/60) + " minutos";
            } else if ( date.getDate() == new Date().getDate()) { //si aun es el mismo dia, pero mas adelante
                return "En " + Math.floor(-diffSec/60/60) + ":" + exports.pad(Math.floor((-diffSec/60) % 60),2) + " Horas";
            } else if (date.getDate() == new Date().getDate()+1 ) { // Si sera mañana
                return "Mañana " + defaultFormatter(date,'HH:mm');
            }  else {
                return defaultFormatter(date,'dd/MM/yyyy HH:mm');
            }
        } else {// en el pasado
            if (diffSec<10) { // Si es menos de un minuto
                return "Ahora";
            } else if (diffSec<60) { // Si es menos de un minuto
                return "Hace menos de un minuto"
            } else if (diffSec < (60*60)) { // Si es menos de una hora
                return "Hace " + Math.round(diffSec/60) + " minutos";
            } else if (date.getDate() == new Date().getDate()) { //si aun es el mismo dia
                return "Hoy" + " hace " + Math.round(diffSec/60/60) + " horas";
            } else if (date.getDate() == new Date().getDate()-1 ) { // Si fue durane el dia de ayer
                return "Ayer " + defaultFormatter(date,'HH:mm');
            } else {
                return defaultFormatter(date,'dd/MM/yyyy HH:mm');
            }
        }

    };

    var SECOND = 1000;
    var MINUTE = SECOND * 60;
    var HOUR = MINUTE * 60;
    var DAY = HOUR * 24;
    var MONTH = DAY * 30;
    var YEAR = DAY * 365;

    exports.SECOND = SECOND;
    exports.MINUTE = MINUTE;
    exports.HOUR = HOUR;
    exports.DAY = DAY;
    exports.MONTH = MONTH;
    exports.YEAR = YEAR;

    exports.dateDiff = function(from, to) {
        from = new Date(from);
        to = new Date(to);
        var time = from.getTime() - to.getTime();

        var response = '';
        if ( time > 0 ) {
            //Pasado
            response += 'Hace ';
        } else if ( time < 0 ) {
            //Futuro
            response += 'Dentro de ';
            time = -time;
        } else {
            return 'Este mismo momento';
        }




        var years = Math.floor(time / YEAR);
        var yearRest = time % YEAR;
        var months = Math.floor(yearRest / MONTH);
        var monthRest = yearRest % MONTH;
        var days = Math.floor(monthRest / DAY);

        if ( years === 0 && months ===1 && days === 1) {
            response+= ' 1 mes y ' + ' 1 dia.';
        } else if ( years === 0 && months ===1 && days !== 1) {
            response+= ' 1 mes y ' + days + ' dias.';
        } else if ( years === 0 && months !==0 ) {
            response+= months + ' meses y ' + days + ' dias.';
        } else if ( years === 0 && months ===0 && days === 1) {
            response+= ' 1 dia.';
        } else if ( years === 0 && months ===0 && days === 0) {
            return 'Hoy';
        } else if ( years === 0 && months ===0 && days !== 1) {
            response+= days + ' dias.';
        } else if ( years !== 1 && months === 1) {
            response+= years + ' años y ' + ' 1  mes.';
        } else if ( years !== 1 && months > 1) {
            response+= years + ' años y ' + months + ' meses.';
        } else if ( years === 1 && months === 1) {
            response+= ' 1 año y 1 mes.';
        } else if ( years === 1 && months > 1) {
            response+= ' 1 año y ' + months + ' meses.';
        } else if ( years > 1 ){
            response+= years + ' años.';
        } else if ( years === 1 ){
            response+= ' 1 año.';
        }
        return response;
    };

    exports.pad = function(value,zeros) {
        value = value.toString();
        if (value.length > zeros) {
            return value;
        } else {
            var result = value;
            for ( var i=0; i<zeros-value.length; i++) {
                result = "0" + result;
            }
            return result;
        }
    }

})(typeof exports === 'undefined'? this['util'] = {} : exports );
