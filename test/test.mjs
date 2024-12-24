/* global describe, it */
import { chai } from 'environment-safe-chai';
import fs from 'fs';
const should = chai.should();

import { Table as table, Border as border } from '../table.mjs';

function longestLineLength(str){
    return str.split("\n").map(function(str){
         return str.length || 0
    }).reduce(function(a, b){
         return Math.max(a, b)
     })
}

const nByM = (chr, n, m)=>{
    const lines = [];
    for(let row=0; row < n; row++){
        lines.push(chr.repeat(m));
    }
    return lines.join('\n');
}

var tableData = [
    { a : 'a', b : 'b', c : 'c', d : 'd' },
    { a : 'e', b : 'f', c : 'g', d : 'h' },
    { a : 'i', b : 'j', c : 'k', d : 'l' },
    { a : 'm', b : 'n', c : 'o', d : 'p' },
    { a : 'q', b : 'r', c : 's', d : 't' }
];

describe('AsciiArtTable', function(){
    describe('can render', function(){
        
        describe('a border', function(){
            it('with data', function(done){
                const content = nByM('X', 16, 16);
                border.create({
                    content,
                    border : 'single'
                }, function(rendered){
                    const bordered = 
`┏━━━━━━━━━━━━━━━━┓
┃XXXXXXXXXXXXXXXX┃
┃XXXXXXXXXXXXXXXX┃
┃XXXXXXXXXXXXXXXX┃
┃XXXXXXXXXXXXXXXX┃
┃XXXXXXXXXXXXXXXX┃
┃XXXXXXXXXXXXXXXX┃
┃XXXXXXXXXXXXXXXX┃
┃XXXXXXXXXXXXXXXX┃
┃XXXXXXXXXXXXXXXX┃
┃XXXXXXXXXXXXXXXX┃
┃XXXXXXXXXXXXXXXX┃
┃XXXXXXXXXXXXXXXX┃
┃XXXXXXXXXXXXXXXX┃
┃XXXXXXXXXXXXXXXX┃
┃XXXXXXXXXXXXXXXX┃
┃XXXXXXXXXXXXXXXX┃
┗━━━━━━━━━━━━━━━━┛`;
                    rendered.should.equal(bordered);
                    done();
                });
            });
        });
        
        describe('a table', function(){
            it('with data', function(done){
                table.create({
                    columns : ['a', 'b', 'c', 'd'],
                    data : tableData
                }, function(rendered){
                    var sample =
                        "+-+-+-+-+"+"\n"+
                        "|a|b|c|d|"+"\n"+
                        "+-+-+-+-+"+"\n"+
                        "|a|b|c|d|"+"\n"+
                        "|e|f|g|h|"+"\n"+
                        "|i|j|k|l|"+"\n"+
                        "|m|n|o|p|"+"\n"+
                        "|q|r|s|t|"+"\n"+
                        "+-+-+-+-+"+"\n";
                    rendered.should.equal(sample);
                    done();
                });
            });

            it('using headers', function(done){
                 table.create({
                    width : 80,
                    includeHeader: true,
                    data : [ {something : '1', another:'2', athird:'2'} ]
                }, function(rendered){
                    longestLineLength(rendered).should.equal(26);
                    done();
                });
            });

            it('using headers and justification', function(done){
                table.create({
                    width : 80,
                    includeHeader: true,
                    justify: true,
                    data : [ {something : '1', another:'2', athird:'2'} ]
                }, function(rendered){
                    longestLineLength(rendered).should.equal(80);
                    done();
                });
            });

            it.skip('using table styles', function(done){
                table.create({
                     width : 80,
                     data : tableData,
                     bars : 'double',
                     headerStyle : 'yellow',
                     dataStyle : 'bright_white',
                     borderColor : 'gray'
                }, function(rendered){
                    //fs.writeFileSync('foo.nfo', rendered);
                    console.log(rendered);
                    done();
                });
            });

        });

    });
});
/*
\u001b[90m
    
\u001b[90m╔═\u001b[90m╦═\u001b[90m╦═\u001b[90m╦═\u001b[90m╗0
\u001b[90m║03\u001b[90m║03\u001b[90m║03\u001b[90m║03\u001b[90m║0
\u001b[90m╠═\u001b[90m╬═\u001b[90m╬═\u001b[90m╬═\u001b[90m╣0
\u001b[90m║09\u001b[90m║09\u001b[90m║09\u001b[90m║09\u001b[90m║0
\u001b[90m║09\u001b[90m║09\u001b[90m║09\u001b[90m║09\u001b[90m║0
\u001b[90m║09\u001b[90m║09\u001b[90m║09\u001b[90m║09\u001b[90m║0
\u001b[90m║09\u001b[90m║09\u001b[90m║09\u001b[90m║09\u001b[90m║0
\u001b[90m║09\u001b[90m║09\u001b[90m║09\u001b[90m║09\u001b[90m║0
\u001b[90m╚═\u001b[90m╩═\u001b[90m╩═\u001b[90m╩═\u001b[90m╝0
    
//*/
