var canvas, view;
var sc, seed, colseed;
var t, go, capture = false;

var things;
const gap = 15;
const gapRatio = 0.8;
// var grid, cell, cols, rows, margin;
var store = {};

const skw = 1080, skh = 1080;
const cols = 40, rows = 40;
var grid, cell;
var sx, script;
var params;
var zoom = 1;
var stepsPerFrame = 4;

var vid;
var startVid = true;
var recording = false;
var stopVid = false;
var duration = 1200;
// var frameEvery = 2;

// var autoZoom = false;
// var autoZoom = [{start:0, end:1200, from:4, to: 5.5, ease:'IO', pw:2}];
var autoZoom = [
    {start:0, end:600, from:1, to: 4.5, ease:'IO', pw:2},
    // {start:1200, end:1550, from:5.5, to:1, ease:'IO', pw:2}
]

// pasteles Maore Sagarzazu
//var back = [255,239,224];
var back = [50,50,50];
var front = [ [127,112,169], [203,128,45], [193,201,177], [244,165,152], [246,164,28], [162,128,28], [140,156,179] ];
// BN
// var back = [255,255,255];
// var front = [ [0,0,0] ];
// Grey - orange
//var back = [50,50,50];
//var front = [ [255,204,216] ];// [246,164,28] ];
//var front = [ [215,121,137], [217,185,38], [115,181,207] ];
// Otoño
// var back = [247,245,235];
// var front = [ [242,209,104], [165,164,0], [115,95,6], [209,131,4], [92,4,2], [145,168,202]];
// Aleria
//var back = [50,50,50];
// var back = [255,255,255];
// var front = [ [254,181,0], [188,49,15], [145,153,0], [0,158,191], [152,101,178], [224,167,224], [215,121,137]];
// Cielo nocturno
// var back = [51,34,47];
// var front = [ [255,255,204] ];
// hannahinhaiah
// var back = [194,198,180];
// var front = [ [200,112,154], [93,140,150], [123,29,29], [142,163,108] ];

var font;

// function preload() {
//     font = loadFont('./data/calibrib.ttf');
// }


function setup() {
    if(startVid){
        view = createCanvas(skw, skh);
    } else {
        view = createCanvas(int(windowHeight * skw/skh), windowHeight);
    }   
    view.parent('container');

    params = getURLParams();

    sc = 1;
    // cell = gap*2;
    // margin = 200;
    // cols = int((skw+margin*2)/cell)+1;
    // rows = int((skh+margin*2)/cell)+1;
    //console.log(cell, skw, skh, cols, rows);
    cell = {w:skw/cols, h:skh/rows};
    cell.d = min(cell.w, cell.h); //dist(0, 0, cell.w, cell.h);

    sx = scripts.length-1;

    
    
    col_generate();
    generate();
    reset();
}

function generate() {
    seed = 'seed' in params ? parseInt(params.seed) : int(Math.random() * 99999999);
    console.log("SEED", seed);
}

function col_generate() {
    colseed = 'colseed' in params ? parseInt(params.colseed) : int(Math.random() * 99999999);
    console.log("COLSEED", colseed);
    // 82300433
}

function reset() {
    console.log("?seed="+seed+"&colseed="+colseed);

    randomSeed(colseed);
    noiseSeed(colseed);

    csp = new ColorSpace({num:7});
    csp.makeBackAndLine(0.7);
    csp.run(300);

    back = csp.getVal(0);
    console.log(back)
    front = csp.getList(1);

    randomSeed(seed);
    noiseSeed(seed);

    
    canvas = createGraphics(skw*sc, skh*sc);
    canvas.background(back[0], back[1], back[2]);

    //nodes = [];
    things = [];
    store = {};
    spreadLocs = []
    t = 0;
    go = true;

    let def_script = {
        id: "def_id",
        name: "",
        init: function(){},
        update: function(){}
    }

    script = {...def_script, ...scripts[sx]};
    console.log(script.id);
    script.init();

    if(autoZoom){
        zoom = autoZoom[0].from;
    }

    if(startVid) {
        vid = new CCapture({
            format: 'webm',
            framerate:60,
            name: getTimestamp()+'_'+script.id+'_'+String(seed),
            verbose: false,
            display: true,
            quality: 82,
            //autoSaveTime: 120
            //timeLimit: 8
        });
    }

    // console.log("RESET", things.length)
}

function draw() {
    if(startVid) {
        
         vid.start();
         recording = true;
         startVid = false;
         console.log("VID started");
    }

    if(go || step){
        background(255);
        canvas.background(back[0], back[1], back[2]);

        // canvas.stroke(192, 0, 0);
        // canvas.noFill();

        for(let i=0; i<stepsPerFrame; i++){
            makeStep();
        }

        // canvas.stroke(192,0,0);
        // canvas.strokeWeight(5);
        // canvas.noFill();
        // canvas.square(20, 20, canvas.width-40, );

        let zw = width/zoom, zh = height/zoom; 
        //image(canvas, width/2 - zw/2, height/2 - zh/2, zw, zh);
        let ms = int(zoom);
        //console.log('tiles', ms);
        for(let mx=-ms; mx<=ms; mx++){
            for(let my=-ms; my<=ms; my++){
                let px = width/2 - zw/2 + zw * mx;
                let py = height/2 - zh/2  + zh * my;
                image(canvas, px, py, zw, zh);
            }
        }

        if(recording) {
             vid.capture(document.getElementById('defaultCanvas0'));
            //vid.capture(canvas);

            if(stopVid || t == duration) {
                vid.stop();
                vid.save();
                vid = null;
                recording = false;
                stopVid = false;
                console.log("VID finished");
            }
        }

        //if(t>0 && t%600 == 0) go = false;
        if(autoZoom){
            // az = autoZoom;
            // if(t >= az.start && t < az.end){
            //     zoom = lerp(az.from, az.to, ease(az.ease, map(t, az.start, az.end, 0, 1), az.pw))
            // }
            for(let az of autoZoom){
                if(t >= az.start && t < az.end){
                    zoom = lerp(az.from, az.to, ease(az.ease, map(t, az.start, az.end, 0, 1), az.pw))
                }
            }
        }
        

        t++;
        if(t%180 == 1) console.log(t, frameRate());
        step = false;
    }
}

function makeStep() {
    grid = [];
    for(let c=0; c<cols; c++){
        grid[c] = [];
        // canvas.line(cell.w*c*sc, 0, cell.w*c*sc, skh*sc);
        for(let r=0; r<rows; r++){
            grid[c][r] = [];
            // if(c == 0) canvas.line(0, cell.h*r*sc, skw*sc, cell.h*r*sc);
        }
    }

    script.update();

    for(let i=0; i<things.length; i++) things[i].update();

    let d, dif = createVector();
    for(let c=0; c<cols; c++){
        for(let r=0; r<rows; r++){
            let ns = [...grid[c][r]];
            ns.push(...grid[(c+1)%cols][r]);
            ns.push(...grid[c][(r+1)%rows]);
            ns.push(...grid[(c+1)%cols][(r+1)%rows]);
            ns.push(...grid[c-1 < 0 ? cols-1 : c-1][(r+1)%rows]);

            let a, b, dd;
            for(let i=0; i<grid[c][r].length; i++){
                a = grid[c][r][i];
                for(let j=i+1; j<ns.length; j++){
                    b = ns[j];
                    if(a == b) continue;
                    dif.set(a.wpos.x - b.wpos.x, a.wpos.y - b.wpos.y);
                    if(abs(dif.x) > skw/2) dif.x = (skw-abs(dif.x)) * (dif.x > 0 ? -1 : 1);
                    if(abs(dif.y) > skh/2) dif.y = (skh-abs(dif.y)) * (dif.y > 0 ? -1 : 1);
                    d = dif.mag();
                    // dd = a.thing == b.thing ? cell.d/2 : cell.d;
                    dd = (b == a.pv || b == a.nx) ? cell.d*gapRatio : cell.d;
                    //dd = cell.d;

                    if(d < dd){
                        dif.setMag(lerp(5, 0, d/dd));
                        a.vel.add(dif);
                        b.vel.sub(dif);
                    }
                }
            }
        }
    }
}


/******* BASE CLASS FOR TWEENABLE OBJECTS *********/

class Tweenable {
    constructor() {
        this.tweens =  new Set();

        this.mT = 0;
    }

    read(obj, prop, s, df){
        //console.log('read', prop, s, df);
        if (s === undefined || s === null) s = df;
        if (!isNaN(Number(s))) { obj[prop] = Number(s); return; }
        //if (s instanceof Node || 'pass' in s) { obj[prop] = s; return; }
        if(prop == "col"){
            if (Array.isArray(s)) { this.col = s; return; }
            if (typeof s === 'string') { this.col = chroma(s).rgb() }
        }

        s = {src:"t", cv:"pow", cy:1, fr:0, to:100, pw:1, mn:0, mx:1, ph:0, cn:1, v:0.5, vv:0, vi:0, vt:0, lc:0.5, sp:1, nd:0, ...s};
        //console.log("s", s);
        for(let p in s) if(typeof s[p] == "object" && !Array.isArray(s[p])) this.read(s, p, s[p], 0);
        s.obj = obj;
        s.prop = prop;

        if( ['t', 'gt', 'nrm', 'num'].includes(s.src) ) { this.tweens.add(s); return; }
        if(s.src == "rnd") { 
            if(prop == "col") obj["col"] = gradient(s.cs,  this.calcCrv(s, random(1)))
            else obj[prop] = this.calcCrv(s, random(1));
            return;
        }
        if(s.src.startsWith('t-')) {
            let p = s.src.substring(2);
            // if(prop == "col") obj["col"] = gradient(s.cs,  this.calcCrv(s, this.thing[p]))
            obj[prop] = this.calcCrv(s, this.thing[p]);
            return;
        }
        //console.log('^^', s.src, this, this[s.src], this.calcCrv(s, this[s.src]))
        obj[prop] = this.calcCrv(s, this[s.src]);
    }

    // readCol(s) {
    //     if (s === undefined || s === null) { this.col = [...front[0]]; return; }
    //     if (Array.isArray(s)) { this.col = s; return; }
    //     //if (typeof s === 'string') { this.col = chroma(s).rgb(); return; }
    //     if (typeof s === 'string') {
    //         this.col = chroma(s).rgb();
    //         return;
    //     }

    //     s = {src:"t", cv:"pow", cy:1, fr:0, to:100, pw:1, mn:0, mx:1, ph:0, cn:1, v:0.5, vv:0, vi:0, vt:0, lc:0.5, sp:1, ...s};
    //     for(let p in s) if(typeof s[p] == "object" && !Array.isArray(s[p])) this.read(s, p, s[p], 0);
    //     s.obj = this;
    //     s.prop = 'col';

        
    //     if(['t', 'gt', 'nrm', 'num'].includes(s.src)) { this.tweens.add(s); return; }
    //     if(s.src == "rnd") { this.col = gradient(s.cs, this.calcCrv(s, random(1))); return; }
    //     this.col = gradient(s.cs, this.calcCrv(s, this[s.src]));
    // }

    update() {
        for (let tw of this.tweens) this.tween(tw);
        this.mT ++;
    }

    tween(tw) {
        let v = 0;
        
        switch(tw.src) {
            case 't': v = fract(this.mT/tw.to); break;
            case 'gt': v = fract(t/tw.to); break;
            case 'nrm': v = this.nrm; break;
            case 'num': v = this.thing.skin.length; break;
        }
        //console.log(tw.cs, v, this.calcCrv(tw, v))
        

        if(tw.prop == 'col') tw.obj['col'] = gradient(tw.cs, this.calcCrv(tw, v))
        else tw.obj[tw.prop] = this.calcCrv(tw, v);

        if(tw.nd > 0 && this.mT >= tw.nd) this.tweens.delete(tw);
        // console.log(this.mT, tw.to, min(fract(this.mT/tw.to), 0.8), v, tw.obj[tw.prop]);
    }

    calcCrv(c, v) {
        let o = 0;

        if(c.cv == 'fix') { // v
            o = c.v;
        } else if(c.cv == 'pow') { // pw
            v = fract(v*c.cy);
            o = c.pw < 0 ? 1-pow(1-v, abs(c.pw)) : pow(v, c.pw);
        } else if(c.cv == 'wiggle') { // vv
            o = constrain(v + random(-c.vv, c.vv), 0, 0.999999);
        } else if(c.cv == 'circ') { //
            o = cos(asin(v*2-1));
        } else if(c.cv == 'sin') { // ph, pw
            // o = pow(sin(v*TWO_PI*c.cy + (c.ph-0.25)*TWO_PI)*0.5+0.5, c.pw);
            o = pow(sin((c.ph+v)*TWO_PI*c.cy)*0.5+0.5, c.pw);
        } else if(c.cv == 'cos') { // ph, pw
            o = pow(cos((c.ph+v)*TWO_PI*c.cy)*0.5+0.5, c.pw);
        } else if(c.cv == 'half-sin') { // ph, pw
            v = fract(v*c.cy);
            o = pow(sin(fract(c.ph+v)*PI), c.pw);
        } else if(c.cv == 'peak') { // lc, pw
            if(v < c.lc) o = pow( v/c.lc, c.pw );
            else o = pow( map(v, c.lc, 1, 1, 0), c.pw);
        } else if(c.cv == 'bump') { // lc, sp
            if(v > c.lc - c.sp/2 && v < c.lc + c.sp/2) {
                o = sin( map(v, c.lc-c.sp/2, c.lc+c.sp/2, 0, PI) );
            }
        } else if(c.cv == 'noise') { // vv, vi, vt, cn
            o = contrast( noise(c.vv, this.ix/this.thing.skin.length*c.vi, v*c.vt ), c.cn );
        } else if(c.cv == 'noise-pow') { // vv, vi, vt, pw
            o = pow( noise(c.vv, this.ix/this.thing.skin.length*c.vi, v*c.vt ), c.pw );
        } else if(c.cv == "noise-field") { // vv, sc, cn
            o = contrast( noise(c.vv, this.pos.x*c.sc, this.pos.y*c.sc), c.cn );
        } else if(c.cv == "noise-loop") { // vv, sc, cn
            o = contrast( noise(c.vv, 8+c.r*cos(v*PI*2), 8+c.r*sin(v*PI*2)), c.cn );
        } else if(c.cv == 'steps') { // vs, pw
            v = constrain(v, 0, 0.9999);
            let n = floor(v*(c.vs.length-1))
            v = fract(v*(c.vs.length-1));
            let x;
            if(v < 0.5) x = pow(v*2, c.pw) * 0.5;
            else x = (1 - pow(1-(v-0.5)*2, c.pw)) * 0.5 + 0.5;
            o = lerp(c.vs[n], c.vs[n+1], x);
        } else if(c.cv == 'pick') { // vs - Caso especial: retorna el valor sin mapearlo
            v = constrain(v, 0, 0.9999);
            return c.vs[ floor(v*c.vs.length) ];
        } else if(c.cv == 'odd') { // vs - Caso especial: par-impar
            return c.vs[ this.dix % 2 ];
        } else if(c.cv == 'div') { // cy - Caso especial: división sin mapeo
            return int(v/c.cy);
        }

        return c.mn + o * (c.mx-c.mn);
    }
}


/***************** NODE ******************/

class Node extends Tweenable{
    constructor(_th, _cf) {
        super(_cf);

        this.name = String(int(random(999999)));
        store[this.name] = this;

        this.thing = _th;
        this.pv = null;
        this.nx = null;
        this.op = null;
        this.par = null;
        this.group = [];

        this.type = 'type' in _cf ? _cf.type : 'skin';
        if(this.type == 'skin') {
            this.ix = this.thing.skin.length;
            this.thing.skin.push(this);
        } else {
            this.ix = this.thing.bones.length;
            this.thing.bones.push(this);
        }
        this.nrm = 0;
        this.gen = random(1);

        // this.config = {
        //     r: gap,
        //     damp: 0.85,
        //     limit: 12,
        //     sharp: false,
        //     //forces: [],
        //     //... JSON.parse(JSON.stringify(_cf))
        //     ..._cf
        // }

        //({r, damp, limit, sharp, forces} = this.config);
        // this.r = this.config.r;
        // this.damp = this.config.damp;
        // this.limit = this.config.limit;
        this.read(this, 'r', _cf.r, cell.d);
        this.read(this, 'damp', _cf.damp, 0.85);
        this.read(this, 'limit', _cf.limit, 12);
        //this.sharp = this.config.sharp;
        this.forces = [];//this.config.forces;

        this.pos = 'cx' in _cf ? createVector(_cf.cx, _cf.cy) : createVector(random(skw), random(skh));
        this.wpos = createVector(this.pos.x, this.pos.y);
        this.vel = createVector();

        if('forces' in _cf) {
            for(let f of _cf.forces) this.addForce(f);
        }
        

        //console.log(this.ix, this.ix/this.thing.skin.length, this.forces, this.tweens);
        // console.log("***", _cf, this.pos);
    }

    addForce(f) {
        let ff = {
            f:0.01,
            mutual: false,
            name: '',
            since: 0,
            until: 1,
            every: 1,
            ...JSON.parse(JSON.stringify(f))
        } 

        //if(ff.type == 'toCentroid' & this.thing.centroid == null) this.thing.centroid = {x:0, y:0};
        if(ff.name == 'centroid' & this.thing.centroid == null) {
            this.thing.centroid = {pos:{x:0, y:0}};
        } 
        // if(ff.name == 'par' & this.thing.par == null) {
        //     this.thing.par = {pos:{x:0, y:0}};
        // } 

        for(let p in ff) {
            if(p == 'name' && ! ['centroid', 'opposite'].includes(ff[p])) ff.obj = store[ff[p]];
            else if(typeof ff[p] == "object") this.read(ff, p, ff[p], 0);
        }
        this.forces.push(ff);
    }

    
    update(ix = 0) {
        super.update();

        this.ix = ix; //posición actual en la cadena
        this.nrm = this.ix / (this.type == 'skin' ? this.thing.skin.length : this.thing.bones.length);

        // if(this.ix == 0) console.log(this.forces[1])

        // if(this.type == 'centroid'){
        //     let px = 0, py = 0;
        //     for(let nd of this.thing.skin){
        //         px += nd.pos.x; py += nd.pos.y;
        //     }
        //     px /= this.thing.skin.length;
        //     py /= this.thing.skin.length;
        //     this.pos.set(px, py);

        //     //this.mT ++;
        //     return;
        // }

        
        let dif = createVector(), md;
        for(let f of this.forces){
            if(this.ix % f.every != 0 || this.nrm < f.since || this.nrm > f.until) continue;

            if(f.type == "attractor"){
                this.vel.add( (f.x - this.pos.x) * f.f, (f.y - this.pos.y) * f.f );

            } else if(f.type == "wind"){
                this.vel.add( f.f * cos(f.a), f.f * sin(f.a) );

            } else if(f.type == "shake"){
                this.vel.add( random(-f.f, f.f), random(-f.f, f.f) );

            } else if(f.type == "borders" || f.type == "box") {
                if(this.pos.x < this.r) this.vel.x += (this.r-this.pos.x) * f.f;
                if(this.pos.x > skw-this.r) this.vel.x += ((skw-this.r)-this.pos.x) * f.f;
                if(f.type == "borders" && this.pos.y < this.r) this.vel.y += (this.r-this.pos.y) * f.f;
                if(this.pos.y > skh-this.r) this.vel.y += ((skh-this.r)-this.pos.y) * f.f;

            } else if(f.type == "mouse") {
                if(!mouseIsPressed) {
                    md = dist(mouseX*skw/width, mouseY*skh/height, this.pos.x, this.pos.y);
                    if(md < f.range) {
                        this.vel.x -= (mouseX*skw/width - this.pos.x) * (1-md/f.range) * f.f;
                        this.vel.y -= (mouseY*skh/height - this.pos.y) * (1-md/f.range) * f.f;
                    }
                }
            } else if(f.type == "drag") {
                if(mouseIsPressed){
                    md = dist(mouseX*skw/width, mouseY*skh/height, this.pos.x, this.pos.y);
                    if(md < f.range) {
                        this.vel.x += (mouseX*skw/width - this.pos.x) * (1-md/f.range) * f.f;
                        this.vel.y += (mouseY*skh/height - this.pos.y) * (1-md/f.range) * f.f;
                    }
                }
            } else if(f.type == "smooth" && this.type == 'skin') {
                this.vel.x += ((this.pv.pos.x+this.nx.pos.x)/2 - this.pos.x) * f.f;
                this.vel.y += ((this.pv.pos.y+this.nx.pos.y)/2 - this.pos.y) * f.f;

            } else if(f.type == "loop" && this.type == 'skin') {
                dif.set(this.pos.x-this.nx.pos.x, this.pos.y-this.nx.pos.y);
                dif.mult(f.f);
                this.vel.sub(dif);
                this.nx.vel.add(dif);

            } else if(f.type == "local" && this.type == 'skin') {
                let tpv = this.pv;
                for(let i=0; i<f.from+f.reach; i++) {
                    if(i >= f.from) {
                        dif.set(tpv.pos.x-this.pos.x, tpv.pos.y-this.pos.y);
                        md = dif.mag();
                        if(md > 0.01){
                            dif.setMag(f.f / (md*0.2));
                            this.vel.sub(dif);
                            tpv.vel.add(dif);
                        }
                    }
                    
                    tpv = tpv.pv;
                }

            } else if(f.type == "outwards" && this.type == 'skin') {
                //let dif = createVector(this.nx.pos.x-this.pos.x, this.nx.pos.y-this.pos.y);
                let dif = createVector(
                    (this.nx.pos.x-this.pos.x)-(this.pv.pos.x-this.pos.x),
                    (this.nx.pos.y-this.pos.y)-(this.pv.pos.y-this.pos.y),
                );
                dif.rotate( f.cw ? -PI/2 : PI/2 );
                dif.setMag(f.f);
                this.vel.add(dif);

            } else { // fuerzas con target
                if(f.name == 'centroid') f.obj = this.thing.centroid;
                else if(f.name == 'opposite') f.obj = this.op;
                else if(f.name == 'next') {
                    f.obj = this;
                    for(let i=0; i<f.nx; i++) f.obj = f.obj.nx;
                } else if(f.name == 'par') {
                    if(this.par == null) continue;
                    f.obj = this.par;
                }
                //else obj = f.obj;

                dif.set(f.obj.pos.x-this.pos.x, f.obj.pos.y-this.pos.y);
                
                if(f.type == "spring") {
                    md = (f.len - dif.mag()) * f.f;
                    dif.setMag(md);
                    this.vel.sub(dif);
                    if(f.mutual) f.obj.vel.add(dif);

                    // canvas.stroke(255);
                    // canvas.line(this.pos.x*sc, this.pos.y*sc, f.obj.pos.x*sc, f.obj.pos.y*sc);
                    
                } else if(f.type == "push") {
                    md = dif.mag();
                    if(md > 0.01){
                        dif.setMag(f.f / (md*0.2));
                        this.vel.sub(dif);
                        if(f.mutual) f.obj.vel.add(dif);
                    }

                } else if(f.type == "halo") {
                    md = dif.mag();
                    if(md < f.reach) {
                        //dif.setMag( map(d, 0, f.reach, f.f, 0) );
                        dif.setMag( Math.pow(1-md/f.reach, f.pw) * f.f );
                        this.vel.sub(dif);
                        if(f.mutual) f.obj.vel.add(dif);
                    }

                } else if(f.type == "spin") {
                    md = dif.mag();
                    dif.setMag(md*f.f);
                    dif.rotate(HALF_PI);
                    this.vel.sub(dif);
                }
                

            }
        }

        
        this.pos.add(this.vel);
        this.vel.mult(this.damp);
        this.vel.limit(this.limit);

        this.wpos.set(
            this.pos.x > 0 ? this.pos.x % skw : this.pos.x % skw + skw,
            this.pos.y > 0 ? this.pos.y % skh : this.pos.y % skh + skh
        )

        if(this.type == 'skin') {
            //draw
            //if(this.sharp == true) canvas.vertex(this.pos.x*sc, this.pos.y*sc);
            //canvas.curveVertex(this.pos.x*sc, this.pos.y*sc);

            // let cx = int((this.pos.x+margin)/cell), cy = int((this.pos.y+margin)/cell);
            // if(cx >= 0 && cx <= cols && cy >= 0 && cy <= rows) {
            //     if(grid[cx] === undefined){
            //         grid[cx] = [];
            //         grid[cx][cy] = [this];
            //     } else {
            //         if(grid[cx][cy] === undefined){
            //             grid[cx][cy] = [this];
            //         } else {
            //             grid[cx][cy].push(this);
            //         }
            //     }
            // }

            let nrmx = this.pos.x > 0 ? int(this.pos.x / skw) : -ceil(abs(this.pos.x) / skw);
            let nrmy = this.pos.y > 0 ? int(this.pos.y / skh) : -ceil(abs(this.pos.y) / skh);
            this.thing.ghosts.add(nrmx+"_"+nrmy);
            
            // let wx = this.pos.x > 0 ? this.pos.x % skw : this.pos.x % skw + skw;
            // let wy = this.pos.y > 0 ? this.pos.y % skh : this.pos.y % skh + skh;
            let cx = int(this.wpos.x / cell.w) % cols, cy = int(this.wpos.y / cell.h) % rows;
            //let cx = int(this.pos.x / cell.w) % cols, cy = int(this.pos.y / cell.h) % rows;
            // if(cx < 0) cx += cols;
            // if(cy < 0) cy += rows;
            try {
                grid[cx][cy].push(this);
                //if(this.ix == 2) console.log(this.thing.ix, cx, cy)
            } catch(e){
                console.log('XXX', cx, cy);
            }
            
            

        }
        

    }

}


class Thing extends Tweenable {
    constructor(c){
        super(c);

        this.ix = things.length;
        things.push(this);
        this.config = {
            cx: skw/2,
            cy: skh/2,
            wrap: false,
            wrapMargin: 100,
            col: [...front[0]],
            alpha: 255,
            stroke: [...front[0]],
            weight: 0,
            stAlpha: 255,
            ...JSON.parse(JSON.stringify(c))
        };

        this.gen = random(1);
        this.cx = this.config.cx;
        this.cy = this.config.cy;
        this.wrap = this.config.wrap;
        this.wrapMargin = this.config.wrapMargin;
        this.bounds = [999, -999, 999, -999];
        this.centroid = null;
        //this.col = this.config.col;
        this.read(this, 'col', this.config.col, [...front[0]]);
        //console.log('this.config.col', this.config.col)
        //this.readCol(this.config.col)
        //this.col = chroma([255,255,255]).rgb();
        this.alpha = this.config.alpha;
        this.stroke = this.config.stroke;
        this.weight = this.config.weight;
        this.stAlpha = this.config.stAlpha;
        

        this.root;
        this.skin = [];
        this.bones = [];
        this.ghosts = new Set();
        //this.len = 0;
        this.mT = 0;

        //console.log(this.ix, this.col, this.tweens);
    }

    update(){
        super.update();
        this.ghosts.clear();
        this.ghosts.add("0_0");

        if(this.centroid != null) this.findCentroid();

        let ix = 0;
        for(let bn of this.bones){
            bn.update(ix);
            ix ++;
        } 

        canvas.fill(this.col[0], this.col[1], this.col[2], this.alpha);
        //console.log(this.ix, this.col, this.alpha);
        if(this.weight == 0) {
            canvas.noStroke();
        } else {
            canvas.stroke(this.stroke[0], this.stroke[1], this.stroke[2], this.stAlpha);
            canvas.strokeWeight(this.weight*sc);
        }
        //canvas.beginShape();

        if(this.wrap) this.bounds = [999, -999, 999, -999];
        let n = this.root;//, sx = 0, sy = 0;
        ix = 0;
        do {
            n.update(ix);
            //canvas.curveVertex(n.pos.x*sc, n.pos.y*sc);

            if(this.wrap) {
                this.bounds[0] = min(this.bounds[0], n.pos.x);
                this.bounds[1] = max(this.bounds[1], n.pos.x);
                this.bounds[2] = min(this.bounds[2], n.pos.y);
                this.bounds[3] = max(this.bounds[3], n.pos.y);
            }
            //sx += n.pos.x; sy += n.pos.y;
            n = n.nx;
            ix ++;
        } while (n != this.root);
        
        // canvas.curveVertex(this.root.pos.x*sc, this.root.pos.y*sc);
        // canvas.curveVertex(this.root.nx.pos.x*sc, this.root.nx.pos.y*sc);
        // canvas.curveVertex(this.root.nx.nx.pos.x*sc, this.root.nx.nx.pos.y*sc);
        // canvas.endShape();

        //console.log(this.ix, this.ghosts);

        for(let gh of this.ghosts){
            let ofs = gh.split('_')
            let offx = -int(ofs[0]) * skw * sc;
            let offy = -int(ofs[1]) * skh * sc;
            let n = this.root;

            canvas.beginShape();
            do {
                canvas.curveVertex(n.pos.x*sc + offx, n.pos.y*sc + offy);
                n = n.nx;
            } while (n != this.root);

            canvas.curveVertex(this.root.pos.x*sc + offx, this.root.pos.y*sc + offy);
            canvas.curveVertex(this.root.nx.pos.x*sc + offx, this.root.nx.pos.y*sc + offy);
            canvas.curveVertex(this.root.nx.nx.pos.x*sc + offx, this.root.nx.nx.pos.y*sc + offy);
            canvas.endShape();
        }


        // // Mostrar nodos
        // canvas.fill(0, 192, 0);
        // n = this.root;
        // do {
        //     canvas.circle(n.pos.x*sc, n.pos.y*sc, 4*sc);
        //     n = n.nx;
        // } while (n != this.root);

        // this.centroid.x = sx/this.skin.length;
        // this.centroid.y = sy/this.skin.length;
        // canvas.fill(192,0,0,255);
        // canvas.noStroke();
        // canvas.circle(this.centroid.x*sc, this.centroid.y*sc, 6*sc);
        
        if(this.wrap) {
            if(this.bounds[0] > skw+this.wrapMargin) this.translate(-(skw+this.wrapMargin*2), 0);
            if(this.bounds[1] < -this.wrapMargin) this.translate(skw+this.wrapMargin*2, 0);
            if(this.bounds[2] > skh+this.wrapMargin) this.translate(0, -(skh+this.wrapMargin*2));
            if(this.bounds[3] < -this.wrapMargin) this.translate(0, skh+this.wrapMargin*2);
        }

        this.mT ++;
    }

    insertAfter(dad, cf) {
        let neo = new Node(this, {...cf, cx:(dad.pos.x+dad.nx.pos.x)/2, cy:(dad.pos.y+dad.pos.y)/2 });
        neo.pv = dad; neo.nx = dad.nx;
        dad.nx.pv = neo; dad.nx = neo;

        if(dad.op != null) this.findOpposites();
        if(dad.par != null) this.findPares();
    }

    remove(n) {
        n.pv.nx = n.nx;
        n.nx.pv = n.pv;
        this.skin.splice(this.skin.indexOf(n), 1); 
        
        if(n.op != null) this.findOpposites();
        if(n.par != null) this.findPares();
    }

    translate(x, y) {
        for(let bn of this.bones) {
            bn.pos.x += x;
            bn.pos.y += y;
        }

        let n = this.root;
        do {
            n.pos.x += x;
            n.pos.y += y;
            n = n.nx;
        } while (n != this.root);
    }

    findCentroid() {
        let sx = 0, sy = 0;
        let n = this.root;
        do {
            sx += n.pos.x; sy += n.pos.y;
            n = n.nx;
        } while (n != this.root);

        this.centroid.pos.x = sx/this.skin.length;
        this.centroid.pos.y = sy/this.skin.length;
    }

    findOpposites(){
        let oix = floor(this.skin.length/2);
        // let op = this.root;
        // for(let i=0; i<oix; i++) op = op.nx;

        let n = this.root;
        do {
            let op = n;
            for(let i=0; i<oix; i++) op = op.nx;
            n.op = op;
            n = n.nx;
        } while (n != this.root);
    }

    findPares(){
        let q = floor((this.skin.length-1)/2);
        let a = this.root.pv, b = this.root.nx;
        for(let i=0; i<q; i++) {
            a.par = b;
            b.par = a;
            a = a.pv;
            b = b.nx;
        }
    }
}

function pick(arr) {
    return arr[ int(random(arr.length)) ];
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = floor(random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // console.log("SHUFFLE");
}

// function contrast(n, f) {
//     return constrain(f*(n-0.5) + 0.5, 0, 1);
// }

function contrast(n, pw) {
    if(n < 0.5) return pow(n*2, pw) * 0.5;
    return 1 - Math.pow((1-(n-0.5)*2), pw) * 0.5
}

function gradient(cs, v) {
    let scale = chroma.scale(cs).mode('lab');
    //console.log('grad', cs, v)
    return scale(v).rgb();
}

function ease(type, x, p) {
    if(type == "simple") {
        return p < 0 ? 1 - Math.pow(1-x, Math.abs(p)) : Math.pow(x, Math.abs(p));
    } else if (type == "IO") {
        //if(t < 0.5) return easeSimple(t*2, p) * 0.5;
        //else return (1 - easeSimple(1-(t-0.5)*2, p)) * 0.5 + 0.5;
        if(x < 0.5) return (p < 0 ? 1 - Math.pow(1-x*2, Math.abs(p)) : Math.pow(x*2, Math.abs(p))) * 0.5;
        else return (1 - (p < 0 ? 1 - Math.pow(1-(1-(x-0.5)*2), Math.abs(p)) : Math.pow(1-(x-0.5)*2, Math.abs(p)))) * 0.5 + 0.5;
    } else if (type == "hill") {
        x = x < 0.5 ? x * 2 : 1 - (x-0.5)*2;
        return p < 0 ? 1 - Math.pow(1-x, Math.abs(p)) : Math.pow(x, Math.abs(p));
    } else if (type == "sine") {
        return Math.sin(x*p*Math.PI*2) * 0.5 + 0.5;
    } else {
        return x;
    }

}

function getTimestamp(){
    var dateObj = new Date();
    var year = dateObj.getUTCFullYear();
    var month = dateObj.getUTCMonth() + 1; // months from 1-12
    var day = dateObj.getUTCDate();

    return year.toString().substring(2) + month.toString().padStart(2,"0") + day.toString().padStart(2,"0")

}

function keyTyped() {
    if (key === ' ') {
        go = !go;
        console.log("go:", go);
    } else if (key === 'r') {
        reset();
    } else if (key === 'g') {
        generate();
        reset();
    } else if (key === 'G') {
        col_generate();
        reset();
    } else if (key === 'H') {
        generate();
        col_generate();
        reset();
    }  else if (key === '.') {
        step = true;
    } else if (key === 'n') {
        sx ++; sx %= scripts.length;
        reset();
    } else if (key === 'N') {
        sx --; if(sx < 0) sx += scripts.length;
        reset();
    }  else if (key === 's') {
        saveCanvas(canvas, getTimestamp()+'_'+script.id+"_s"+seed +"_cs"+colseed+"_t"+t, "jpg");
        console.log("saveCanvas");
    }  else if (key === 'S') {
        saveCanvas(view, getTimestamp()+'_'+script.id+"_s"+seed +"_cs"+colseed+"_t"+t+"_"+zoom.toFixed(1)+"x", "jpg");
        console.log("save view");
    }  else if (key === 'v') {
        startVid = true;
        reset();
    }  else if (key === 'z') {
        stopVid = true;
    }
}

function mouseWheel(e){
    if(e.delta < 0) zoom = max(1, zoom * 0.9);
    else zoom *= 1.1
}
