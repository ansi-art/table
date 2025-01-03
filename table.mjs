import { Color } from '@ansi-art/color';
import { Ansi } from '@ansi-art/tools';

function columnStatistics(columns, data, includeColumns){
    var result = {};
    columns.forEach(function(column){
        var stats = {
            total : 0,
            count : 0
        };
        if(includeColumns && column.label){
            stats.max = column.label.length;
        }
        data.forEach(function(item){
            var str = (item[column.value]||'')+'';
            stats.count++;
            stats.total += str.length;
            if((!stats.max) || str.length > stats.max){
                stats.max = str.length;
            }
            if((!stats.min) || str.length < stats.min){
                stats.min = str.length;
            }
            stats.average = Math.floor(stats.total/stats.count);
        })
        result[column.value] = stats;
    });
    return result;
}

function columnSizes(width, stats, obj){
    var sizes = [];
    var keys = Object.keys(stats);
    var remainingWidth = width - (keys.length+1);
    var ob = obj;
    keys.forEach(function(key, index){
        var column = stats[key];
        if(ob.headers[index].autosize){
            sizes[index] = undefined;
        }else{
            sizes[index] = column.max;
        }
    });
    var idealWidth = sizes.reduce(sum);
    if(idealWidth > remainingWidth){
        //try to convert column by column to average width until you've
        // tried them all (go backwards (assuming order of importance))
        (function(){
            try{
                var sizeCache = sizes;
                for(var lcv = sizes.length-1; lcv >= 0; lcv--){
                    sizes[lcv] = stats[ob.headers[lcv].value].average;
                    var width = sizes.reduce(sum);
                    if(width <= remainingWidth){
                        var rem = remainingWidth - width;
                        sizes[lcv] += rem;
                        return;
                    };
                }
                sizes = sizeCache;
                throw new Error();
            }catch(err){
                for(var lcv = sizes.length-1; lcv >= 0; lcv--){
                    sizes[lcv] = stats[ob.headers[lcv].value].min;
                    var width = sizes.reduce(sum);
                    if(width <= remainingWidth){
                        var rem = remainingWidth - width;
                        sizes[lcv] += rem;
                        return;
                    };
                }
            }
        })();
    }
    if(ob.options.justify && idealWidth < remainingWidth){
        var diff = remainingWidth - idealWidth;
        var increment = diff / sizes.length;
        var rem = diff % sizes.length;
        sizes = sizes.map(function(size){
            return size + increment;
        });
        //todo: what's right?
        sizes[sizes.length-1] += rem;
    }
    return sizes;
}

function sum(a, b){
    return a + b;
}

var defaultChar = ' ';

function padRTo(text, width, padChar) {
    padChar = padChar || defaultChar;
    text = text + '';
    return text.length >= width ?
        text :
        padR(text, width - text.length, padChar);
}

function padLTo(text, width, padChar) {
    padChar = padChar || defaultChar;
    text = text + '';
    return text.length >= width ?
        text :
        padL(text, width - text.length, padChar);
}

function padR(text, amount, padChar) {
    padChar = padChar || defaultChar;
    text = text + '';
    return text + new Array(amount + 1).join(padChar);
}

function padL(text, amount, padChar) {
    padChar = padChar || defaultChar;
    text = text + '';
    return new Array(amount + 1).join(padChar) + text;
}

function bgFromStyle(style){
    var matches = style && style.match(/([a-z_]+)_bg/g );
    const result = matches && matches
    .map(function(name){
        return name.substring(0, name.length-3);
    })[0];
    return result;
}

const getBars = (barsType)=>{
    switch(barsType){
        case 'single':
            return {
                'ul_corner' : '┏',
                'ur_corner' : '┓',
                'lr_corner' : '┛',
                'll_corner' : '┗',
                'bottom_t' : '┻',
                'top_t' : '┳',
                'right_t' : '┫',
                'left_t' : '┣',
                'intersection' : '╋',
                'vertical' : '┃',
                'horizontal' : '━',
            };
            break;
        case 'double':
            return {
                'ul_corner' : '╔',
                'ur_corner' : '╗',
                'lr_corner' : '╝',
                'll_corner' : '╚',
                'bottom_t' : '╩',
                'top_t' : '╦',
                'right_t' : '╣',
                'left_t' : '╠',
                'intersection' : '╬',
                'vertical' : '║',
                'horizontal' : '═',
            };
            break;
        case 'block':
            return {
                'ul_corner' : '█',
                'ur_corner' : '█',
                'lr_corner' : '█',
                'll_corner' : '█',
                'bottom_t' : '█',
                'top_t' : '█',
                'right_t' : '█',
                'left_t' : '█',
                'intersection' : '█',
                'vertical' : '█',
                'horizontal' : '█',
            };
            break;
        case 'angles':
            return {
                'ul_corner' : '◤',
                'ur_corner' : '◥',
                'lr_corner' : '◢',
                'll_corner' : '◣',
                'bottom_t' : '▲',
                'top_t' : '▼',
                'right_t' : '◀',
                'left_t' : '▶',
                'intersection' : '◆',
                'vertical' : ' ',
                'horizontal' : ' ',
            };
            break;
    }
}

export class Border{
    constructor(opts){
        this.options = (typeof opts === 'string')?{content: opts}:(opts || {});
        if(this.options.border === true) this.options.border = 'single';
        if(!this.options.border) this.options.border = 'single';
        if(typeof this.options.border === 'string'){
            this.options.border = getBars(this.options.border);
        }
    }
    
    buildBorder(content){
        let lines = this.options.content.split('\n');
        const lineWidth = lines[0].length;
        const horiz = this.options.border.horizontal;
        const vert = this.options.border.vertical;
        const border = this.options.border;
        lines = lines.map((line)=> vert+line+vert);
        const horizontalLine = horiz.repeat(lineWidth);
        return border.ul_corner+horizontalLine+border.ur_corner+'\n'+
            lines.join('\n')+'\n'+
            border.ll_corner+horizontalLine+border.lr_corner;
    }
    
    toString(){
        return this.buildBorder(this.options.content);
    }
}

Border.create = (options, callback)=>{
    const instance = new Border(options);
    const result = instance.toString();
    if(callback) callback(result);
    return result;
}

export const Table = function(options={}){
    this.options = options || {};
    if(!this.options.ansi){
        this.options.ansi = this.options.color?
            new Ansi(this.options.color):
            (
                this.options.bitDepth?
                new Ansi(new Color(this.options.bitDepth)):
                new Ansi(new Color('4bit'))
            )
    }
    var ob = this;
    if(this.options.bars){
        if(this.options.bars === true) this.options.bars = 'single';
        if(typeof this.options.bars == 'string'){
            this.options.bars = getBars(this.options.bars);
        }
        var bars = this.options.bars;
        this.getBoundaryChar = function(t, l, b, r){
            if(t && l && b && r) return bars.intersection;
            //Ts
            if(t && l && b) return bars.right_t;
            if(t && l && r) return bars.bottom_t;
            if(t && b && r) return bars.left_t;
            if(l && b && r) return bars.top_t;

            //Corners
            if(l && b) return bars.ur_corner;
            if(t && l) return bars.lr_corner;
            if(t && r) return bars.ll_corner;
            if(b && r) return bars.ul_corner;

            //Straights
            if(l && r) return bars.horizontal;
            if(t && b) return bars.vertical;
        }
    }else{
        if(!this.options.verticalBar) this.options.verticalBar = '|';
        if(!this.options.horizontalBar) this.options.horizontalBar = '-';
        if(!this.options.intersection) this.options.intersection = '+';
        this.getBoundaryChar = function(t, l, b, r){
            var isVert = (t || b);
            var isHoriz = (l || r);
            if(isVert && isHoriz){
                return ob.options.intersection;
            }else{
                if(isVert) return ob.options.verticalBar;
                if(isHoriz) return ob.options.horizontalBar;
            }
        }
    }
    this.headers = [];
    this.data = [];
};

Table.newReturnContext = function(options){
    return new Promise(function(resolve, reject){
        try{
            AsciiArt.Table.create(options, function(rendered){
                resolve(rendered);
            });
        }catch(ex){
            reject(ex);
        }
    });
}

Table.create = function(options, callback){
    if(!callback){
        return Table.newReturnContext(options);
    }else{
        var opts = {};
        [
            'intersection', 'horizontalBar', 'verticalBar',
            'dataStyle', 'headerStyle', 'bars', 'cellStyle',
            'borderColor', 'includeHeader', 'justify'
        ].forEach(function(opt){
            opts[opt] = options[opt];
        })
        var table = new Table(opts);
        var fields = options.columns || Object.keys(options.data[0] ||{});
        table.setHeading.apply(table, fields);
        table.data = options.data;
        var result = table.write(
            options.width ||
            (
                process &&
                process.stdout &&
                process.stdout.columns
            ) || 80
        );
        callback(result);
    }
}

Table.prototype.write = function(width){
    var ob = this;
    if(Array.isArray(ob.data[0])){
        //convert to object
        ob.data = ob.data.map(function(arr){
            var result = {};
            ob.headers.forEach(function(header, index){
                result[header.value] = arr[index];
            });
            return result;
        })
    }
    var stats = columnStatistics(this.headers, this.data, this.options.includeHeader);
    var sizes = columnSizes(width, stats, this);
    //RENDER!!!
    var result = '';
    var y = true;
    var n = false;
    var fillerChar = '%';
    var horizontalRule = function(styleHandler, top, bottom){
        var rule = '';
        var t = !top;
        var b = !bottom;
        ob.headers.forEach(function(header, index){
            var f = index !== 0?true:false;
            var c = ob.getBoundaryChar(t, f, b, y);
            if(ob.options.borderColor) c = ob.options.ansi.codes(
                c, ob.options.borderColor, false
            );
            var line = c + padRTo(
                '', sizes[index], ob.getBoundaryChar(n, y, n, y)
            );
            if(styleHandler){
                styleHandler(header, index, function(style){
                    if(style){
                        line = this.options.ansi.codes(line, style, true);
                    }
                });
            }
            rule += line;
        });
        var chr = ob.getBoundaryChar(t, y, b, n);
        if(ob.options.borderColor) chr = ob.options.ansi.codes(
            chr, ob.options.borderColor, true
        );
        var pos = ob.headers.length-1;
        if(styleHandler){
            styleHandler(ob.headers[pos], pos, function(style){
                var backgroundColor = bgFromStyle(style);
                if(style){
                    var s = style;
                    var c = chr;
                    if(backgroundColor && !c.trim()){
                        c = 'X';
                        s = style+'+'+backgroundColor
                    }
                    rule += this.options.ansi.codes(c, s, true);
                }else{
                    rule += chr;
                }
            });
        }else{
            rule += chr;
        }
        rule += "\n";
        return rule;
    }

    var horizontalRuleStylerMaker = function(styleGetter){
        return function(column, index, done){
            var style = styleGetter(column, index);
            var backgroundColor = bgFromStyle(style);
            if(backgroundColor) done(backgroundColor+'_bg');
            else done();
        }
    }
    if(ob.options.drawRules !== false){
        result += horizontalRule(horizontalRuleStylerMaker(function(header, i, row){
            return (header && (
                header.headerStyle ||
                ob.options.headerStyle ||
                header.style
            ));
        }), true);
    }
    var lastBG;
    var vb = ob.getBoundaryChar(y, n, y, n);
    ob.headers.forEach(function(header, index){
        var line = vb;
        if(ob.options.borderColor) line = ob.options.ansi.codes(
            line, ob.options.borderColor, true
        );
        var value = header.label;
        var backgroundColor;
        var style = header.headerStyle ||
            ob.options.headerStyle ||
            header.style ||
            ob.options.cellStyle;
        if(style){
            backgroundColor = bgFromStyle(style);
            value = ob.options.ansi.codes(value, style, true);
            if(backgroundColor)
                line = ob.options.ansi.codes(line, backgroundColor+'_bg', true);
        }
        var length = ob.options.ansi.length(value);
        if(length > sizes[index]){
            line += ob.options.ansi.trimTo(value, sizes[index]);
        }else{
            line += padR(
                value,
                sizes[index] - length,
                backgroundColor?this.options.ansi.codes(
                    '.', style+'+'+backgroundColor, true
                ):' '
            );
        }
        result += line;
        lastBG = backgroundColor;
    });
    if(!lastBG){
        if(ob.options.borderColor){
            result += ob.options.ansi.codes(
                vb, ob.options.borderColor, true
            )+"\n";;
        }else{
            result += vb+"\n";
        }
    }else{
        var c = vb;
        if(ob.options.borderColor) c = this.options.ansi.codes(
            c, ob.options.borderColor, true
        );
        result += ob.options.ansi.codes(c, lastBG+'_bg', true)+"\n";
    }
    if(ob.options.drawRules !== false){
        result += horizontalRule(horizontalRuleStylerMaker(function(header, i, row){
            return (header && (
                header.headerStyle ||
                ob.options.headerStyle ||
                header.style
            ));
        }));
    }
    ob.data.forEach(function(item){
        ob.headers.forEach(function(header, index){
            var style = header.style ||
                ob.options.dataStyle ||
                ob.options.cellStyle;
            var line = vb;
            if(ob.options.borderColor) line = ob.options.ansi.codes(
                line, ob.options.borderColor, true
            );
            var value = item[header.value] || '';
            var backgroundColor;
            if(style){
                backgroundColor = bgFromStyle(style);
                value = ob.options.ansi.codes(value, style, true);
                if(backgroundColor)
                    line = ob.options.ansi.codes(line, backgroundColor+'_bg', true);
            }
            var length = ob.options.ansi.length(value);
            if(length > sizes[index]){
                line += ob.options.ansi.trimTo(value, sizes[index]);
            }else{
                line += padR(
                    value,
                    sizes[index] - length,
                    backgroundColor?ob.options.ansi.codes(
                        'X', style+'+'+backgroundColor, true
                    ):' '
                );
            }
            result += line;
        });
        if(ob.options.borderColor){
            result += ob.options.ansi.codes(
                vb, ob.options.borderColor, true
            )+"\n";
        }else{
            result += vb+"\n";
        }
    });
    if(ob.options.drawRules !== false){
        result += horizontalRule(horizontalRuleStylerMaker(function(header, i, row){
            return (header && header.style);
        }), false, true);
    }
    return result;
}

Table.prototype.toString = function(){
    return this.write(80);
}

Table.prototype.setHeading = function(){
    var headers = Array.prototype.slice.apply(arguments);
    var ob = this;
    headers.forEach(function(header){
        ob.addColumn(header);
    });
}

Table.prototype.addRow = function(){
    var values = Array.prototype.slice.apply(arguments);
    var ob = this;
    var row = {};
    values.forEach(function(value, index){
        row[ob.headers[index].value] = value;
    });
    this.add(row);
}

Table.prototype.add = function(item){
    this.data.push(item);
}

Table.prototype.addColumn = function(options){
    if(typeof options == 'string') options = {
        value : options,
        label : options,
    };
    if(options.value && !options.label) options.label = options.value;
    this.headers.push(options);
}